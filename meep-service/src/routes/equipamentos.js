const express = require('express');
const router = express.Router();

router.get('/:evento_id', async (req, res) => {
    try {
        const { evento_id } = req.params;
        
        const mockEquipamentos = [
            {
                id: 1,
                nome: 'QR Reader 01',
                tipo: 'qr_reader',
                status: 'ativo',
                localizacao: 'Entrada Principal',
                ip_address: '192.168.1.10'
            },
            {
                id: 2,
                nome: 'Tablet Check-in 01',
                tipo: 'tablet',
                status: 'ativo',
                localizacao: 'Portão A',
                ip_address: '192.168.1.11'
            }
        ];
        
        res.json({
            success: true,
            data: mockEquipamentos
        });

    } catch (error) {
        console.error('Error getting equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
