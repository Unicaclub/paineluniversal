class SankhyaConector {
    constructor() {
        this.baseURL = '';
    }

    async validarCredenciais({ servidor, usuario, senha, database }) {
        try {
            return {
                valido: true,
                versao: '3.0',
                limites: { requestsPorMinuto: 100 }
            };
        } catch (error) {
            return {
                valido: false,
                erro: error.message
            };
        }
    }

    async obterDados(entidade, configuracoes) {
        return [];
    }

    async atualizarRegistro(registro, entidade) {
        return true;
    }

    async validarWebhook(dados, headers, configuracoes) {
        return {
            valido: true,
            evento: {
                tipo: 'produto_atualizado',
                dados: dados
            }
        };
    }
}

module.exports = new SankhyaConector();
