const express = require('express');
const router = express.Router();
const marketingService = require('../services/marketingService');

router.post('/pontos/calcular', async (req, res) => {
    try {
        const { clienteCpf, valorCompra, eventoId, tipoTransacao } = req.body;
        
        if (!clienteCpf || !valorCompra || !eventoId) {
            return res.status(400).json({
                success: false,
                error: 'Dados obrigatórios: clienteCpf, valorCompra, eventoId'
            });
        }
        
        const resultado = await marketingService.calcularPontosInteligentes({
            clienteCpf,
            valorCompra,
            eventoId,
            tipoTransacao: tipoTransacao || 'compra'
        });
        
        res.json({
            success: true,
            data: resultado
        });
        
    } catch (error) {
        console.error('Erro ao calcular pontos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

router.post('/segmentacao/executar', async (req, res) => {
    try {
        const { empresaId, algoritmo = 'rfm' } = req.body;
        
        if (!empresaId) {
            return res.status(400).json({
                success: false,
                error: 'empresaId é obrigatório'
            });
        }
        
        const resultados = await marketingService.executarSegmentacaoIA(empresaId, algoritmo);
        
        res.json({
            success: true,
            data: {
                algoritmo,
                totalSegmentos: resultados.length,
                segmentos: resultados
            }
        });
        
    } catch (error) {
        console.error('Erro na segmentação:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

router.get('/analise-preditiva/:clienteCpf', async (req, res) => {
    try {
        const { clienteCpf } = req.params;
        
        const analise = await marketingService.executarAnalisePreditiva(clienteCpf);
        
        res.json({
            success: true,
            data: analise
        });
        
    } catch (error) {
        console.error('Erro na análise preditiva:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

router.get('/dashboard/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;
        
        const dashboard = await marketingService.obterDashboardMarketing(parseInt(empresaId));
        
        res.json({
            success: true,
            data: dashboard
        });
        
    } catch (error) {
        console.error('Erro ao obter dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

router.get('/metricas/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;
        const { periodo = 30 } = req.query;
        
        const metricas = await marketingService.obterMetricasMarketing(
            parseInt(empresaId), 
            parseInt(periodo)
        );
        
        res.json({
            success: true,
            data: metricas
        });
        
    } catch (error) {
        console.error('Erro ao obter métricas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

router.post('/campanhas/:campanhaId/metricas', async (req, res) => {
    try {
        const { campanhaId } = req.params;
        const { tipo, valor = 1 } = req.body;
        
        if (!tipo || !['envio', 'abertura', 'clique', 'conversao'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                error: 'Tipo de métrica inválido'
            });
        }
        
        await marketingService.atualizarMetricaCampanha(parseInt(campanhaId), tipo, valor);
        
        res.json({
            success: true,
            message: 'Métrica atualizada com sucesso'
        });
        
    } catch (error) {
        console.error('Erro ao atualizar métrica:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

router.post('/eventos/transacao-fidelidade', async (req, res) => {
    try {
        const dadosTransacao = req.body;
        
        marketingService.emit('transacao_fidelidade', dadosTransacao);
        
        res.json({
            success: true,
            message: 'Evento processado'
        });
        
    } catch (error) {
        console.error('Erro ao processar evento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

router.post('/eventos/nivel-upgrade', async (req, res) => {
    try {
        const dadosUpgrade = req.body;
        
        marketingService.emit('nivel_upgrade', dadosUpgrade);
        
        res.json({
            success: true,
            message: 'Evento processado'
        });
        
    } catch (error) {
        console.error('Erro ao processar evento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

router.post('/eventos/campanha-executada', async (req, res) => {
    try {
        const dadosCampanha = req.body;
        
        marketingService.emit('campanha_executada', dadosCampanha);
        
        res.json({
            success: true,
            message: 'Evento processado'
        });
        
    } catch (error) {
        console.error('Erro ao processar evento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'MarketingService',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
