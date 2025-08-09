const express = require('express');
const router = express.Router();

router.get('/dashboard/:evento_id', async (req, res) => {
    try {
        const { evento_id } = req.params;
        
        const mockData = {
            evento_id: parseInt(evento_id),
            evento_nome: "Festival de Verão 2025",
            metricas_tempo_real: {
                total_checkins: 1247,
                checkins_hoje: 892,
                ocupacao_percentual: 78.5,
                capacidade_maxima: 1500,
                receita_total: 89750.50,
                equipamentos_ativos: 12,
                operadores_ativos: 8
            },
            previsoes_ia: {
                capacidade_proximas_horas: [
                    { hora: "14:00", checkins_previstos: 45, confianca_percentual: 94.2 },
                    { hora: "15:00", checkins_previstos: 78, confianca_percentual: 92.1 },
                    { hora: "16:00", checkins_previstos: 156, confianca_percentual: 95.3 }
                ],
                pico_esperado: { hora: "20:00", checkins_previstos: 234 },
                recomendacoes: [
                    "Pico esperado às 20:00 - aumentar equipe",
                    "Alto fluxo previsto - ativar equipamentos extras"
                ]
            },
            fluxo_horario: [
                { hora: "12:00", total_checkins: 23, intensidade: "baixa" },
                { hora: "13:00", total_checkins: 45, intensidade: "media" },
                { hora: "14:00", total_checkins: 78, intensidade: "alta" }
            ],
            alertas_seguranca: [
                {
                    tipo: "seguranca",
                    nivel: "medio",
                    mensagem: "3 tentativas de acesso falhadas detectadas",
                    acao_recomendada: "Verificar logs de segurança"
                }
            ],
            performance_sistema: {
                tempo_resposta_medio: "1.2s",
                disponibilidade: "99.8%",
                precisao_ia: "94.2%"
            }
        };
        
        res.json({
            success: true,
            data: mockData
        });

    } catch (error) {
        console.error('Error getting analytics dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

router.post('/previsao-capacidade/:evento_id', async (req, res) => {
    try {
        const { evento_id } = req.params;
        
        res.json({
            success: true,
            message: "Previsão de capacidade iniciada",
            evento_id: parseInt(evento_id),
            tempo_estimado: "2-3 minutos"
        });

    } catch (error) {
        console.error('Error generating capacity prediction:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
