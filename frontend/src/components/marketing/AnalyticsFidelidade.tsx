import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Star,
  Gift,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsFidelidade {
  totalClientes: number;
  clientesAtivos: number;
  pontosEmitidos: number;
  pontosResgatados: number;
  taxaEngajamento: number;
  ticketMedio: number;
  roiPrograma: number;
  distribuicaoNiveis: any[];
  transacoesPorMes: any[];
  topResgates: any[];
}

const AnalyticsFidelidade: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsFidelidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30d');
  const [programaId] = useState(1);

  const carregarAnalytics = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/marketing-crm/roi-programa/${programaId}?periodo_meses=${periodo === '30d' ? 1 : periodo === '90d' ? 3 : 12}`);
      const data = await response.json();
      
      if (data.success) {
        const mockAnalytics: AnalyticsFidelidade = {
          totalClientes: 15420,
          clientesAtivos: 12350,
          pontosEmitidos: 2450000,
          pontosResgatados: 890000,
          taxaEngajamento: 78.5,
          ticketMedio: 125.50,
          roiPrograma: data.data.roi_percentual || 245.8,
          distribuicaoNiveis: [
            { nivel: 'Bronze Iniciante', clientes: 8500, percentual: 55.1 },
            { nivel: 'Prata Fidelidade', clientes: 4200, percentual: 27.2 },
            { nivel: 'Ouro Premium', clientes: 2100, percentual: 13.6 },
            { nivel: 'Diamante Elite', clientes: 620, percentual: 4.1 }
          ],
          transacoesPorMes: [
            { mes: 'Jan', ganhos: 180000, resgates: 65000 },
            { mes: 'Fev', ganhos: 195000, resgates: 72000 },
            { mes: 'Mar', ganhos: 210000, resgates: 78000 },
            { mes: 'Abr', ganhos: 225000, resgates: 85000 },
            { mes: 'Mai', ganhos: 240000, resgates: 92000 },
            { mes: 'Jun', ganhos: 255000, resgates: 98000 }
          ],
          topResgates: [
            { item: 'Desconto 10%', resgates: 2450, pontos: 245000 },
            { item: 'Bebida Grátis', resgates: 1890, pontos: 189000 },
            { item: 'Mesa VIP', resgates: 890, pontos: 178000 },
            { item: 'Cashback R$20', resgates: 650, pontos: 130000 },
            { item: 'Entrada Grátis', resgates: 420, pontos: 84000 }
          ]
        };
        
        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAnalytics();
  }, [periodo]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calcularTaxaResgate = () => {
    if (!analytics) return 0;
    return ((analytics.pontosResgatados / analytics.pontosEmitidos) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Erro ao carregar analytics</p>
        <Button onClick={carregarAnalytics} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics de Fidelidade</h2>
          <p className="text-gray-600">Análise completa do programa de fidelidade</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="12m">Últimos 12 meses</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(analytics.totalClientes)}
            </div>
            <p className="text-xs text-gray-600">
              {formatNumber(analytics.clientesAtivos)} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Emitidos</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatNumber(analytics.pontosEmitidos)}
            </div>
            <p className="text-xs text-gray-600">
              {calcularTaxaResgate()}% resgatados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Engajamento</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.taxaEngajamento}%
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5.2% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI do Programa</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.roiPrograma.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-purple-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              Excelente performance
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Distribuição por Níveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.distribuicaoNiveis.map((nivel, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-amber-600' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-blue-400'
                    }`}></div>
                    <span className="text-sm font-medium">{nivel.nivel}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {formatNumber(nivel.clientes)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {nivel.percentual}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Top Resgates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topResgates.map((resgate, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{resgate.item}</div>
                    <div className="text-sm text-gray-600">
                      {formatNumber(resgate.resgates)} resgates
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">
                      {formatNumber(resgate.pontos)}
                    </div>
                    <div className="text-xs text-gray-600">pontos</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Evolução de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Pontos Ganhos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Pontos Resgatados</span>
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-4">
              {analytics.transacoesPorMes.map((transacao, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-600 mb-2">{transacao.mes}</div>
                  <div className="space-y-1">
                    <div className="bg-green-500 rounded" style={{
                      height: `${(transacao.ganhos / 255000) * 60}px`,
                      minHeight: '4px'
                    }}></div>
                    <div className="bg-red-500 rounded" style={{
                      height: `${(transacao.resgates / 255000) * 60}px`,
                      minHeight: '4px'
                    }}></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    <div className="text-green-600">
                      {formatNumber(transacao.ganhos)}
                    </div>
                    <div className="text-red-600">
                      {formatNumber(transacao.resgates)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(analytics.ticketMedio)}
            </div>
            <div className="flex items-center text-sm text-green-600 mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12.5% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Retenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              85.2%
            </div>
            <div className="flex items-center text-sm text-green-600 mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              +3.1% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(890.50)}
            </div>
            <div className="flex items-center text-sm text-purple-600 mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8.7% vs período anterior
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsFidelidade;
