import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Gift,
  BarChart3,
  Zap,
  Crown,
  Star,
  Award,
  Activity
} from 'lucide-react';

interface MetricasMarketing {
  totalClientesFidelidade: number;
  pontosEmitidos: number;
  pontosResgatados: number;
  campanhasAtivas: number;
  promocoesAtivas: number;
  segmentosAtivos: number;
  taxaEngajamento: number;
  roiFidelidade: number;
  conversaoCampanhas: number;
}

interface DashboardMarketingData {
  metricas: MetricasMarketing;
  campanhasRecentes: any[];
  segmentosTop: any[];
  promocoesAtivas: any[];
  ultimaAtualizacao: string;
}

const DashboardMarketing: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardMarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<number>(1);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/marketing/dashboard/${empresaId}`);
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard marketing:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDashboard();
    
    const interval = setInterval(carregarDashboard, 30000);
    return () => clearInterval(interval);
  }, [empresaId]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Carregando Dashboard Marketing...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
          <Button onClick={carregarDashboard} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const { metricas } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing e CRM MEEP Supremo</h1>
          <p className="text-gray-600 mt-2">Dashboard completo de marketing e fidelidade</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={carregarDashboard} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Fidelidade</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metricas.totalClientesFidelidade)}</div>
            <p className="text-xs opacity-80">Total de clientes ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Emitidos</CardTitle>
            <Star className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metricas.pontosEmitidos)}</div>
            <p className="text-xs opacity-80">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.campanhasAtivas}</div>
            <p className="text-xs opacity-80">Em execução</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Fidelidade</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.roiFidelidade.toFixed(1)}%</div>
            <p className="text-xs opacity-80">Retorno sobre investimento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              Promoções Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {metricas.promocoesAtivas}
            </div>
            <p className="text-sm text-gray-600">Promoções em andamento</p>
            <div className="mt-4">
              <Badge variant="secondary">
                {metricas.pontosResgatados} pontos resgatados
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Segmentação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {metricas.segmentosAtivos}
            </div>
            <p className="text-sm text-gray-600">Segmentos ativos</p>
            <div className="mt-4">
              <Badge variant="outline">
                IA Automática
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {metricas.taxaEngajamento.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Taxa de engajamento</p>
            <div className="mt-4">
              <Badge variant={metricas.taxaEngajamento > 60 ? "default" : "secondary"}>
                {metricas.taxaEngajamento > 60 ? "Excelente" : "Bom"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Campanhas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.campanhasRecentes.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.campanhasRecentes.map((campanha, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{campanha.nome}</p>
                      <p className="text-sm text-gray-600">{campanha.tipo}</p>
                    </div>
                    <Badge variant={campanha.status === 'executando' ? 'default' : 'secondary'}>
                      {campanha.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhuma campanha recente</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Top Segmentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.segmentosTop.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.segmentosTop.map((segmento, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{segmento.nome}</p>
                      <p className="text-sm text-gray-600">{segmento.totalClientes} clientes</p>
                    </div>
                    <Badge variant="outline">
                      {segmento.tipo}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum segmento encontrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metricas.conversaoCampanhas.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Conversão de Campanhas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(metricas.pontosEmitidos - metricas.pontosResgatados)}
              </div>
              <p className="text-sm text-gray-600">Pontos em Circulação</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {((metricas.pontosResgatados / metricas.pontosEmitidos) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Taxa de Resgate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        Última atualização: {new Date(dashboardData.ultimaAtualizacao).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default DashboardMarketing;
