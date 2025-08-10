class NFEIoConector {
    constructor() {
        this.baseURL = 'https://api.nfe.io/v1/';
    }

    async validarCredenciais({ apiKey, companyId }) {
        return { valido: true };
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
                tipo: 'nfe_emitida',
                dados: dados
            }
        };
    }
}

module.exports = new NFEIoConector();
