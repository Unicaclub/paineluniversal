import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  Users, 
  Brain, 
  BarChart3, 
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AnalyticsMEEP: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  const mockData = {
    checkins_por_hora: [
      { hora: '08:00', checkins: 12 },
      { hora: '09:00', checkins: 28 },
      { hora: '10:00', checkins: 45 },
      { hora: '11:00', checkins: 67 },
      { hora: '12:00', checkins: 89 },
      { hora: '13:00', checkins: 134 },
      { hora: '14:00', checkins: 156 },
      { hora: '15:00', checkins: 178 },
      { hora: '16:00', checkins: 145 },
      { hora: '17:00', checkins: 123 },
      { hora: '18:00', checkins: 98 },
      { hora: '19:00', checkins: 76 }
    ],
    previsoes_ia: [
      { dia: 'Seg', real: 245, previsto: 240, confianca: 94 },
      { dia: 'Ter', real: 289, previsto: 285, confianca: 92 },
      { dia: 'Qua', real: 312, previsto: 318, confianca: 96 },
      { dia: 'Qui', real: 278, previsto: 275, confianca: 93 },
      { dia: 'Sex', real: 356, previsto: 350, confianca: 95 },
      { dia: 'Sab', real: 423, previsto: 430, confianca: 97 },
      { dia: 'Dom', real: 389, previsto: 385, confianca: 94 }
    ],
    distribuicao_idade: [
      { faixa: '18-25', valor: 35, cor: '#3b82f6' },
      { faixa: '26-35', valor: 28, cor: '#10b981' },
      { faixa: '36-45', valor: 22, cor: '#f59e0b' },
      { faixa: '46-55', valor: 12, cor: '#ef4444' },
      { faixa: '55+', valor: 3, cor: '#8b5cf6' }
    ]
  };

  const handleExportData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Dados exportados');
    }, 2000);
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            📊 Analytics MEEP Avançado
          </h1>
          <p className="text-blue-200">
            Análises preditivas com IA • Insights em tempo real
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <Button
            onClick={handleExportData}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-blue-400">
              <Users className="h-4 w-4 mr-2" />
              Total Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">2,847</div>
            <div className="text-sm text-green-400 font-medium">+12.5% vs período anterior</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-purple-400">
              <Brain className="h-4 w-4 mr-2" />
              Precisão IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">94.2%</div>
            <div className="text-sm text-purple-400 font-medium">Previsões corretas</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-orange-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              Pico Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">14:30</div>
            <div className="text-sm text-orange-400 font-medium">Horário de maior fluxo</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-green-400">
              <BarChart3 className="h-4 w-4 mr-2" />
              Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">87.3%</div>
            <div className="text-sm text-green-400 font-medium">Taxa de conversão</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Check-ins por Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.checkins_por_hora}>
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
                <Bar dataKey="checkins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              Previsões vs Realidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.previsoes_ia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="dia" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="real" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Real"
                />
                <Line 
                  type="monotone" 
                  dataKey="previsto" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Previsto"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5 text-green-400" />
              Distribuição por Idade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockData.distribuicao_idade}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="valor"
                  label={({ faixa, valor }) => `${faixa}: ${valor}%`}
                >
                  {mockData.distribuicao_idade.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-orange-400" />
              Insights da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-blue-300">Padrão Identificado</span>
                </div>
                <p className="text-blue-200 text-sm">
                  Pico de check-ins ocorre consistentemente entre 14:00-16:00. 
                  Recomenda-se aumentar equipe neste período.
                </p>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-300">Tendência Positiva</span>
                </div>
                <p className="text-green-200 text-sm">
                  Taxa de conversão aumentou 12.5% nas últimas 2 semanas. 
                  Estratégias atuais estão funcionando bem.
                </p>
              </div>

              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-yellow-300">Oportunidade</span>
                </div>
                <p className="text-yellow-200 text-sm">
                  Público 18-25 anos representa 35% dos check-ins. 
                  Considere campanhas direcionadas para esta faixa etária.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsMEEP;
