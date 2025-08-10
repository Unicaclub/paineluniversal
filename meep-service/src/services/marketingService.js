const { EventEmitter } = require('events');
const Redis = require('redis');

class MarketingService extends EventEmitter {
    constructor() {
        super();
        this.redis = Redis.createClient(process.env.REDIS_URL);
        this.conexoesWebSocket = new Map();
        this.campanhasAtivas = new Map();
        this.segmentosCache = new Map();
    }

    async inicializar() {
        try {
            await this.redis.connect();
            console.log('✅ MarketingService: Redis conectado');
            
            this.configurarEventListeners();
            await this.carregarCampanhasAtivas();
            
        } catch (error) {
            console.error('❌ MarketingService: Erro na inicialização:', error);
            throw error;
        }
    }

    configurarEventListeners() {
        this.on('transacao_fidelidade', this.processarTransacaoFidelidade.bind(this));
        this.on('nivel_upgrade', this.processarUpgradeNivel.bind(this));
        this.on('campanha_executada', this.processarCampanhaExecutada.bind(this));
        this.on('promocao_utilizada', this.processarPromocaoUtilizada.bind(this));
        this.on('cliente_segmentado', this.processarClienteSegmentado.bind(this));
    }

    async carregarCampanhasAtivas() {
        try {
            const campanhas = await this.buscarCampanhasAtivas();
            
            for (const campanha of campanhas) {
                this.campanhasAtivas.set(campanha.id, {
                    ...campanha,
                    metricas: {
                        envios: 0,
                        aberturas: 0,
                        cliques: 0,
                        conversoes: 0
                    }
                });
            }
            
            console.log(`✅ MarketingService: ${campanhas.length} campanhas ativas carregadas`);
            
        } catch (error) {
            console.error('❌ MarketingService: Erro ao carregar campanhas:', error);
        }
    }

    async calcularPontosInteligentes(dadosTransacao) {
        try {
            const { clienteCpf, valorCompra, eventoId, tipoTransacao } = dadosTransacao;
            
            const cacheKey = `pontos_${clienteCpf}_${eventoId}`;
            let multiplicadores = await this.redis.get(cacheKey);
            
            if (!multiplicadores) {
                multiplicadores = await this.calcularMultiplicadores(clienteCpf, eventoId);
                await this.redis.setex(cacheKey, 3600, JSON.stringify(multiplicadores));
            } else {
                multiplicadores = JSON.parse(multiplicadores);
            }

            const pontosBase = Math.floor(valorCompra * multiplicadores.pontosBase);
            const multiplicadorTotal = this.calcularMultiplicadorTotal(multiplicadores);
            const pontosFinais = Math.floor(pontosBase * multiplicadorTotal);

            const resultado = {
                pontosBase,
                multiplicadorTotal,
                pontosFinais,
                detalhesMultiplicadores: multiplicadores,
                bonusAplicados: this.identificarBonusAplicados(multiplicadores)
            };

            this.emit('pontos_calculados', {
                clienteCpf,
                eventoId,
                resultado
            });

            return resultado;

        } catch (error) {
            console.error('❌ MarketingService: Erro no cálculo de pontos:', error);
            throw error;
        }
    }

    async calcularMultiplicadores(clienteCpf, eventoId) {
        try {
            const perfilCliente = await this.obterPerfilCliente(clienteCpf);
            const dadosEvento = await this.obterDadosEvento(eventoId);
            
            const multiplicadores = {
                pontosBase: 1.0,
                nivelFidelidade: perfilCliente.nivel?.multiplicador || 1.0,
                frequenciaVisitas: this.calcularBonusFrequencia(perfilCliente.frequencia),
                valorMedio: this.calcularBonusValorMedio(perfilCliente.valorMedio),
                aniversario: this.verificarAniversario(perfilCliente.dataNascimento) ? 2.0 : 1.0,
                primeiraCompra: perfilCliente.primeiraCompra ? 1.5 : 1.0,
                eventoEspecial: dadosEvento.multiplicadorEspecial || 1.0,
                promocaoAtiva: await this.verificarPromocaoAtiva(clienteCpf, eventoId)
            };

            return multiplicadores;

        } catch (error) {
            console.error('❌ MarketingService: Erro ao calcular multiplicadores:', error);
            return { pontosBase: 1.0 };
        }
    }

    calcularMultiplicadorTotal(multiplicadores) {
        const { pontosBase, nivelFidelidade, frequenciaVisitas, valorMedio, 
                aniversario, primeiraCompra, eventoEspecial, promocaoAtiva } = multiplicadores;
        
        return pontosBase * nivelFidelidade * frequenciaVisitas * valorMedio * 
               aniversario * primeiraCompra * eventoEspecial * promocaoAtiva;
    }

    calcularBonusFrequencia(frequencia) {
        if (frequencia >= 10) return 1.3;
        if (frequencia >= 5) return 1.2;
        if (frequencia >= 3) return 1.1;
        return 1.0;
    }

    calcularBonusValorMedio(valorMedio) {
        if (valorMedio >= 500) return 1.25;
        if (valorMedio >= 200) return 1.15;
        if (valorMedio >= 100) return 1.1;
        return 1.0;
    }

    verificarAniversario(dataNascimento) {
        if (!dataNascimento) return false;
        
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        
        return hoje.getMonth() === nascimento.getMonth() && 
               hoje.getDate() === nascimento.getDate();
    }

    async executarSegmentacaoIA(empresaId, algoritmo = 'rfm') {
        try {
            console.log(`🤖 MarketingService: Iniciando segmentação IA (${algoritmo}) para empresa ${empresaId}`);
            
            let resultados;
            
            switch (algoritmo) {
                case 'rfm':
                    resultados = await this.executarAnaliseRFM(empresaId);
                    break;
                case 'comportamental':
                    resultados = await this.executarAnaliseComportamental(empresaId);
                    break;
                case 'preditiva':
                    resultados = await this.executarAnalisePreditiva(empresaId);
                    break;
                default:
                    throw new Error(`Algoritmo ${algoritmo} não suportado`);
            }

            await this.salvarResultadosSegmentacao(empresaId, algoritmo, resultados);
            
            this.emit('segmentacao_concluida', {
                empresaId,
                algoritmo,
                totalSegmentos: resultados.length,
                totalClientes: resultados.reduce((acc, seg) => acc + seg.totalClientes, 0)
            });

            return resultados;

        } catch (error) {
            console.error('❌ MarketingService: Erro na segmentação IA:', error);
            throw error;
        }
    }

    async executarAnaliseRFM(empresaId) {
        try {
            const clientes = await this.obterDadosClientesRFM(empresaId);
            
            const clientesComScores = clientes.map(cliente => {
                const recencyScore = this.calcularScoreRecency(cliente.recency);
                const frequencyScore = this.calcularScoreFrequency(cliente.frequency);
                const monetaryScore = this.calcularScoreMonetary(cliente.monetary);
                
                return {
                    ...cliente,
                    recencyScore,
                    frequencyScore,
                    monetaryScore,
                    segmentoRFM: this.determinarSegmentoRFM(recencyScore, frequencyScore, monetaryScore)
                };
            });

            const segmentos = this.agruparPorSegmento(clientesComScores);
            
            return segmentos.map(segmento => ({
                nome: `RFM - ${segmento.nome}`,
                descricao: segmento.descricao,
                totalClientes: segmento.clientes.length,
                scoremedio: segmento.scoreMedia,
                criterios: segmento.criterios,
                clientes: segmento.clientes
            }));

        } catch (error) {
            console.error('❌ MarketingService: Erro na análise RFM:', error);
            throw error;
        }
    }

    calcularScoreRecency(diasUltimaCompra) {
        if (diasUltimaCompra <= 30) return 5;
        if (diasUltimaCompra <= 60) return 4;
        if (diasUltimaCompra <= 90) return 3;
        if (diasUltimaCompra <= 180) return 2;
        return 1;
    }

    calcularScoreFrequency(totalCompras) {
        if (totalCompras >= 20) return 5;
        if (totalCompras >= 10) return 4;
        if (totalCompras >= 5) return 3;
        if (totalCompras >= 2) return 2;
        return 1;
    }

    calcularScoreMonetary(valorTotal) {
        if (valorTotal >= 2000) return 5;
        if (valorTotal >= 1000) return 4;
        if (valorTotal >= 500) return 3;
        if (valorTotal >= 200) return 2;
        return 1;
    }

    determinarSegmentoRFM(r, f, m) {
        if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
        if (r >= 3 && f >= 3 && m >= 3) return 'Loyal Customers';
        if (r >= 3 && f <= 2 && m >= 3) return 'Potential Loyalists';
        if (r >= 4 && f <= 2 && m <= 2) return 'New Customers';
        if (r <= 2 && f >= 3 && m >= 3) return 'At Risk';
        if (r <= 2 && f <= 2 && m >= 3) return 'Cannot Lose Them';
        if (r <= 2 && f <= 2 && m <= 2) return 'Hibernating';
        return 'Others';
    }

    async executarAnalisePreditiva(clienteCpf) {
        try {
            const perfilCompleto = await this.obterPerfilCompletoCliente(clienteCpf);
            
            const analise = {
                scoreEngajamento: this.calcularScoreEngajamento(perfilCompleto),
                probabilidadeRetorno: this.calcularProbabilidadeRetorno(perfilCompleto),
                valorMedioProjetado: this.projetarValorMedio(perfilCompleto),
                riscoCancelamento: this.avaliarRiscoCancelamento(perfilCompleto),
                proximoNivelEstimado: this.estimarProximoNivel(perfilCompleto),
                diasParaProximoNivel: this.calcularDiasProximoNivel(perfilCompleto),
                recomendacoes: this.gerarRecomendacoes(perfilCompleto),
                melhorDiaContato: this.identificarMelhorDiaContato(perfilCompleto),
                melhorHorarioContato: this.identificarMelhorHorarioContato(perfilCompleto),
                preferencias: this.analisarPreferencias(perfilCompleto),
                insights: this.gerarInsights(perfilCompleto)
            };

            await this.salvarAnaliseCliente(clienteCpf, analise);
            
            return analise;

        } catch (error) {
            console.error('❌ MarketingService: Erro na análise preditiva:', error);
            throw error;
        }
    }

    calcularScoreEngajamento(perfil) {
        let score = 0;
        
        score += Math.min(perfil.frequenciaVisitas * 5, 30);
        score += Math.min(perfil.valorMedioCompra / 10, 25);
        score += perfil.diasDesdeUltimaVisita <= 30 ? 20 : 0;
        score += perfil.participacaoEventos * 3;
        score += perfil.interacaoCampanhas * 2;
        
        return Math.min(Math.round(score), 100);
    }

    calcularProbabilidadeRetorno(perfil) {
        const fatores = {
            frequencia: Math.min(perfil.frequenciaVisitas / 10, 1) * 0.3,
            recencia: perfil.diasDesdeUltimaVisita <= 60 ? 0.25 : 0.1,
            valor: Math.min(perfil.valorTotalGasto / 1000, 1) * 0.2,
            engajamento: perfil.scoreEngajamento / 100 * 0.15,
            sazonalidade: this.calcularFatorSazonalidade(perfil) * 0.1
        };
        
        const probabilidade = Object.values(fatores).reduce((acc, val) => acc + val, 0);
        return Math.min(Math.round(probabilidade * 100), 100);
    }

    avaliarRiscoCancelamento(perfil) {
        const diasInativo = perfil.diasDesdeUltimaVisita;
        const frequenciaAnterior = perfil.frequenciaHistorica;
        const engajamento = perfil.scoreEngajamento;
        
        if (diasInativo > 180 && frequenciaAnterior < 2 && engajamento < 30) {
            return 'alto';
        } else if (diasInativo > 90 && engajamento < 50) {
            return 'medio';
        } else {
            return 'baixo';
        }
    }

    gerarRecomendacoes(perfil) {
        const recomendacoes = [];
        
        if (perfil.scoreEngajamento < 40) {
            recomendacoes.push({
                tipo: 'engajamento',
                acao: 'Enviar campanha de reativação personalizada',
                prioridade: 'alta'
            });
        }
        
        if (perfil.diasDesdeUltimaVisita > 60) {
            recomendacoes.push({
                tipo: 'retencao',
                acao: 'Oferecer desconto especial para retorno',
                prioridade: 'media'
            });
        }
        
        if (perfil.valorMedioCompra > perfil.valorMedioSegmento * 1.5) {
            recomendacoes.push({
                tipo: 'upsell',
                acao: 'Promover produtos premium ou VIP',
                prioridade: 'media'
            });
        }
        
        return recomendacoes;
    }

    async processarTransacaoFidelidade(dados) {
        try {
            const { clienteCpf, pontos, tipo, eventoId } = dados;
            
            await this.atualizarCacheCliente(clienteCpf);
            
            if (tipo === 'ganho') {
                await this.verificarConquistas(clienteCpf, pontos);
                await this.verificarUpgradeNivel(clienteCpf);
            }
            
            this.emit('websocket_broadcast', {
                type: 'transacao_fidelidade',
                data: {
                    clienteCpf,
                    pontos,
                    tipo,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('❌ MarketingService: Erro ao processar transação:', error);
        }
    }

    async processarUpgradeNivel(dados) {
        try {
            const { clienteCpf, nivelAnterior, nivelNovo } = dados;
            
            this.emit('websocket_broadcast', {
                type: 'nivel_upgrade',
                data: {
                    clienteCpf,
                    nivelAnterior,
                    nivelNovo,
                    timestamp: new Date().toISOString()
                }
            });

            await this.enviarNotificacaoUpgrade(clienteCpf, nivelNovo);

        } catch (error) {
            console.error('❌ MarketingService: Erro ao processar upgrade:', error);
        }
    }

    async processarCampanhaExecutada(dados) {
        try {
            const { campanhaId, totalEnvios } = dados;
            
            if (this.campanhasAtivas.has(campanhaId)) {
                const campanha = this.campanhasAtivas.get(campanhaId);
                campanha.metricas.envios += totalEnvios;
                
                this.emit('websocket_broadcast', {
                    type: 'campanha_executada',
                    data: {
                        campanhaId,
                        nome: campanha.nome,
                        totalEnvios,
                        timestamp: new Date().toISOString()
                    }
                });
            }

        } catch (error) {
            console.error('❌ MarketingService: Erro ao processar campanha:', error);
        }
    }

    async obterMetricasMarketing(empresaId, periodo = 30) {
        try {
            const cacheKey = `metricas_marketing_${empresaId}_${periodo}`;
            let metricas = await this.redis.get(cacheKey);
            
            if (!metricas) {
                metricas = await this.calcularMetricasMarketing(empresaId, periodo);
                await this.redis.setex(cacheKey, 1800, JSON.stringify(metricas));
            } else {
                metricas = JSON.parse(metricas);
            }
            
            return metricas;

        } catch (error) {
            console.error('❌ MarketingService: Erro ao obter métricas:', error);
            throw error;
        }
    }

    async calcularMetricasMarketing(empresaId, periodo) {
        try {
            const dataInicio = new Date();
            dataInicio.setDate(dataInicio.getDate() - periodo);
            
            const metricas = {
                totalClientesFidelidade: await this.contarClientesFidelidade(empresaId),
                pontosEmitidos: await this.somarPontosEmitidos(empresaId, dataInicio),
                pontosResgatados: await this.somarPontosResgatados(empresaId, dataInicio),
                campanhasAtivas: await this.contarCampanhasAtivas(empresaId),
                promocoesAtivas: await this.contarPromocoesAtivas(empresaId),
                segmentosAtivos: await this.contarSegmentosAtivos(empresaId),
                taxaEngajamento: await this.calcularTaxaEngajamento(empresaId, periodo),
                roiFidelidade: await this.calcularROIFidelidade(empresaId, periodo),
                conversaoCampanhas: await this.calcularConversaoCampanhas(empresaId, periodo)
            };
            
            return metricas;

        } catch (error) {
            console.error('❌ MarketingService: Erro ao calcular métricas:', error);
            throw error;
        }
    }

    async obterDashboardMarketing(empresaId) {
        try {
            const metricas = await this.obterMetricasMarketing(empresaId);
            const campanhasRecentes = await this.obterCampanhasRecentes(empresaId, 5);
            const segmentosTop = await this.obterTopSegmentos(empresaId, 5);
            const promocoesAtivas = await this.obterPromocoesAtivas(empresaId);
            
            return {
                metricas,
                campanhasRecentes,
                segmentosTop,
                promocoesAtivas,
                ultimaAtualizacao: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ MarketingService: Erro ao obter dashboard:', error);
            throw error;
        }
    }

    async buscarCampanhasAtivas() {
        return [];
    }

    async obterPerfilCliente(clienteCpf) {
        return {};
    }

    async obterDadosEvento(eventoId) {
        return {};
    }

    async verificarPromocaoAtiva(clienteCpf, eventoId) {
        return 1.0;
    }

    async obterDadosClientesRFM(empresaId) {
        return [];
    }

    async agruparPorSegmento(clientesComScores) {
        return [];
    }

    async salvarResultadosSegmentacao(empresaId, algoritmo, resultados) {
        return true;
    }

    async obterPerfilCompletoCliente(clienteCpf) {
        return {};
    }

    async salvarAnaliseCliente(clienteCpf, analise) {
        return true;
    }

    calcularFatorSazonalidade(perfil) {
        return 0.1;
    }

    async atualizarCacheCliente(clienteCpf) {
        return true;
    }

    async verificarConquistas(clienteCpf, pontos) {
        return true;
    }

    async verificarUpgradeNivel(clienteCpf) {
        return true;
    }

    async enviarNotificacaoUpgrade(clienteCpf, nivelNovo) {
        return true;
    }

    async contarClientesFidelidade(empresaId) {
        return 0;
    }

    async somarPontosEmitidos(empresaId, dataInicio) {
        return 0;
    }

    async somarPontosResgatados(empresaId, dataInicio) {
        return 0;
    }

    async contarCampanhasAtivas(empresaId) {
        return 0;
    }

    async contarPromocoesAtivas(empresaId) {
        return 0;
    }

    async contarSegmentosAtivos(empresaId) {
        return 0;
    }

    async calcularTaxaEngajamento(empresaId, periodo) {
        return 0;
    }

    async calcularROIFidelidade(empresaId, periodo) {
        return 0;
    }

    async calcularConversaoCampanhas(empresaId, periodo) {
        return 0;
    }

    async obterCampanhasRecentes(empresaId, limit) {
        return [];
    }

    async obterTopSegmentos(empresaId, limit) {
        return [];
    }

    async obterPromocoesAtivas(empresaId) {
        return [];
    }
}

module.exports = new MarketingService();
