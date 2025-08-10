const { EventEmitter } = require('events');
const moment = require('moment');
const Redis = require('redis');
const iaERPEngine = require('./iaERPEngine');
const integrationEngine = require('./integrationEngine');

class ERPCoreService extends EventEmitter {
    constructor() {
        super();
        this.redis = Redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379
        });
        this.iaEngine = iaERPEngine;
        this.integrationEngine = integrationEngine;
        this.cache = new Map();
        this.inicializar();
    }

    async inicializar() {
        try {
            await this.redis.connect();
            await this.iaEngine.inicializarModelos();
            console.log('🚀 ERP Core Service inicializado com sucesso');
            this.emit('service_ready');
        } catch (error) {
            console.error('❌ Erro ao inicializar ERP Core Service:', error);
        }
    }


    async criarEmpresa(dadosEmpresa) {
        try {
            const {
                razaoSocial,
                nomeFantasia,
                cnpj,
                endereco,
                regimeTributario = 'simples_nacional',
                configuracoesFiscais = {}
            } = dadosEmpresa;

            await this.validarCNPJ(cnpj);

            const dadosReceita = await this.buscarDadosReceitaFederal(cnpj);

            const empresa = {
                id: Date.now(),
                razaoSocial: dadosReceita.razaoSocial || razaoSocial,
                nomeFantasia: dadosReceita.nomeFantasia || nomeFantasia,
                cnpj: this.limparCNPJ(cnpj),
                inscricaoEstadual: dadosReceita.inscricaoEstadual,
                endereco: dadosReceita.endereco || endereco,
                regimeTributario,
                configuracoesFiscais: {
                    ...configuracoesFiscais,
                    validadoReceitaFederal: true,
                    dataValidacao: new Date()
                },
                atividadePrincipal: dadosReceita.cnaePrincipal,
                atividadesSecundarias: dadosReceita.cnaesSecundarios || [],
                capitalSocial: dadosReceita.capitalSocial || 0,
                dataAbertura: dadosReceita.dataAbertura,
                porte: dadosReceita.porte || 'micro',
                criadoEm: new Date()
            };

            await this.criarEstruturaInicialEmpresa(empresa.id);

            await this.configurarIntegracoesBasicas(empresa.id);

            await this.iaEngine.inicializarEmpresa(empresa.id);

            await this.redis.setex(`empresa:${empresa.id}`, 3600, JSON.stringify(empresa));

            this.emit('empresa_criada', { empresa });
            return empresa;

        } catch (error) {
            console.error('Erro ao criar empresa:', error);
            throw error;
        }
    }

    async criarEstruturaInicialEmpresa(empresaId) {
        await this.criarPlanoContasPadrao(empresaId);
        
        await this.criarCentrosCustoPadrao(empresaId);
        
        await this.criarFilialMatriz(empresaId);
        
        await this.configurarParametrosFiscais(empresaId);
    }


    async gerarFluxoCaixaPreditivo(empresaId, diasProjecao = 90) {
        try {
            const cacheKey = `fluxo_caixa:${empresaId}:${diasProjecao}`;
            const cached = await this.redis.get(cacheKey);
            
            if (cached) {
                return JSON.parse(cached);
            }

            const dataInicio = new Date();
            const dataFim = moment().add(diasProjecao, 'days').toDate();

            const [
                contasReceber,
                contasPagar,
                historicoVendas,
                sazonalidade
            ] = await Promise.all([
                this.obterContasReceberFuturas(empresaId, dataFim),
                this.obterContasPagarFuturas(empresaId, dataFim),
                this.obterHistoricoVendas(empresaId, 365),
                this.analisarSazonalidade(empresaId)
            ]);

            const projecaoVendas = await this.iaEngine.preverVendas({
                empresaId,
                historicoVendas,
                sazonalidade,
                diasProjecao
            });

            const projecaoRecebimentos = await this.iaEngine.preverRecebimentos({
                contasReceber,
                historicoRecebimentos: await this.obterHistoricoRecebimentos(empresaId)
            });

            const fluxo = [];
            let saldoAcumulado = await this.obterSaldoAtual(empresaId);

            for (let i = 0; i <= diasProjecao; i++) {
                const data = moment().add(i, 'days').toDate();
                const dataStr = moment(data).format('YYYY-MM-DD');

                const recebimentosData = contasReceber
                    .filter(c => moment(c.dataVencimento).format('YYYY-MM-DD') === dataStr)
                    .reduce((sum, c) => sum + parseFloat(c.valorAtual), 0);

                const vendasProjetadas = projecaoVendas.previsaoDiaria || 0;

                const pagamentosData = contasPagar
                    .filter(c => moment(c.dataVencimento).format('YYYY-MM-DD') === dataStr)
                    .reduce((sum, c) => sum + parseFloat(c.valorAtual), 0);

                const entradaTotal = recebimentosData + vendasProjetadas;
                const saidaTotal = pagamentosData;
                saldoAcumulado += (entradaTotal - saidaTotal);

                fluxo.push({
                    data: dataStr,
                    entradas: {
                        recebimentos: recebimentosData,
                        vendasProjetadas,
                        total: entradaTotal
                    },
                    saidas: {
                        pagamentos: pagamentosData,
                        total: saidaTotal
                    },
                    saldoAcumulado,
                    confiabilidade: this.calcularConfiabilidadeProjecao(i, diasProjecao)
                });
            }

            const analiseRisco = await this.analisarRiscoFluxo(fluxo);
            const recomendacoes = await this.iaEngine.gerarRecomendacoesFluxo(fluxo, analiseRisco);

            const resultado = {
                fluxo,
                analiseRisco,
                recomendacoes,
                resumo: {
                    saldoAtual: await this.obterSaldoAtual(empresaId),
                    saldoProjetado: saldoAcumulado,
                    maiorSaldo: Math.max(...fluxo.map(f => f.saldoAcumulado)),
                    menorSaldo: Math.min(...fluxo.map(f => f.saldoAcumulado)),
                    diasSaldoNegativo: fluxo.filter(f => f.saldoAcumulado < 0).length,
                    alertas: analiseRisco.alertas
                },
                geradoEm: new Date(),
                algoritmo: 'LSTM_Prophet_Ensemble'
            };

            await this.redis.setex(cacheKey, 3600, JSON.stringify(resultado));

            this.emit('fluxo_caixa_gerado', { empresaId, resultado });
            return resultado;

        } catch (error) {
            console.error('Erro ao gerar fluxo de caixa preditivo:', error);
            throw error;
        }
    }

    async conciliacaoBancariaIA(empresaId, bancoContaId, periodo) {
        try {
            const [
                extratoBancario,
                lancamentosContabeis,
                padroesConciliacao
            ] = await Promise.all([
                this.obterExtratoBancario(bancoContaId, periodo),
                this.obterLancamentosContabeis(empresaId, periodo),
                this.obterPadroesConciliacao(empresaId)
            ]);

            const matchingIA = await this.iaEngine.executarMatchingConciliacao({
                extratoBancario,
                lancamentosContabeis,
                padroes: padroesConciliacao
            });

            const conciliacaoAutomatica = [];
            const pendentesAnalise = [];

            for (const match of matchingIA) {
                if (match.confianca >= 0.95) {
                    await this.executarConciliacao(match.extratoItem, match.lancamento);
                    conciliacaoAutomatica.push(match);
                } else if (match.confianca >= 0.7) {
                    pendentesAnalise.push(match);
                }
            }

            const discrepancias = await this.identificarDiscrepancias(
                extratoBancario,
                lancamentosContabeis,
                matchingIA
            );

            const resultado = {
                conciliacaoAutomatica,
                pendentesAnalise,
                discrepancias,
                estatisticas: {
                    totalExtratoItens: extratoBancario.length,
                    totalLancamentos: lancamentosContabeis.length,
                    matchesAutomaticos: conciliacaoAutomatica.length,
                    pendenteRevisao: pendentesAnalise.length,
                    discrepanciasEncontradas: discrepancias.length,
                    taxaConciliacao: (conciliacaoAutomatica.length / extratoBancario.length * 100).toFixed(2)
                },
                processadoEm: new Date(),
                algoritmo: 'Neural_Fuzzy_Matching'
            };

            this.emit('conciliacao_executada', { empresaId, resultado });
            return resultado;

        } catch (error) {
            console.error('Erro na conciliação bancária:', error);
            throw error;
        }
    }


    async previsaoDemandaIA(produtoId, diasPrevisao = 60) {
        try {
            const cacheKey = `demanda:${produtoId}:${diasPrevisao}`;
            const cached = await this.redis.get(cacheKey);
            
            if (cached) {
                return JSON.parse(cached);
            }

            const historicoVendas = await this.obterHistoricoVendasProduto(produtoId, 365);
            
            const sazonalidade = await this.analisarSazonalidadeProduto(produtoId);
            
            const fatoresExternos = await this.obterFatoresExternos(produtoId);

            const previsao = await this.iaEngine.preverDemanda({
                produtoId,
                historicoVendas,
                sazonalidade,
                fatoresExternos,
                diasPrevisao
            });

            const pontoReposicao = await this.calcularPontoReposicaoOtimo({
                produtoId,
                previsao,
                tempoMedioEntrega: await this.obterTempoMedioEntrega(produtoId)
            });

            const sugestaoCompra = await this.gerarSugestaoCompra({
                produtoId,
                previsao,
                pontoReposicao
            });

            const resultado = {
                produtoId,
                previsao: {
                    demandaProjetada: previsao.demandaTotal,
                    demandaDiaria: previsao.demandaDiaria,
                    confiabilidade: previsao.confiabilidade,
                    fatoresInfluencia: previsao.fatores
                },
                otimizacao: {
                    pontoReposicaoOtimo: pontoReposicao,
                    estoqueSeguranca: previsao.estoqueSeguranca,
                    loteEconomicoCompra: previsao.loteEconomico
                },
                sugestaoCompra,
                alertas: previsao.alertas,
                geradoEm: new Date(),
                algoritmo: previsao.algoritmo
            };

            await this.redis.setex(cacheKey, 7200, JSON.stringify(resultado));

            this.emit('previsao_demanda_gerada', { produtoId, resultado });
            return resultado;

        } catch (error) {
            console.error('Erro na previsão de demanda:', error);
            throw error;
        }
    }

    async executarInventarioIA(filialId, configuracao = {}) {
        try {
            const {
                metodo = 'abc_xyz',
                prioridadeAlta = 0.8,
                toleranciaVariacao = 0.05
            } = configuracao;

            const classificacao = await this.classificarProdutosABCXYZ(filialId);

            const produtosInventario = await this.selecionarProdutosInventario({
                filialId,
                metodo,
                classificacao,
                configuracao
            });

            const planosContagem = await this.gerarPlanosContagemOtimizados({
                produtos: produtosInventario,
                filialId,
                configuracao
            });

            const alertasPreventivos = await this.iaEngine.detectarDiscrepanciasPrevistas({
                produtos: produtosInventario,
                historicoMovimentacoes: await this.obterHistoricoMovimentacoes(filialId)
            });

            const resultado = {
                produtosInventario,
                planosContagem,
                alertasPreventivos,
                estatisticas: {
                    totalProdutos: produtosInventario.length,
                    valorEstoque: produtosInventario.reduce((sum, p) => sum + (p.estoqueAtual * p.precoCusto), 0),
                    itensClasseA: classificacao.filter(c => c.classeABC === 'A').length,
                    itensAltaVariabilidade: classificacao.filter(c => c.classeXYZ === 'Z').length
                },
                cronograma: await this.gerarCronogramaInventario(planosContagem),
                geradoEm: new Date(),
                algoritmo: 'AI_Optimized_Inventory'
            };

            this.emit('inventario_planejado', { filialId, resultado });
            return resultado;

        } catch (error) {
            console.error('Erro no inventário inteligente:', error);
            throw error;
        }
    }


    async analisarPerformanceVendas(empresaId, periodo = 30) {
        try {
            const dataInicio = moment().subtract(periodo, 'days').toDate();
            const dataFim = new Date();

            const [
                vendasPeriodo,
                vendasPeriodoAnterior,
                metas,
                tendencias
            ] = await Promise.all([
                this.obterVendasPeriodo(empresaId, dataInicio, dataFim),
                this.obterVendasPeriodo(empresaId, 
                    moment().subtract(periodo * 2, 'days').toDate(),
                    moment().subtract(periodo, 'days').toDate()
                ),
                this.obterMetasVendas(empresaId, periodo),
                this.analisarTendenciasVendas(empresaId)
            ]);

            const performanceVendedores = await this.analisarPerformanceVendedores({
                vendas: vendasPeriodo,
                metas
            });

            const performanceProdutos = await this.analisarPerformanceProdutos({
                vendas: vendasPeriodo,
                periodo
            });

            const insights = await this.iaEngine.gerarInsightsVendas({
                vendasPeriodo,
                vendasPeriodoAnterior,
                performanceVendedores,
                performanceProdutos,
                tendencias
            });

            const previsaoProximoPeriodo = await this.iaEngine.preverVendasProximoPeriodo({
                historicoVendas: vendasPeriodo,
                tendencias,
                sazonalidade: await this.analisarSazonalidadeVendas(empresaId)
            });

            const resultado = {
                resumoGeral: {
                    receitaTotal: vendasPeriodo.reduce((sum, v) => sum + v.valorTotal, 0),
                    receitaPeriodoAnterior: vendasPeriodoAnterior.reduce((sum, v) => sum + v.valorTotal, 0),
                    crescimento: this.calcularCrescimento(vendasPeriodo, vendasPeriodoAnterior),
                    totalPedidos: vendasPeriodo.length,
                    ticketMedio: vendasPeriodo.reduce((sum, v) => sum + v.valorTotal, 0) / vendasPeriodo.length,
                    atingimentoMeta: this.calcularAtingimentoMeta(vendasPeriodo, metas)
                },
                performanceVendedores,
                performanceProdutos,
                insights,
                previsaoProximoPeriodo,
                alertas: await this.gerarAlertasVendas(vendasPeriodo, metas),
                oportunidades: insights.oportunidades,
                geradoEm: new Date()
            };

            this.emit('analise_vendas_concluida', { empresaId, resultado });
            return resultado;

        } catch (error) {
            console.error('Erro na análise de performance de vendas:', error);
            throw error;
        }
    }

    async analisarClienteIA(clienteId) {
        try {
            const cacheKey = `cliente_analise:${clienteId}`;
            const cached = await this.redis.get(cacheKey);
            
            if (cached) {
                return JSON.parse(cached);
            }

            const [
                dadosCliente,
                historicoCompras,
                interacoes,
                comportamento
            ] = await Promise.all([
                this.obterDadosCliente(clienteId),
                this.obterHistoricoComprasCliente(clienteId),
                this.obterInteracoesCliente(clienteId),
                this.analisarComportamentoCliente(clienteId)
            ]);

            const analiseIA = await this.iaEngine.analisarPerfilCliente({
                dadosCliente,
                historicoCompras,
                interacoes,
                comportamento
            });

            const segmento = await this.iaEngine.segmentarCliente(dadosCliente, analiseIA);

            const previsoes = await this.iaEngine.gerarPrevisoesCliente({
                clienteId,
                analiseIA,
                historicoCompras
            });

            const churnAnalysis = await this.iaEngine.preverChurn(dadosCliente);

            const resultado = {
                cliente: dadosCliente,
                analiseIA: {
                    scoreCredito: analiseIA.scoreCredito,
                    scoreFidelidade: analiseIA.scoreFidelidade,
                    potencialCompra: analiseIA.potencialCompra,
                    riscoPerdaCliente: churnAnalysis.probabilidadeChurn,
                    valorVidaEstimado: analiseIA.clv
                },
                segmento,
                previsoes: {
                    proximaCompra: previsoes.proximaCompra,
                    valorProximaCompra: previsoes.valorProximaCompra,
                    produtosSugeridos: previsoes.produtosSugeridos,
                    melhorMomentoContato: previsoes.melhorMomentoContato
                },
                churn: churnAnalysis,
                recomendacoes: analiseIA.recomendacoes,
                alertas: analiseIA.alertas,
                historico: {
                    totalCompras: historicoCompras.reduce((sum, c) => sum + c.valorTotal, 0),
                    frequenciaCompras: comportamento.frequenciaMedia,
                    ultimaCompra: historicoCompras[0]?.dataPedido,
                    produtosFavoritos: comportamento.produtosFavoritos
                },
                geradoEm: new Date()
            };

            await this.redis.setex(cacheKey, 1800, JSON.stringify(resultado));

            this.emit('analise_cliente_concluida', { clienteId, resultado });
            return resultado;

        } catch (error) {
            console.error('Erro na análise do cliente:', error);
            throw error;
        }
    }


    async gerarDashboardExecutivo(empresaId, periodo = 30) {
        try {
            const cacheKey = `dashboard_executivo:${empresaId}:${periodo}`;
            const cached = await this.redis.get(cacheKey);
            
            if (cached) {
                return JSON.parse(cached);
            }

            const dataInicio = moment().subtract(periodo, 'days').toDate();
            const dataFim = new Date();

            const [
                kpisFinanceiros,
                kpisVendas,
                kpisEstoque,
                kpisOperacionais,
                tendencias,
                alertas
            ] = await Promise.all([
                this.calcularKPIsFinanceiros(empresaId, dataInicio, dataFim),
                this.calcularKPIsVendas(empresaId, dataInicio, dataFim),
                this.calcularKPIsEstoque(empresaId),
                this.calcularKPIsOperacionais(empresaId, dataInicio, dataFim),
                this.analisarTendenciasGerais(empresaId, periodo),
                this.gerarAlertasExecutivos(empresaId)
            ]);

            const insights = await this.iaEngine.gerarInsightsExecutivos({
                kpisFinanceiros,
                kpisVendas,
                kpisEstoque,
                kpisOperacionais,
                tendencias
            });

            const previsoes = await this.iaEngine.gerarPrevisoesEstrategicas({
                empresaId,
                kpis: { kpisFinanceiros, kpisVendas, kpisEstoque, kpisOperacionais },
                horizonte: 90
            });

            const resultado = {
                periodo: {
                    inicio: dataInicio,
                    fim: dataFim,
                    dias: periodo
                },
                kpis: {
                    financeiros: kpisFinanceiros,
                    vendas: kpisVendas,
                    estoque: kpisEstoque,
                    operacionais: kpisOperacionais
                },
                tendencias,
                insights,
                previsoes,
                alertas,
                recomendacoes: insights.recomendacoes,
                scoreGeral: this.calcularScoreGeralEmpresa({
                    kpisFinanceiros,
                    kpisVendas,
                    kpisEstoque,
                    kpisOperacionais
                }),
                geradoEm: new Date()
            };

            await this.redis.setex(cacheKey, 900, JSON.stringify(resultado));

            this.emit('dashboard_executivo_gerado', { empresaId, resultado });
            return resultado;

        } catch (error) {
            console.error('Erro ao gerar dashboard executivo:', error);
            throw error;
        }
    }


    async validarCNPJ(cnpj) {
        const cnpjLimpo = this.limparCNPJ(cnpj);
        if (cnpjLimpo.length !== 14) {
            throw new Error('CNPJ inválido');
        }
        return true;
    }

    limparCNPJ(cnpj) {
        return cnpj.replace(/[^\d]/g, '');
    }

    async buscarDadosReceitaFederal(cnpj) {
        return {
            razaoSocial: 'Empresa Exemplo LTDA',
            nomeFantasia: 'Empresa Exemplo',
            cnaePrincipal: '6201-5/00',
            situacao: 'ATIVA'
        };
    }

    calcularConfiabilidadeProjecao(dia, totalDias) {
        return Math.max(95 - (dia / totalDias) * 30, 50);
    }

    calcularCrescimento(vendasAtual, vendasAnterior) {
        const totalAtual = vendasAtual.reduce((sum, v) => sum + v.valorTotal, 0);
        const totalAnterior = vendasAnterior.reduce((sum, v) => sum + v.valorTotal, 0);
        
        if (totalAnterior === 0) return 0;
        return ((totalAtual - totalAnterior) / totalAnterior) * 100;
    }

    calcularScoreGeralEmpresa(kpis) {
        let score = 0;
        
        if (kpis.kpisFinanceiros.margemLiquida > 15) score += 40;
        else if (kpis.kpisFinanceiros.margemLiquida > 10) score += 30;
        else if (kpis.kpisFinanceiros.margemLiquida > 5) score += 20;
        else score += 10;
        
        if (kpis.kpisVendas.crescimentoVendas > 20) score += 30;
        else if (kpis.kpisVendas.crescimentoVendas > 10) score += 25;
        else if (kpis.kpisVendas.crescimentoVendas > 0) score += 20;
        else score += 10;
        
        if (kpis.kpisEstoque.giroEstoque > 12) score += 20;
        else if (kpis.kpisEstoque.giroEstoque > 8) score += 15;
        else if (kpis.kpisEstoque.giroEstoque > 4) score += 10;
        else score += 5;
        
        if (kpis.kpisOperacionais.eficienciaOperacional > 90) score += 10;
        else if (kpis.kpisOperacionais.eficienciaOperacional > 80) score += 8;
        else if (kpis.kpisOperacionais.eficienciaOperacional > 70) score += 6;
        else score += 3;
        
        return Math.min(score, 100);
    }

    async obterSaldoAtual(empresaId) { return 50000; }
    async obterContasReceberFuturas(empresaId, dataFim) { return []; }
    async obterContasPagarFuturas(empresaId, dataFim) { return []; }
    async obterHistoricoVendas(empresaId, dias) { return []; }
    async analisarSazonalidade(empresaId) { return {}; }
    async obterHistoricoRecebimentos(empresaId) { return []; }
    async analisarRiscoFluxo(fluxo) { return { alertas: [] }; }
    async obterExtratoBancario(bancoContaId, periodo) { return []; }
    async obterLancamentosContabeis(empresaId, periodo) { return []; }
    async obterPadroesConciliacao(empresaId) { return []; }
    async executarConciliacao(extratoItem, lancamento) { return true; }
    async identificarDiscrepancias(extrato, lancamentos, matching) { return []; }
}

module.exports = new ERPCoreService();
