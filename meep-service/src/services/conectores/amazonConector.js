class AmazonConector {
    constructor() {
        this.baseURL = 'https://sellingpartnerapi-na.amazon.com/';
    }

    async validarCredenciais({ sellerId, accessKey, secretKey }) {
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

module.exports = new AmazonConector();
