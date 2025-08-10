const express = require('express');
const router = express.Router();
const erpCoreService = require('../services/erpCoreService');
const iaERPEngine = require('../services/iaERPEngine');
const integrationEngine = require('../services/integrationEngine');

router.get('/dashboard/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;
        const { periodo = 30 } = req.query;
        
        const dashboard = await erpCoreService.gerarDashboardExecutivo(empresaId, periodo);
        
        res.json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Erro ao obter dashboard executivo:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/fluxo-caixa/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;
        const { diasProjecao = 90 } = req.query;
        
        const fluxoCaixa = await erpCoreService.gerarFluxoCaixaPreditivo(empresaId, parseInt(diasProjecao));
        
        res.json({
            success: true,
            data: fluxoCaixa
        });
    } catch (error) {
        console.error('Erro ao gerar fluxo de caixa preditivo:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/conciliacao-bancaria', async (req, res) => {
    try {
        const { empresaId, bancoContaId, periodo } = req.body;
        
        const conciliacao = await erpCoreService.conciliacaoBancariaIA(empresaId, bancoContaId, periodo);
        
        res.json({
            success: true,
            data: conciliacao
        });
    } catch (error) {
        console.error('Erro na conciliação bancária:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/previsao-demanda/:produtoId', async (req, res) => {
    try {
        const { produtoId } = req.params;
        const { diasPrevisao = 60 } = req.query;
        
        const previsao = await erpCoreService.previsaoDemandaIA(produtoId, parseInt(diasPrevisao));
        
        res.json({
            success: true,
            data: previsao
        });
    } catch (error) {
        console.error('Erro na previsão de demanda:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/analise-vendas/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;
        const { periodo = 30 } = req.query;
        
        const analise = await erpCoreService.analisarPerformanceVendas(empresaId, parseInt(periodo));
        
        res.json({
            success: true,
            data: analise
        });
    } catch (error) {
        console.error('Erro na análise de vendas:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/cliente-360/:clienteId', async (req, res) => {
    try {
        const { clienteId } = req.params;
        
        const analise = await erpCoreService.analisarClienteIA(clienteId);
        
        res.json({
            success: true,
            data: analise
        });
    } catch (error) {
        console.error('Erro na análise 360 do cliente:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/integracoes/configurar', async (req, res) => {
    try {
        const { empresaId, tipoIntegracao, configuracao } = req.body;
        
        const integracao = await erpCoreService.configurarIntegracao(empresaId, tipoIntegracao, configuracao);
        
        res.json({
            success: true,
            data: integracao
        });
    } catch (error) {
        console.error('Erro ao configurar integração:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/integracoes/:integracaoId/sincronizar', async (req, res) => {
    try {
        const { integracaoId } = req.params;
        
        const resultado = await erpCoreService.executarSincronizacaoInteligente(integracaoId);
        
        res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        console.error('Erro na sincronização:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/ia/previsao-vendas', async (req, res) => {
    try {
        const { empresaId, historicoVendas, sazonalidade, diasPrevisao } = req.body;
        
        const previsao = await iaERPEngine.preverVendas({
            empresaId,
            historicoVendas,
            sazonalidade,
            diasPrevisao
        });
        
        res.json({
            success: true,
            data: previsao
        });
    } catch (error) {
        console.error('Erro na previsão de vendas IA:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/ia/score-credito', async (req, res) => {
    try {
        const { dadosCliente } = req.body;
        
        const score = await iaERPEngine.calcularScoreCredito(dadosCliente);
        
        res.json({
            success: true,
            data: score
        });
    } catch (error) {
        console.error('Erro no cálculo de score de crédito:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/ia/deteccao-fraude', async (req, res) => {
    try {
        const { transacao } = req.body;
        
        const analise = await iaERPEngine.detectarFraudesAnomalias(transacao);
        
        res.json({
            success: true,
            data: analise
        });
    } catch (error) {
        console.error('Erro na detecção de fraudes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/ia/otimizacao-precos', async (req, res) => {
    try {
        const dados = req.body;
        
        const otimizacao = await iaERPEngine.otimizarPrecos(dados);
        
        res.json({
            success: true,
            data: otimizacao
        });
    } catch (error) {
        console.error('Erro na otimização de preços:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/webhooks/:integracaoId', async (req, res) => {
    try {
        const { integracaoId } = req.params;
        const dados = req.body;
        const headers = req.headers;
        
        const resultado = await integrationEngine.processarWebhook(integracaoId, dados, headers);
        
        res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
