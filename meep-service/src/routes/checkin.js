const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');

router.post('/generate-qr', 
    [
        body('cpf').notEmpty().withMessage('CPF is required'),
        body('evento_id').isInt().withMessage('Event ID must be integer')
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

            const { cpf, evento_id } = req.body;
            const cleanCPF = cpf.replace(/\D/g, '');

            const qrData = {
                cpf: cleanCPF,
                evento_id: evento_id,
                timestamp: Date.now(),
                hash: require('crypto').randomBytes(16).toString('hex')
            };

            const qrString = JSON.stringify(qrData);
            const qrCodeImage = await QRCode.toDataURL(qrString);

            res.json({
                success: true,
                data: {
                    qr_code: qrCodeImage,
                    qr_hash: qrData.hash,
                    cliente_nome: 'Cliente Teste',
                    valido_ate: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });

        } catch (error) {
            console.error('Error generating QR code:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
);

router.post('/validate-access',
    [
        body('qr_code').notEmpty().withMessage('QR code is required'),
        body('cpf_digits').isLength({ min: 3, max: 3 }).withMessage('CPF digits must be 3 characters')
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

            const { qr_code, cpf_digits } = req.body;

            let qrData;
            try {
                qrData = JSON.parse(qr_code);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid QR code format'
                });
            }

            const clienteCPF = qrData.cpf;
            const expectedDigits = clienteCPF.substring(0, 3);

            if (cpf_digits !== expectedDigits) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid CPF digits'
                });
            }

            const qrTimestamp = qrData.timestamp;
            const now = Date.now();
            const validityPeriod = 24 * 60 * 60 * 1000;

            if (now - qrTimestamp > validityPeriod) {
                return res.status(400).json({
                    success: false,
                    error: 'QR code expired'
                });
            }

            res.json({
                success: true,
                data: {
                    cliente_nome: 'Cliente Validado',
                    cliente_cpf: clienteCPF,
                    evento_id: qrData.evento_id,
                    timestamp: new Date()
                },
                message: 'Access validated successfully'
            });

        } catch (error) {
            console.error('Error validating access:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
);

module.exports = router;
