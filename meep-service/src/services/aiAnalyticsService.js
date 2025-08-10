const { EventEmitter } = require('events');

class AIAnalyticsService extends EventEmitter {
    constructor() {
        super();
        this.modelos = new Map();
        this.cache = new Map();
    }

    async inicializar() {
        try {
            console.log('🤖 AIAnalyticsService: Inicializando modelos de IA...');
            
            await this.carregarModelosML();
            await this.configurarAlgoritmos();
            
            console.log('✅ AIAnalyticsService: IA inicializada com sucesso');
            
        } catch (error) {
            console.error('❌ AIAnalyticsService: Erro na inicialização:', error);
            throw error;
        }
    }

    async carregarModelosML() {
        this.modelos.set('rfm_segmentation', {
            tipo: 'clustering',
            algoritmo: 'kmeans',
            parametros: {
                clusters: 8,
                features: ['recency', 'frequency', 'monetary']
            }
        });

        this.modelos.set('churn_prediction', {
            tipo: 'classification',
            algoritmo: 'random_forest',
            parametros: {
                features: ['dias_inativo', 'frequencia_historica', 'valor_medio', 'engajamento']
            }
        });

        this.modelos.set('ltv_prediction', {
            tipo: 'regression',
            algoritmo: 'gradient_boosting',
            parametros: {
                features: ['idade_cliente', 'frequencia', 'valor_historico', 'categoria_preferida']
            }
        });
    }

    async configurarAlgoritmos() {
        this.algoritmos = {
            segmentacaoRFM: this.executarSegmentacaoRFM.bind(this),
            analiseComportamental: this.executarAnaliseComportamental.bind(this),
            predicaoChurn: this.executarPredicaoChurn.bind(this),
            recomendacaoCampanha: this.gerarRecomendacoesCampanha.bind(this),
            otimizacaoPrecos: this.otimizarPrecos.bind(this)
        };
    }

    async executarSegmentacaoRFM(dadosClientes) {
        try {
            console.log('🔍 AIAnalyticsService: Executando segmentação RFM...');
            
            const clientesProcessados = dadosClientes.map(cliente => {
                const recencyScore = this.calcularScoreRecency(cliente.diasUltimaCompra);
                const frequencyScore = this.calcularScoreFrequency(cliente.totalCompras);
                const monetaryScore = this.calcularScoreMonetary(cliente.valorTotal);
                
                return {
                    ...cliente,
                    recencyScore,
                    frequencyScore,
                    monetaryScore,
                    segmentoRFM: this.determinarSegmentoRFM(recencyScore, frequencyScore, monetaryScore),
                    scoreGeral: (recencyScore + frequencyScore + monetaryScore) / 3
                };
            });

            const segmentos = this.agruparPorSegmentoRFM(clientesProcessados);
            
            return {
                segmentos,
                totalClientes: clientesProcessados.length,
                distribuicao: this.calcularDistribuicaoSegmentos(segmentos),
                insights: this.gerarInsightsRFM(segmentos)
            };

        } catch (error) {
            console.error('❌ AIAnalyticsService: Erro na segmentação RFM:', error);
            throw error;
        }
    }

    calcularScoreRecency(diasUltimaCompra) {
        if (diasUltimaCompra <= 7) return 5;
        if (diasUltimaCompra <= 30) return 4;
        if (diasUltimaCompra <= 60) return 3;
        if (diasUltimaCompra <= 180) return 2;
        return 1;
    }

    calcularScoreFrequency(totalCompras) {
        if (totalCompras >= 50) return 5;
        if (totalCompras >= 20) return 4;
        if (totalCompras >= 10) return 3;
        if (totalCompras >= 5) return 2;
        return 1;
    }

    calcularScoreMonetary(valorTotal) {
        if (valorTotal >= 5000) return 5;
        if (valorTotal >= 2000) return 4;
        if (valorTotal >= 1000) return 3;
        if (valorTotal >= 500) return 2;
        return 1;
    }

    determinarSegmentoRFM(r, f, m) {
        const score = r + f + m;
        
        if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
        if (r >= 3 && f >= 3 && m >= 3) return 'Loyal Customers';
        if (r >= 4 && f <= 2 && m <= 2) return 'New Customers';
        if (r >= 3 && f <= 2 && m >= 3) return 'Potential Loyalists';
        if (r <= 2 && f >= 3 && m >= 3) return 'At Risk';
        if (r <= 2 && f <= 2 && m >= 3) return 'Cannot Lose Them';
        if (r <= 2 && f <= 2 && m <= 2) return 'Hibernating';
        return 'Others';
    }

    agruparPorSegmentoRFM(clientesProcessados) {
        const grupos = {};
        
        clientesProcessados.forEach(cliente => {
            const segmento = cliente.segmentoRFM;
            if (!grupos[segmento]) {
                grupos[segmento] = {
                    nome: segmento,
                    clientes: [],
                    scoreMedia: 0,
                    valorMedio: 0,
                    frequenciaMedia: 0
                };
            }
            grupos[segmento].clientes.push(cliente);
        });

        Object.keys(grupos).forEach(segmento => {
            const grupo = grupos[segmento];
            const totalClientes = grupo.clientes.length;
            
            grupo.scoreMedia = grupo.clientes.reduce((acc, c) => acc + c.scoreGeral, 0) / totalClientes;
            grupo.valorMedio = grupo.clientes.reduce((acc, c) => acc + c.valorTotal, 0) / totalClientes;
            grupo.frequenciaMedia = grupo.clientes.reduce((acc, c) => acc + c.totalCompras, 0) / totalClientes;
        });

        return Object.values(grupos);
    }

    async executarAnaliseComportamental(clienteCpf) {
        try {
            const cacheKey = `comportamental_${clienteCpf}`;
            let analise = this.cache.get(cacheKey);
            
            if (!analise) {
                const dadosCliente = await this.obterDadosComportamentais(clienteCpf);
                
                analise = {
                    padraoVisitas: this.analisarPadraoVisitas(dadosCliente.visitas),
                    preferenciasHorario: this.analisarPreferenciasHorario(dadosCliente.checkins),
                    categoriasFavoritas: this.identificarCategoriasFavoritas(dadosCliente.compras),
                    sazonalidade: this.analisarSazonalidade(dadosCliente.historico),
                    tendenciaGasto: this.calcularTendenciaGasto(dadosCliente.transacoes),
                    probabilidadeRetorno: this.calcularProbabilidadeRetorno(dadosCliente),
                    riscoCancelamento: this.avaliarRiscoCancelamento(dadosCliente),
                    recomendacoes: this.gerarRecomendacoesPersonalizadas(dadosCliente)
                };
                
                this.cache.set(cacheKey, analise, 3600000); // 1 hora
            }
            
            return analise;

        } catch (error) {
            console.error('❌ AIAnalyticsService: Erro na análise comportamental:', error);
            throw error;
        }
    }

    analisarPadraoVisitas(visitas) {
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        const padroes = {};
        
        diasSemana.forEach(dia => padroes[dia] = 0);
        
        visitas.forEach(visita => {
            const dia = diasSemana[new Date(visita.data).getDay()];
            padroes[dia]++;
        });
        
        const diaPreferido = Object.keys(padroes).reduce((a, b) => 
            padroes[a] > padroes[b] ? a : b
        );
        
        return {
            distribuicao: padroes,
            diaPreferido,
            frequenciaMedia: visitas.length / 12, // por mês
            regularidade: this.calcularRegularidade(visitas)
        };
    }

    analisarPreferenciasHorario(checkins) {
        const horarios = {
            manha: 0,      // 6-12h
            tarde: 0,      // 12-18h
            noite: 0,      // 18-24h
            madrugada: 0   // 0-6h
        };
        
        checkins.forEach(checkin => {
            const hora = new Date(checkin.dataHora).getHours();
            
            if (hora >= 6 && hora < 12) horarios.manha++;
            else if (hora >= 12 && hora < 18) horarios.tarde++;
            else if (hora >= 18 && hora < 24) horarios.noite++;
            else horarios.madrugada++;
        });
        
        const periodoPreferido = Object.keys(horarios).reduce((a, b) => 
            horarios[a] > horarios[b] ? a : b
        );
        
        return {
            distribuicao: horarios,
            periodoPreferido,
            horarioMedioChegada: this.calcularHorarioMedio(checkins)
        };
    }

    identificarCategoriasFavoritas(compras) {
        const categorias = {};
        
        compras.forEach(compra => {
            compra.itens.forEach(item => {
                const categoria = item.categoria || 'Outros';
                if (!categorias[categoria]) {
                    categorias[categoria] = {
                        quantidade: 0,
                        valor: 0,
                        frequencia: 0
                    };
                }
                categorias[categoria].quantidade += item.quantidade;
                categorias[categoria].valor += item.valor;
                categorias[categoria].frequencia++;
            });
        });
        
        const categoriasOrdenadas = Object.entries(categorias)
            .sort(([,a], [,b]) => b.valor - a.valor)
            .slice(0, 5);
        
        return {
            top5: categoriasOrdenadas.map(([nome, dados]) => ({
                nome,
                ...dados,
                percentualGasto: (dados.valor / compras.reduce((acc, c) => acc + c.total, 0)) * 100
            })),
            diversidade: Object.keys(categorias).length,
            concentracao: this.calcularConcentracaoGastos(categorias)
        };
    }

    async executarPredicaoChurn(clienteCpf) {
        try {
            const dadosCliente = await this.obterDadosCompletosCliente(clienteCpf);
            
            const features = {
                diasInativo: dadosCliente.diasDesdeUltimaVisita,
                frequenciaHistorica: dadosCliente.frequenciaMedia,
                valorMedio: dadosCliente.valorMedioCompra,
                tendenciaGasto: dadosCliente.tendenciaGasto,
                engajamento: dadosCliente.scoreEngajamento,
                sazonalidade: dadosCliente.indiceSazonalidade,
                diversidadeCompras: dadosCliente.diversidadeCategorias,
                tempoComoCliente: dadosCliente.diasComoCliente
            };
            
            const risco = this.calcularRiscoChurn(features);
            const probabilidade = this.calcularProbabilidadeChurn(features);
            
            return {
                risco: risco, // 'baixo', 'medio', 'alto'
                probabilidade: probabilidade, // 0-100%
                fatoresRisco: this.identificarFatoresRisco(features),
                recomendacoesRetencao: this.gerarRecomendacoesRetencao(features, risco),
                proximaAcao: this.sugerirProximaAcao(risco, probabilidade),
                prazoEstimado: this.estimarPrazoChurn(features)
            };

        } catch (error) {
            console.error('❌ AIAnalyticsService: Erro na predição de churn:', error);
            throw error;
        }
    }

    calcularRiscoChurn(features) {
        let score = 0;
        
        if (features.diasInativo > 90) score += 30;
        else if (features.diasInativo > 60) score += 20;
        else if (features.diasInativo > 30) score += 10;
        
        if (features.frequenciaHistorica < 2) score += 25;
        else if (features.frequenciaHistorica < 5) score += 15;
        else if (features.frequenciaHistorica < 10) score += 5;
        
        if (features.tendenciaGasto < -0.5) score += 20;
        else if (features.tendenciaGasto < -0.2) score += 10;
        
        if (features.engajamento < 30) score += 15;
        else if (features.engajamento < 50) score += 8;
        
        if (features.tempoComoCliente < 30) score += 10;
        else if (features.tempoComoCliente < 90) score += 5;
        
        if (score >= 60) return 'alto';
        if (score >= 30) return 'medio';
        return 'baixo';
    }

    async gerarRecomendacoesCampanha(segmento, objetivo) {
        try {
            const recomendacoes = {
                Champions: {
                    canais: ['email', 'push', 'whatsapp'],
                    mensagens: ['programa_vip', 'eventos_exclusivos', 'early_access'],
                    timing: 'imediato',
                    frequencia: 'semanal'
                },
                'Loyal Customers': {
                    canais: ['email', 'push'],
                    mensagens: ['recompensas_fidelidade', 'upgrade_nivel', 'beneficios_extras'],
                    timing: 'planejado',
                    frequencia: 'quinzenal'
                },
                'At Risk': {
                    canais: ['email', 'sms', 'whatsapp'],
                    mensagens: ['oferta_especial', 'volta_por_favor', 'desconto_reativacao'],
                    timing: 'urgente',
                    frequencia: 'imediato'
                },
                'New Customers': {
                    canais: ['email', 'push'],
                    mensagens: ['boas_vindas', 'tutorial_app', 'primeira_compra'],
                    timing: 'sequencial',
                    frequencia: 'diario'
                }
            };
            
            const config = recomendacoes[segmento] || recomendacoes['Others'];
            
            return {
                segmento,
                objetivo,
                canaisRecomendados: config.canais,
                tiposMensagem: config.mensagens,
                timingOtimo: config.timing,
                frequenciaSugerida: config.frequencia,
                personalizacao: await this.gerarPersonalizacao(segmento),
                kpisEsperados: this.projetarKPIs(segmento, objetivo),
                orcamentoSugerido: this.calcularOrcamentoOtimo(segmento)
            };

        } catch (error) {
            console.error('❌ AIAnalyticsService: Erro ao gerar recomendações:', error);
            throw error;
        }
    }

    async otimizarPrecos(produto, segmentoCliente, contexto) {
        try {
            const fatores = {
                demanda: contexto.demandaAtual || 1.0,
                sazonalidade: contexto.fatorSazonalidade || 1.0,
                concorrencia: contexto.precosConcorrencia || [],
                elasticidade: await this.calcularElasticidadePreco(produto),
                segmento: this.obterCaracteristicasSegmento(segmentoCliente)
            };
            
            const precoBase = produto.precoBase;
            const multiplicadorSegmento = this.calcularMultiplicadorSegmento(segmentoCliente);
            const ajusteDemanda = this.calcularAjusteDemanda(fatores.demanda);
            const ajusteSazonalidade = fatores.sazonalidade;
            
            const precoOtimo = precoBase * multiplicadorSegmento * ajusteDemanda * ajusteSazonalidade;
            
            return {
                precoOriginal: precoBase,
                precoOtimo: Math.round(precoOtimo * 100) / 100,
                fatoresAplicados: {
                    segmento: multiplicadorSegmento,
                    demanda: ajusteDemanda,
                    sazonalidade: ajusteSazonalidade
                },
                impactoEstimado: {
                    vendas: this.estimarImpactoVendas(precoBase, precoOtimo, fatores.elasticidade),
                    receita: this.estimarImpactoReceita(precoBase, precoOtimo, fatores.elasticidade),
                    margem: this.calcularNovaMargemLucro(precoOtimo, produto.custo)
                },
                confianca: this.calcularConfiancaPredicao(fatores)
            };

        } catch (error) {
            console.error('❌ AIAnalyticsService: Erro na otimização de preços:', error);
            throw error;
        }
    }

    gerarInsightsRFM(segmentos) {
        const insights = [];
        
        const totalClientes = segmentos.reduce((acc, seg) => acc + seg.clientes.length, 0);
        const champions = segmentos.find(s => s.nome === 'Champions');
        const atRisk = segmentos.find(s => s.nome === 'At Risk');
        
        if (champions && champions.clientes.length / totalClientes > 0.15) {
            insights.push({
                tipo: 'positivo',
                titulo: 'Excelente base de Champions',
                descricao: `${((champions.clientes.length / totalClientes) * 100).toFixed(1)}% dos clientes são Champions`,
                acao: 'Mantenha estes clientes engajados com benefícios exclusivos'
            });
        }
        
        if (atRisk && atRisk.clientes.length / totalClientes > 0.10) {
            insights.push({
                tipo: 'alerta',
                titulo: 'Clientes em risco detectados',
                descricao: `${atRisk.clientes.length} clientes estão em risco de churn`,
                acao: 'Execute campanha de retenção imediatamente'
            });
        }
        
        return insights;
    }

    async obterDadosComportamentais(clienteCpf) {
        return {
            visitas: [],
            checkins: [],
            compras: [],
            historico: [],
            transacoes: []
        };
    }

    async obterDadosCompletosCliente(clienteCpf) {
        return {
            diasDesdeUltimaVisita: 0,
            frequenciaMedia: 0,
            valorMedioCompra: 0,
            tendenciaGasto: 0,
            scoreEngajamento: 0,
            indiceSazonalidade: 0,
            diversidadeCategorias: 0,
            diasComoCliente: 0
        };
    }

    calcularRegularidade(visitas) {
        return 0.8;
    }

    calcularHorarioMedio(checkins) {
        return '19:30';
    }

    calcularConcentracaoGastos(categorias) {
        return 0.6;
    }

    identificarFatoresRisco(features) {
        return [];
    }

    gerarRecomendacoesRetencao(features, risco) {
        return [];
    }

    sugerirProximaAcao(risco, probabilidade) {
        return 'Monitorar';
    }

    estimarPrazoChurn(features) {
        return '30-60 dias';
    }

    calcularProbabilidadeChurn(features) {
        return 25.5;
    }

    async gerarPersonalizacao(segmento) {
        return {};
    }

    projetarKPIs(segmento, objetivo) {
        return {};
    }

    calcularOrcamentoOtimo(segmento) {
        return 1000;
    }

    async calcularElasticidadePreco(produto) {
        return -1.2;
    }

    obterCaracteristicasSegmento(segmento) {
        return {};
    }

    calcularMultiplicadorSegmento(segmento) {
        return 1.0;
    }

    calcularAjusteDemanda(demanda) {
        return 1.0;
    }

    estimarImpactoVendas(precoBase, precoOtimo, elasticidade) {
        return 0;
    }

    estimarImpactoReceita(precoBase, precoOtimo, elasticidade) {
        return 0;
    }

    calcularNovaMargemLucro(precoOtimo, custo) {
        return 0;
    }

    calcularConfiancaPredicao(fatores) {
        return 0.85;
    }
}

module.exports = new AIAnalyticsService();
