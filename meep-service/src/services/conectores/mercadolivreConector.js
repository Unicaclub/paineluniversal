class MercadoLivreConector {
    constructor() {
        this.baseURL = 'https://api.mercadolibre.com/';
    }

    async validarCredenciais({ clientId, clientSecret, accessToken }) {
        return { valido: true };
    }

    async obterProdutos(credenciais) {
        return [];
    }

    async obterPedidos(credenciais) {
        return [];
    }

    async atualizarRegistro(registro, entidade) {
        return true;
    }

    async validarWebhook(dados, headers, configuracoes) {
        return {
            valido: true,
            evento: {
                tipo: 'pedido_novo',
                dados: dados
            }
        };
    }
}

module.exports = new MercadoLivreConector();
