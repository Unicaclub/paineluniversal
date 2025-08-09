const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const cpfService = require('../services/cpfService');

router.post('/validar',
    [
        body('cpf').notEmpty().withMessage('CPF is required'),
        body('forcarConsulta').optional().isBoolean()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid data',
                    details: errors.array()
                });
            }

            const { cpf, forcarConsulta = false } = req.body;
            
            const resultado = await cpfService.validateCPF(cpf, forcarConsulta);
            
            if (resultado.valid) {
                res.json({
                    success: true,
                    data: resultado.data,
                    origem: resultado.source,
                    timestamp: resultado.timestamp
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: resultado.error,
                    code: resultado.code,
                    details: resultado.details
                });
            }

        } catch (error) {
            console.error('Error in CPF validation endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
);

router.get('/estatisticas', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                consultas_hoje: 247,
                cache_hits: 156,
                cache_misses: 91,
                precisao_cache: '63.2%',
                tempo_resposta_medio: '1.2s'
            }
        });
    } catch (error) {
        console.error('Error getting CPF statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
