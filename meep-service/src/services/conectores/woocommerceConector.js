class WooCommerceConector {
    constructor() {
        this.baseURL = '';
    }

    async validarCredenciais({ siteUrl, consumerKey, consumerSecret }) {
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

module.exports = new WooCommerceConector();
