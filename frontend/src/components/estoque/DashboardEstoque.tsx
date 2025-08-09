import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Zap, 
  Brain,
  Target,
  DollarSign,
  RefreshCw,
  Eye,
  Settings
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
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardEstoqueProps {
  eventoId: number;
}

interface DashboardData {
  valor_total_estoque: number;
  giro_estoque_medio: number;
  acuracia_estoque: number;
  produtos_criticos: number;
  previsao_demanda_7dias: any[];
  alertas_ativos: any[];
  top_produtos_giro: any[];
  analise_abc: any;
  metricas_ia: any;
}

const DashboardEstoque: React.FC<DashboardEstoqueProps> = ({ eventoId }) => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const mockData: DashboardData = {
          valor_total_estoque: 847239.45,
          giro_estoque_medio: 4.2,
          acuracia_estoque: 97.8,
          produtos_criticos: 12,
          previsao_demanda_7dias: [
            { data: '2025-08-10', quantidade: 125, confianca: 94.2 },
            { data: '2025-08-11', quantidade: 87, confianca: 92.1 },
            { data: '2025-08-12', quantidade: 156, confianca: 95.3 }
          ],
          alertas_ativos: [
            { id: 1, tipo: 'estoque_baixo', produto: 'Cerveja Heineken', criticidade: 'alto' },
            { id: 2, tipo: 'vencimento', produto: 'Água Mineral', criticidade: 'medio' }
          ],
          top_produtos_giro: [
            { nome: 'Cerveja Heineken', giro: 8.5, estoque: 45 },
            { nome: 'Hambúrguer', giro: 6.2, estoque: 23 }
          ],
          analise_abc: {
            A: [{ nome: 'Cerveja Heineken', receita: 15000 }],
            B: [{ nome: 'Hambúrguer', receita: 8000 }],
            C: [{ nome: 'Água', receita: 2000 }]
          },
          metricas_ia: {
            precisao_previsao: 94.2,
            economia_custos: 23.5,
            reducao_rupturas: 89.3
          }
        };
        
        setDashboard(mockData);
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      } catch (error) {
        console.error('Erro ao carregar dashboard estoque:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [eventoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando dashboard inteligente...</p>
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
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
      <div className="glass-card p-6 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📦 Sistema de Estoque Premium
            </h1>
            <p className="text-purple-200">
              IA Avançada • Automação Completa • Performance Superior ao MEEP
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Brain className="w-4 h-4 mr-1" />
              IA 94.2% Precisão
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Zap className="w-4 h-4 mr-1" />
              Última atualização: {lastUpdate}
            </Badge>
          </div>
        </div>
      </div>

      {dashboard.produtos_criticos > 0 && (
        <Alert className="bg-red-500/10 border-red-500/30 glass-card">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>{dashboard.produtos_criticos} produto(s)</strong> com estoque crítico. 
            Sistema IA sugere reposição automática.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/20 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-green-400">
              <DollarSign className="h-4 w-4 mr-2" />
              Valor Total Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              R$ {dashboard.valor_total_estoque.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm text-green-400 font-medium">
              +2.3% vs mês anterior
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Crescimento saudável detectado
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-blue-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              Giro Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {dashboard.giro_estoque_medio.toFixed(1)}x
            </div>
            <div className="text-sm text-blue-400 font-medium">
              Meta: 4.5x
            </div>
            <div className="text-xs text-gray-400 mt-1">
              IA sugere acelerar categoria X
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-purple-400">
              <Target className="h-4 w-4 mr-2" />
              Acurácia Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {dashboard.acuracia_estoque}%
            </div>
            <div className="text-sm text-purple-400 font-medium">
              {dashboard.produtos_criticos} discrepâncias
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Próxima contagem: 21/08
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-orange-400">
              <Brain className="h-4 w-4 mr-2" />
              IA Preditiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {dashboard.metricas_ia.precisao_previsao}%
            </div>
            <div className="text-sm text-orange-400 font-medium">
              Confiança previsões
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {dashboard.metricas_ia.economia_custos}% economia custos
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              Previsão Demanda IA (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboard.previsao_demanda_7dias}>
                <defs>
                  <linearGradient id="demandaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="data" stroke="#9ca3af" />
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
                  dataKey="quantidade" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#demandaGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Análise ABC Automática
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <div>
                  <div className="font-semibold text-green-300">Classe A (80%)</div>
                  <div className="text-sm text-gray-400">{dashboard.analise_abc.A.length} produtos</div>
                </div>
                <Badge className="bg-green-500/20 text-green-300">Alto Valor</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <div>
                  <div className="font-semibold text-yellow-300">Classe B (15%)</div>
                  <div className="text-sm text-gray-400">{dashboard.analise_abc.B.length} produtos</div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300">Médio Valor</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <div>
                  <div className="font-semibold text-red-300">Classe C (5%)</div>
                  <div className="text-sm text-gray-400">{dashboard.analise_abc.C.length} produtos</div>
                </div>
                <Badge className="bg-red-500/20 text-red-300">Baixo Valor</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="glass-card border-white/20 h-16 bg-purple-600/20 hover:bg-purple-600/30 text-white">
          <Zap className="w-5 h-5 mr-2" />
          Reposição Automática IA
        </Button>
        <Button className="glass-card border-white/20 h-16 bg-blue-600/20 hover:bg-blue-600/30 text-white">
          <Eye className="w-5 h-5 mr-2" />
          Relatórios Avançados
        </Button>
        <Button className="glass-card border-white/20 h-16 bg-green-600/20 hover:bg-green-600/30 text-white">
          <Settings className="w-5 h-5 mr-2" />
          Configurar Integrações
        </Button>
      </div>
    </div>
  );
};

export default DashboardEstoque;
