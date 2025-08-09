const express = require('express');
const router = express.Router();

router.get('/logs', async (req, res) => {
    try {
        const mockLogs = [
            {
                id: 1,
                timestamp: new Date(),
                tipo: 'checkin_success',
                cpf_prefixo: '123',
                ip_address: '192.168.1.100',
                resultado: 'sucesso'
            },
            {
                id: 2,
                timestamp: new Date(),
                tipo: 'checkin_failed',
                cpf_prefixo: '456',
                ip_address: '192.168.1.101',
                resultado: 'cpf_invalido'
            }
        ];
        
        res.json({
            success: true,
            data: mockLogs
        });

    } catch (error) {
        console.error('Error getting validation logs:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
