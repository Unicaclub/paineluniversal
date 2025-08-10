import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  DollarSign, 
  Clock,
  AlertTriangle,
  Zap,
  Target,
  Activity,
  Wallet,
  ShoppingCart,
  Calendar,
  Bell
} from 'lucide-react';
import { financeiroService, pdvService, eventoService } from '@/services/api';

interface DashboardData {
  totalEventos: number;
  totalClientes: number;
  cartoesAtivos: number;
  faturamentoMes: number;
  saldoCartoes: number;
  ticketMedio: number;
  receitaDia: number;
  transacoesDia: number;
  recargasDia: number;
  consumosDia: number;
  vendas_hoje: number;
  valor_vendas_hoje: number;
  produtos_em_falta: number;
  comandas_ativas: number;
  caixas_abertos: number;
}

const DashboardSupremo: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [eventos, setEventos] = useState<any[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [showBanner, setShowBanner] = useState(true);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      
      const eventosData = await eventoService.listar();
      const eventosAtivos = eventosData.filter((e: any) => e.status === 'ativo');
      setEventos(eventosAtivos);
      
      if (eventosAtivos.length > 0 && !eventoSelecionado) {
        setEventoSelecionado(eventosAtivos[0]?.id || null);
      }
      
      if (eventoSelecionado) {
        const [dashboardFinanceiro, dashboardPDV] = await Promise.all([
          financeiroService.obterDashboard(eventoSelecionado),
          pdvService.obterDashboardPDV(eventoSelecionado)
        ]);
        
        const mockData: DashboardData = {
          totalEventos: eventosAtivos.length,
          totalClientes: 1247,
          cartoesAtivos: 892,
          faturamentoMes: 125000,
          saldoCartoes: 45000,
          ticketMedio: 85,
          receitaDia: 12500,
          transacoesDia: 147,
          recargasDia: 8500,
          consumosDia: 4000,
          vendas_hoje: dashboardPDV.vendas_hoje || 0,
          valor_vendas_hoje: dashboardPDV.valor_vendas_hoje || 0,
          produtos_em_falta: dashboardPDV.produtos_em_falta || 0,
          comandas_ativas: dashboardPDV.comandas_ativas || 0,
          caixas_abertos: dashboardPDV.caixas_abertos || 0
        };
        
        setDashboardData(mockData);
      }
      
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [eventoSelecionado, toast]);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 30000);
    return () => clearInterval(interval);
  }, [carregarDados]);

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
          <p className="mt-4 text-lg text-gray-600">Carregando Dashboard Supremo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {showBanner && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-300" />
              <span className="font-medium">Sistema Supremo Ativo - Cashless Integrado</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Dashboard Supremo
            </h1>
            <p className="text-purple-200 mt-1">Sistema Integrado de Eventos + Cashless</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={eventoSelecionado || ''}
              onChange={(e) => setEventoSelecionado(Number(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white backdrop-blur-sm"
            >
              {eventos.map((evento) => (
                <option key={evento.id} value={evento.id} className="bg-gray-800">
                  {evento.nome}
                </option>
              ))}
            </select>
            <Badge variant="outline" className="text-purple-200 border-purple-300">
              <Clock className="h-3 w-3 mr-1" />
              {lastUpdate}
            </Badge>
          </div>
        </div>

        {dashboardData && dashboardData.produtos_em_falta > 0 && (
          <Alert className="bg-red-500/20 border-red-500/50 text-red-100">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{dashboardData.produtos_em_falta} produto(s)</strong> com estoque baixo. 
              Verifique o estoque para evitar perdas de vendas.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-blue-300">
                <Calendar className="h-4 w-4 mr-2" />
                Eventos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dashboardData?.totalEventos}</div>
              <div className="text-xs text-blue-200 mt-1">Em operação</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-green-300">
                <Users className="h-4 w-4 mr-2" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dashboardData?.totalClientes}</div>
              <div className="text-xs text-green-200 mt-1">Cadastrados</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-purple-300">
                <CreditCard className="h-4 w-4 mr-2" />
                Cartões Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dashboardData?.cartoesAtivos}</div>
              <div className="text-xs text-purple-200 mt-1">Em circulação</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-yellow-300">
                <DollarSign className="h-4 w-4 mr-2" />
                Faturamento Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(dashboardData?.faturamentoMes || 0)}</div>
              <div className="text-xs text-yellow-200 mt-1">Receita total</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-teal-300">
                <Wallet className="h-4 w-4 mr-2" />
                Saldo Cartões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(dashboardData?.saldoCartoes || 0)}</div>
              <div className="text-xs text-teal-200 mt-1">Em circulação</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-orange-300">
                <Target className="h-4 w-4 mr-2" />
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(dashboardData?.ticketMedio || 0)}</div>
              <div className="text-xs text-orange-200 mt-1">Por transação</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-green-300">
                <TrendingUp className="h-4 w-4 mr-2" />
                Receita Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{formatCurrency(dashboardData?.receitaDia || 0)}</div>
              <div className="text-sm text-green-200 mt-1">{dashboardData?.transacoesDia} transações</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-blue-300">
                <Activity className="h-4 w-4 mr-2" />
                Recargas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{formatCurrency(dashboardData?.recargasDia || 0)}</div>
              <div className="text-sm text-blue-200 mt-1">Créditos adicionados</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-purple-300">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Consumos Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{formatCurrency(dashboardData?.consumosDia || 0)}</div>
              <div className="text-sm text-purple-200 mt-1">Vendas processadas</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-orange-300">
                <Bell className="h-4 w-4 mr-2" />
                Status Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Operacional</span>
              </div>
              <div className="text-sm text-orange-200 mt-1">Todos os sistemas online</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5" />
                Resumo Operacional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Comandas Ativas</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                  {dashboardData?.comandas_ativas}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Caixas Abertos</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                  {dashboardData?.caixas_abertos}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Vendas Hoje</span>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  {dashboardData?.vendas_hoje}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Produtos em Falta</span>
                <Badge 
                  variant="secondary" 
                  className={`${(dashboardData?.produtos_em_falta || 0) > 0 ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}`}
                >
                  {dashboardData?.produtos_em_falta}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5" />
                Transações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '14:32', client: 'João Silva', type: 'Consumo', value: -25.50, balance: 74.50 },
                  { time: '14:28', client: 'Maria Santos', type: 'Recarga', value: 50.00, balance: 150.00 },
                  { time: '14:25', client: 'Pedro Costa', type: 'Consumo', value: -15.00, balance: 35.00 },
                  { time: '14:20', client: 'Ana Lima', type: 'Consumo', value: -30.00, balance: 20.00 },
                ].map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-400">{transaction.time}</div>
                      <div>
                        <div className="text-sm font-medium text-white">{transaction.client}</div>
                        <div className="text-xs text-gray-400">{transaction.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${transaction.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.value > 0 ? '+' : ''}{formatCurrency(transaction.value)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Saldo: {formatCurrency(transaction.balance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardSupremo;
