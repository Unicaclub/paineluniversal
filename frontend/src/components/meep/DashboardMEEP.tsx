import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Brain,
  Zap,
  Shield,
  Activity,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface DashboardMEEPProps {
  eventoId: number;
}

interface DashboardData {
  evento_id: number;
  evento_nome: string;
  metricas_tempo_real: {
    total_checkins: number;
    checkins_hoje: number;
    ocupacao_percentual: number;
    capacidade_maxima: number;
    receita_total: number;
    equipamentos_ativos: number;
    operadores_ativos: number;
  };
  previsoes_ia: {
    capacidade_proximas_horas: any[];
    pico_esperado: any;
    recomendacoes: string[];
  };
  fluxo_horario: any[];
  alertas_seguranca: any[];
  performance_sistema: {
    tempo_resposta_medio: string;
    disponibilidade: string;
    precisao_ia: string;
  };
}

const DashboardMEEP: React.FC<DashboardMEEPProps> = ({ eventoId }) => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const mockData: DashboardData = {
          evento_id: eventoId,
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
        
        setDashboard(mockData);
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      } catch (error) {
        console.error('Erro ao carregar dashboard MEEP:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, [eventoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="animate-pulse h-8 w-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando dashboard MEEP...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Erro ao carregar dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 min-h-screen">
      <div className="glass-card p-6 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🎯 Sistema MEEP Universal
            </h1>
            <p className="text-blue-200">
              {dashboard.evento_nome} • Analytics IA • Controle Total
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Brain className="w-4 h-4 mr-1" />
              IA {dashboard.performance_sistema.precisao_ia} Precisão
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Activity className="w-4 h-4 mr-1" />
              {lastUpdate}
            </Badge>
          </div>
        </div>
      </div>

      {dashboard.alertas_seguranca.length > 0 && (
        <div className="space-y-2">
          {dashboard.alertas_seguranca.map((alerta, index) => (
            <Alert key={index} className="bg-yellow-500/10 border-yellow-500/30 glass-card">
              <Shield className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                <strong>{alerta.mensagem}</strong> - {alerta.acao_recomendada}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/20 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-blue-400">
              <Users className="h-4 w-4 mr-2" />
              Ocupação Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {dashboard.metricas_tempo_real.ocupacao_percentual}%
            </div>
            <div className="text-sm text-blue-400 font-medium">
              {dashboard.metricas_tempo_real.total_checkins} / {dashboard.metricas_tempo_real.capacidade_maxima}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {dashboard.metricas_tempo_real.checkins_hoje} check-ins hoje
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-green-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              R$ {dashboard.metricas_tempo_real.receita_total.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm text-green-400 font-medium">
              +12.5% vs esperado
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Ticket médio: R$ 72,00
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-purple-400">
              <Zap className="h-4 w-4 mr-2" />
              Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {dashboard.metricas_tempo_real.equipamentos_ativos}
            </div>
            <div className="text-sm text-purple-400 font-medium">
              Todos operacionais
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {dashboard.metricas_tempo_real.operadores_ativos} operadores ativos
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-orange-400">
              <Brain className="h-4 w-4 mr-2" />
              Performance IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {dashboard.performance_sistema.precisao_ia}
            </div>
            <div className="text-sm text-orange-400 font-medium">
              Precisão previsões
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Tempo resposta: {dashboard.performance_sistema.tempo_resposta_medio}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              Previsão IA - Próximas Horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboard.previsoes_ia.capacidade_proximas_horas}>
                <defs>
                  <linearGradient id="previsaoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hora" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="checkins_previstos" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#previsaoGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-green-400" />
              Fluxo por Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.fluxo_horario.map((fluxo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="font-semibold text-white">{fluxo.hora}</div>
                    <div className="text-sm text-gray-400">{fluxo.total_checkins} check-ins</div>
                  </div>
                  <Badge className={`
                    ${fluxo.intensidade === 'alta' ? 'bg-red-500/20 text-red-300' : 
                      fluxo.intensidade === 'media' ? 'bg-yellow-500/20 text-yellow-300' : 
                      'bg-green-500/20 text-green-300'}
                  `}>
                    {fluxo.intensidade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {dashboard.previsoes_ia.recomendacoes.length > 0 && (
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-blue-400" />
              Recomendações Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.previsoes_ia.recomendacoes.map((recomendacao, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Brain className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span className="text-blue-200">{recomendacao}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button className="glass-card border-white/20 h-16 bg-blue-600/20 hover:bg-blue-600/30 text-white">
          <Users className="w-5 h-5 mr-2" />
          Controle Capacidade
        </Button>
        <Button className="glass-card border-white/20 h-16 bg-green-600/20 hover:bg-green-600/30 text-white">
          <Shield className="w-5 h-5 mr-2" />
          Logs Segurança
        </Button>
        <Button className="glass-card border-white/20 h-16 bg-purple-600/20 hover:bg-purple-600/30 text-white">
          <Brain className="w-5 h-5 mr-2" />
          Relatórios IA
        </Button>
        <Button className="glass-card border-white/20 h-16 bg-orange-600/20 hover:bg-orange-600/30 text-white">
          <Zap className="w-5 h-5 mr-2" />
          Equipamentos
        </Button>
      </div>
    </div>
  );
};

export default DashboardMEEP;
