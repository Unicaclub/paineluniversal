import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  ArrowUpCircle, 
  ShoppingCart, 
  Truck, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Package,
  RotateCcw
} from 'lucide-react';

interface SaidaItem {
  id: number;
  tipo_saida: string;
  numero_documento: string;
  destino: string;
  data_saida: string;
  valor_total: number;
  status: string;
  itens_count: number;
  responsavel: string;
  motivo: string;
}

const SaidaEstoque: React.FC = () => {
  const [saidas, setSaidas] = useState<SaidaItem[]>([]);
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockSaidas: SaidaItem[] = [
      {
        id: 1,
        tipo_saida: 'Venda PDV',
        numero_documento: 'PDV-001234',
        destino: 'Cliente Final',
        data_saida: '2025-08-09 14:30',
        valor_total: 125.50,
        status: 'Concluída',
        itens_count: 5,
        responsavel: 'Sistema Automático',
        motivo: 'Venda no PDV'
      },
      {
        id: 2,
        tipo_saida: 'Transferência',
        numero_documento: 'TRF-000456',
        destino: 'Filial Centro',
        data_saida: '2025-08-09 13:15',
        valor_total: 2800.00,
        status: 'Em Trânsito',
        itens_count: 15,
        responsavel: 'João Silva',
        motivo: 'Reposição filial'
      },
      {
        id: 3,
        tipo_saida: 'Perda/Quebra',
        numero_documento: 'PQ-000789',
        destino: 'Descarte',
        data_saida: '2025-08-09 12:45',
        valor_total: 45.00,
        status: 'Registrada',
        itens_count: 3,
        responsavel: 'Maria Santos',
        motivo: 'Produto vencido'
      },
      {
        id: 4,
        tipo_saida: 'Consumo Interno',
        numero_documento: 'CI-000321',
        destino: 'Uso Interno',
        data_saida: '2025-08-09 11:30',
        valor_total: 78.90,
        status: 'Aprovada',
        itens_count: 4,
        responsavel: 'Pedro Costa',
        motivo: 'Degustação evento'
      }
    ];
    
    setSaidas(mockSaidas);
    setLoading(false);
  }, []);

  const saidasFiltradas = saidas.filter(saida => 
    (saida.numero_documento.includes(filtro) || saida.destino.toLowerCase().includes(filtro.toLowerCase())) &&
    (tipoFiltro === '' || saida.tipo_saida === tipoFiltro)
  );

  const getStatusColor = (status: string) => {
    const cores = {
      'Concluída': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Em Trânsito': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Registrada': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Aprovada': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Cancelada': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return cores[status as keyof typeof cores] || cores['Registrada'];
  };

  const getTipoColor = (tipo: string) => {
    const cores = {
      'Venda PDV': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Transferência': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Perda/Quebra': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Consumo Interno': 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    };
    return cores[tipo as keyof typeof cores] || cores['Venda PDV'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluída':
        return <CheckCircle className="w-4 h-4" />;
      case 'Em Trânsito':
        return <Truck className="w-4 h-4" />;
      case 'Registrada':
        return <Clock className="w-4 h-4" />;
      case 'Aprovada':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Venda PDV':
        return <ShoppingCart className="w-4 h-4" />;
      case 'Transferência':
        return <Truck className="w-4 h-4" />;
      case 'Perda/Quebra':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Consumo Interno':
        return <Package className="w-4 h-4" />;
      default:
        return <ArrowUpCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <ArrowUpCircle className="animate-pulse h-8 w-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando saídas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 min-h-screen">
      <div className="glass-card p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📤 Saída Inteligente
            </h1>
            <p className="text-red-200">
              Automação por Vendas • Transferências Otimizadas • Controle FIFO/LIFO
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-red-600/20 hover:bg-red-600/30 text-white border border-red-500/30">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Nova Saída
            </Button>
            <Button className="bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
              <Truck className="w-4 h-4 mr-2" />
              Transferência
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Input
              placeholder="Documento ou Destino..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
          >
            <option value="">Todos os tipos</option>
            <option value="Venda PDV">Venda PDV</option>
            <option value="Transferência">Transferência</option>
            <option value="Perda/Quebra">Perda/Quebra</option>
            <option value="Consumo Interno">Consumo Interno</option>
          </select>
          <Button className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
            <RotateCcw className="w-4 h-4 mr-2" />
            Otimizar FIFO
          </Button>
          <Button className="bg-orange-600/20 hover:bg-orange-600/30 text-white border border-orange-500/30">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Perdas/Quebras
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {saidasFiltradas.map((saida) => (
          <Card key={saida.id} className="glass-card border-white/20 card-hover">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{saida.numero_documento}</CardTitle>
                  <p className="text-gray-400 text-sm">{saida.destino}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getTipoColor(saida.tipo_saida)}>
                    {getTipoIcon(saida.tipo_saida)}
                    <span className="ml-1">{saida.tipo_saida}</span>
                  </Badge>
                  <Badge className={getStatusColor(saida.status)}>
                    {getStatusIcon(saida.status)}
                    <span className="ml-1">{saida.status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Valor Total</p>
                  <p className="text-red-400 font-bold text-lg">R$ {saida.valor_total.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Itens</p>
                  <p className="text-blue-400 font-bold text-lg">{saida.itens_count}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Data Saída:</span>
                  <span className="text-white text-sm">{saida.data_saida}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Responsável:</span>
                  <span className="text-white text-sm">{saida.responsavel}</span>
                </div>
                <div className="mt-2">
                  <p className="text-gray-400 text-xs">Motivo:</p>
                  <p className="text-gray-300 text-sm">{saida.motivo}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
                  <Package className="w-3 h-3 mr-1" />
                  Detalhes
                </Button>
                {saida.status === 'Em Trânsito' && (
                  <Button size="sm" className="bg-green-600/20 hover:bg-green-600/30 text-white border border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Confirmar
                  </Button>
                )}
                <Button size="sm" className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
                  <Truck className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {saidasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <ArrowUpCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhuma saída encontrada</h3>
          <p className="text-gray-400">Tente ajustar os filtros ou registrar uma nova saída</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShoppingCart className="h-5 w-5 text-green-400" />
              Vendas PDV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Hoje:</span>
                <span className="text-green-400 font-semibold">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valor:</span>
                <span className="text-green-400 font-semibold">R$ 2.8K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Automáticas:</span>
                <span className="text-green-400 font-semibold">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Truck className="h-5 w-5 text-blue-400" />
              Transferências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Em Trânsito:</span>
                <span className="text-blue-400 font-semibold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Concluídas:</span>
                <span className="text-green-400 font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Otimização:</span>
                <span className="text-blue-400 font-semibold">IA Ativa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Perdas/Quebras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Hoje:</span>
                <span className="text-red-400 font-semibold">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valor:</span>
                <span className="text-red-400 font-semibold">R$ 45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">% Vendas:</span>
                <span className="text-red-400 font-semibold">1.6%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <RotateCcw className="h-5 w-5 text-purple-400" />
              Otimização FIFO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Ativo:</span>
                <span className="text-purple-400 font-semibold">Sim</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Economia:</span>
                <span className="text-purple-400 font-semibold">18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vencimentos:</span>
                <span className="text-purple-400 font-semibold">-67%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SaidaEstoque;
