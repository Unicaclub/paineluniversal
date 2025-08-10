const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const MapaOperacaoService = require('../services/mapaOperacaoService');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
});

router.use(limiter);

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    next();
};

router.get('/eventos/:eventoId/layout',
    [
        param('eventoId').isInt().withMessage('ID do evento deve ser um número'),
        query('mostrarApenasAtivas').optional().isBoolean(),
        query('tipoArea').optional().isString(),
        query('statusMesa').optional().isString(),
        query('grupoCartao').optional().isInt()
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { eventoId } = req.params;
            const filtros = {
                mostrarApenasAtivas: req.query.mostrarApenasAtivas !== 'false',
                tipoArea: req.query.tipoArea,
                statusMesa: req.query.statusMesa,
                grupoCartao: req.query.grupoCartao ? parseInt(req.query.grupoCartao) : null,
                forceRefresh: req.query.forceRefresh === 'true'
            };

            const layout = await MapaOperacaoService.obterLayoutEvento(parseInt(eventoId), filtros);

            res.json({
                success: true,
                data: layout,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting event layout:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting event layout',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

router.get('/eventos/:eventoId/estatisticas',
    [
        param('eventoId').isInt().withMessage('ID do evento deve ser um número')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { eventoId } = req.params;
            const estatisticas = await MapaOperacaoService.calcularEstatisticasEvento(parseInt(eventoId));

            res.json({
                success: true,
                data: estatisticas,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting event statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting event statistics',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

router.post('/eventos/:eventoId/buscar',
    [
        param('eventoId').isInt().withMessage('ID do evento deve ser um número'),
        body('busca_texto').notEmpty().withMessage('Texto de busca é obrigatório'),
        body('busca_tipo').optional().isIn(['cpf', 'mesa', 'comanda', 'cartao']).withMessage('Tipo de busca inválido')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { eventoId } = req.params;
            const filtros = req.body;

            const resultados = await MapaOperacaoService.buscarOperacao(parseInt(eventoId), filtros);

            res.json({
                success: true,
                data: resultados,
                count: resultados.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error searching operation:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching operation',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

router.put('/mesas/:mesaId/status',
    [
        param('mesaId').isInt().withMessage('ID da mesa deve ser um número'),
        body('novoStatus').isIn(['disponivel', 'ocupada', 'reservada', 'bloqueada', 'manutencao']).withMessage('Status inválido'),
        body('usuarioId').isInt().withMessage('ID do usuário é obrigatório'),
        body('observacoes').optional().isString()
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { mesaId } = req.params;
            const { novoStatus, usuarioId, observacoes } = req.body;

            const mesa = await MapaOperacaoService.atualizarStatusMesa(
                parseInt(mesaId),
                novoStatus,
                parseInt(usuarioId),
                observacoes
            );

            res.json({
                success: true,
                message: 'Status da mesa atualizado com sucesso',
                data: mesa,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error updating mesa status:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error updating mesa status',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

router.post('/eventos/:eventoId/comandas',
    [
        param('eventoId').isInt().withMessage('ID do evento deve ser um número'),
        body('numero_comanda').notEmpty().withMessage('Número da comanda é obrigatório'),
        body('mesa_id').optional().isInt().withMessage('ID da mesa deve ser um número'),
        body('cliente_principal_cpf').optional().matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos'),
        body('tipo').optional().isIn(['mesa', 'balcao', 'delivery', 'take_away']).withMessage('Tipo inválido'),
        body('usuarioId').isInt().withMessage('ID do usuário é obrigatório'),
        body('observacoes').optional().isString()
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { eventoId } = req.params;
            const { usuarioId, ...comandaData } = req.body;

            const comanda = await MapaOperacaoService.abrirComanda(
                parseInt(eventoId),
                comandaData,
                parseInt(usuarioId)
            );

            res.status(201).json({
                success: true,
                message: 'Comanda aberta com sucesso',
                data: comanda,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error opening comanda:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error opening comanda',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

router.post('/bloqueios',
    [
        body('tipo').isIn(['cliente', 'mesa', 'comanda', 'area']).withMessage('Tipo de bloqueio inválido'),
        body('referencia_id').notEmpty().withMessage('ID de referência é obrigatório'),
        body('evento_id').isInt().withMessage('ID do evento deve ser um número'),
        body('motivo').notEmpty().withMessage('Motivo do bloqueio é obrigatório'),
        body('usuarioId').isInt().withMessage('ID do usuário é obrigatório'),
        body('detalhes').optional().isString(),
        body('temporario').optional().isBoolean(),
        body('expira_em').optional().isISO8601().withMessage('Data de expiração deve ser válida')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { usuarioId, ...bloqueioData } = req.body;

            const bloqueio = await MapaOperacaoService.criarBloqueio(
                bloqueioData,
                parseInt(usuarioId)
            );

            res.status(201).json({
                success: true,
                message: 'Bloqueio criado com sucesso',
                data: bloqueio,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error creating bloqueio:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error creating bloqueio',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

router.post('/eventos/:eventoId/cartoes',
    [
        param('eventoId').isInt().withMessage('ID do evento deve ser um número'),
        body('numero_cartao').notEmpty().withMessage('Número do cartão é obrigatório'),
        body('cliente_cpf').optional().matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos'),
        body('grupo_id').optional().isInt().withMessage('ID do grupo deve ser um número'),
        body('saldo_credito').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Saldo deve ser um valor decimal'),
        body('limite_consumo').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Limite deve ser um valor decimal'),
        body('usuarioId').isInt().withMessage('ID do usuário é obrigatório')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { eventoId } = req.params;
            const { usuarioId, ...cartaoData } = req.body;

            const cartao = await MapaOperacaoService.emitirCartao(
                parseInt(eventoId),
                cartaoData,
                parseInt(usuarioId)
            );

            res.status(201).json({
                success: true,
                message: 'Cartão emitido com sucesso',
                data: cartao,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error emitting cartao:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error emitting cartao',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Mapa Operação Service is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;
