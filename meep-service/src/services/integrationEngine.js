const { EventEmitter } = require('events');
const axios = require('axios');
const crypto = require('crypto');

class IntegrationEngine extends EventEmitter {
    constructor() {
        super();
        this.conectores = {
            'omie': require('./conectores/omieConector'),
            'sankhya': require('./conectores/sankhyaConector'),
            'bling': require('./conectores/blingConector'),
            'mercadolivre': require('./conectores/mercadolivreConector'),
            'amazon': require('./conectores/amazonConector'),
            'shopify': require('./conectores/shopifyConector'),
            'woocommerce': require('./conectores/woocommerceConector'),
            'nfe_io': require('./conectores/nfeIoConector'),
            'correios': require('./conectores/correiosConector'),
            'pagseguro': require('./conectores/pagseguroConector'),
            'mercadopago': require('./conectores/mercadopagoConector')
        };
        this.cache = require('./cacheService');
    }

    async conectarOMIE(credenciais) {
        try {
            const {
                appKey,
                appSecret,
                urlApi = 'https://app.omie.com.br/api/v1/'
            } = credenciais;

            const conector = this.conectores.omie;
            
            const validacao = await conector.validarCredenciais({
                appKey,
                appSecret,
                urlApi
            });

            if (!validacao.valido) {
                throw new Error(validacao.erro);
            }

            const mapeamento = {
                produtos: {
                    origem: 'produto/ListarProdutos',
                    destino: 'produtos',
                    campos: {
                        'codigo_produto': 'codigo',
                        'descricao': 'nome',
                        'valor_unitario': 'preco_venda',
                        'ncm': 'codigo_ncm',
                        'peso_liquido': 'peso_liquido'
                    }
                },
                clientes: {
                    origem: 'geral/clientes',
                    destino: 'clientes',
                    campos: {
                        'codigo_cliente_omie': 'codigo',
                        'razao_social': 'nome_razao_social',
                        'cnpj_cpf': 'cpf_cnpj',
                        'email': 'email'
                    }
                },
                pedidos: {
                    origem: 'produtos/pedido',
                    destino: 'pedidos_venda',
                    campos: {
                        'numero_pedido': 'numero_pedido',
                        'codigo_cliente': 'cliente_id',
                        'data_previsao': 'data_entrega_prevista',
                        'valor_total_pedido': 'valor_total'
                    }
                }
            };

            return {
                conector,
                mapeamento,
                configuracao: {
                    urlApi,
                    versaoAPI: validacao.versaoAPI,
                    limitesAPI: validacao.limites,
                    webhooksSuportados: validacao.webhooks
                }
            };

        } catch (error) {
            console.error('Erro ao conectar OMIE:', error);
            throw error;
        }
    }

    async conectarSankhya(credenciais) {
        try {
            const {
                servidor,
                usuario,
                senha,
                database
            } = credenciais;

            const conector = this.conectores.sankhya;
            
            const validacao = await conector.validarCredenciais({
                servidor,
                usuario,
                senha,
                database
            });

            if (!validacao.valido) {
                throw new Error(validacao.erro);
            }

            const mapeamento = {
                produtos: {
                    origem: 'AD_PRODUTO',
                    campos: {
                        'CODPROD': 'codigo',
                        'DESCRPROD': 'nome',
                        'VLRVENDA': 'preco_venda',
                        'CODNCM': 'codigo_ncm'
                    }
                },
                clientes: {
                    origem: 'AD_PARCEIRO',
                    campos: {
                        'CODPARC': 'codigo',
                        'RAZAOSOCIAL': 'nome_razao_social',
                        'CGC_CPF': 'cpf_cnpj'
                    }
                }
            };

            return {
                conector,
                mapeamento,
                configuracao: {
                    servidor,
                    database,
                    versaoSankhya: validacao.versao
                }
            };

        } catch (error) {
            console.error('Erro ao conectar Sankhya:', error);
            throw error;
        }
    }

    async executarSincronizacaoBidirecional(integracaoId, entidade) {
        try {
            const integracao = await this.obterIntegracao(integracaoId);
            const conector = this.conectores[integracao.provedor];

            const [dadosERP, dadosExterno] = await Promise.all([
                this.obterDadosERP(entidade, integracao.empresaId),
                conector.obterDados(entidade, integracao.configuracoes)
            ]);

            const resolucaoConflitos = await this.resolverConflitosIA({
                dadosERP,
                dadosExterno,
                regrasPrioridade: integracao.configuracoes.regrasPrioridade
            });

            const resultados = {
                erpParaExterno: [],
                externoParaERP: [],
                conflitosResolvidos: [],
                erros: []
            };

            for (const resolucao of resolucaoConflitos) {
                try {
                    switch (resolucao.acao) {
                        case 'atualizar_erp':
                            await this.atualizarRegistroERP(resolucao.registro, entidade);
                            resultados.externoParaERP.push(resolucao.registro);
                            break;
                            
                        case 'atualizar_externo':
                            await conector.atualizarRegistro(resolucao.registro, entidade);
                            resultados.erpParaExterno.push(resolucao.registro);
                            break;
                            
                        case 'conflito_resolvido':
                            resultados.conflitosResolvidos.push(resolucao);
                            break;
                    }
                } catch (error) {
                    resultados.erros.push({
                        registro: resolucao.registro,
                        erro: error.message
                    });
                }
            }

            return resultados;

        } catch (error) {
            console.error('Erro na sincronização bidirecional:', error);
            throw error;
        }
    }

    async sincronizarMarketplaces(empresaId, marketplaces) {
        try {
            const resultados = {};

            for (const marketplace of marketplaces) {
                const conector = this.conectores[marketplace.tipo];
                
                if (!conector) {
                    console.warn(`Conector não encontrado para ${marketplace.tipo}`);
                    continue;
                }

                try {
                    const produtosERP = await this.obterProdutosERP(empresaId);
                    const produtosMarketplace = await conector.obterProdutos(marketplace.credenciais);

                    const sincronizacaoProdutos = await this.sincronizarProdutosMarketplace({
                        produtosERP,
                        produtosMarketplace,
                        marketplace,
                        conector
                    });

                    const pedidosMarketplace = await conector.obterPedidos(marketplace.credenciais);
                    const sincronizacaoPedidos = await this.importarPedidosMarketplace({
                        pedidos: pedidosMarketplace,
                        empresaId,
                        marketplace
                    });

                    const sincronizacaoEstoque = await this.sincronizarEstoqueMarketplace({
                        empresaId,
                        marketplace,
                        conector
                    });

                    resultados[marketplace.tipo] = {
                        produtos: sincronizacaoProdutos,
                        pedidos: sincronizacaoPedidos,
                        estoque: sincronizacaoEstoque,
                        status: 'sucesso'
                    };

                } catch (error) {
                    console.error(`Erro no marketplace ${marketplace.tipo}:`, error);
                    resultados[marketplace.tipo] = {
                        status: 'erro',
                        erro: error.message
                    };
                }
            }

            return resultados;

        } catch (error) {
            console.error('Erro na sincronização de marketplaces:', error);
            throw error;
        }
    }

    async processarWebhook(integracaoId, dados, headers) {
        try {
            const integracao = await this.obterIntegracao(integracaoId);
            const conector = this.conectores[integracao.provedor];

            const validacao = await conector.validarWebhook(dados, headers, integracao.configuracoes);
            
            if (!validacao.valido) {
                throw new Error('Webhook inválido');
            }

            const evento = validacao.evento;
            
            switch (evento.tipo) {
                case 'pedido_novo':
                    await this.processarPedidoWebhook(evento.dados, integracao);
                    break;
                    
                case 'produto_atualizado':
                    await this.processarProdutoWebhook(evento.dados, integracao);
                    break;
                    
                case 'estoque_alterado':
                    await this.processarEstoqueWebhook(evento.dados, integracao);
                    break;
                    
                case 'pagamento_confirmado':
                    await this.processarPagamentoWebhook(evento.dados, integracao);
                    break;
            }

            await this.registrarLogWebhook({
                integracaoId,
                evento: evento.tipo,
                dados: evento.dados,
                processadoEm: new Date(),
                status: 'processado'
            });

            return { status: 'processado', evento: evento.tipo };

        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            
            await this.registrarLogWebhook({
                integracaoId,
                evento: 'erro',
                dados,
                erro: error.message,
                processadoEm: new Date(),
                status: 'erro'
            });
            
            throw error;
        }
    }

    async obterIntegracao(integracaoId) {
        return { id: integracaoId, provedor: 'omie', empresaId: 1, configuracoes: {} };
    }

    async obterDadosERP(entidade, empresaId) {
        return [];
    }

    async resolverConflitosIA(dados) {
        return [];
    }

    async atualizarRegistroERP(registro, entidade) {
        return true;
    }

    async obterProdutosERP(empresaId) {
        return [];
    }

    async sincronizarProdutosMarketplace(dados) {
        return { processados: 0, erros: 0 };
    }

    async importarPedidosMarketplace(dados) {
        return { processados: 0, erros: 0 };
    }

    async sincronizarEstoqueMarketplace(dados) {
        return { processados: 0, erros: 0 };
    }

    async processarPedidoWebhook(dados, integracao) {
        return true;
    }

    async processarProdutoWebhook(dados, integracao) {
        return true;
    }

    async processarEstoqueWebhook(dados, integracao) {
        return true;
    }

    async processarPagamentoWebhook(dados, integracao) {
        return true;
    }

    async registrarLogWebhook(dados) {
        return true;
    }
}

module.exports = new IntegrationEngine();
