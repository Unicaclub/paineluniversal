import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  ArrowDownCircle, 
  FileText, 
  Truck, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Plus,
  Upload,
  Scan
} from 'lucide-react';

interface EntradaItem {
  id: number;
  numero_nfe: string;
  fornecedor: string;
  data_entrada: string;
  valor_total: number;
  status: string;
  itens_count: number;
  conferido_por: string;
  observacoes: string;
}

const EntradaEstoque: React.FC = () => {
  const [entradas, setEntradas] = useState<EntradaItem[]>([]);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockEntradas: EntradaItem[] = [
      {
        id: 1,
        numero_nfe: '000123456',
        fornecedor: 'Distribuidora Premium Ltda',
        data_entrada: '2025-08-09 14:30',
        valor_total: 15750.00,
        status: 'Conferido',
        itens_count: 25,
        conferido_por: 'João Silva',
        observacoes: 'Entrada completa sem avarias'
      },
      {
        id: 2,
        numero_nfe: '000123457',
        fornecedor: 'Águas do Brasil S.A.',
        data_entrada: '2025-08-09 13:15',
        valor_total: 3200.00,
        status: 'Pendente',
        itens_count: 12,
        conferido_por: '',
        observacoes: 'Aguardando conferência'
      },
      {
        id: 3,
        numero_nfe: '000123458',
        fornecedor: 'Alimentos Frescos Ltda',
        data_entrada: '2025-08-09 12:45',
        valor_total: 8900.00,
        status: 'Divergência',
        itens_count: 18,
        conferido_por: 'Maria Santos',
        observacoes: '3 itens com divergência de quantidade'
      }
    ];
    
    setEntradas(mockEntradas);
    setLoading(false);
  }, []);

  const entradasFiltradas = entradas.filter(entrada => 
    (entrada.numero_nfe.includes(filtro) || entrada.fornecedor.toLowerCase().includes(filtro.toLowerCase())) &&
    (statusFiltro === '' || entrada.status === statusFiltro)
  );

  const getStatusColor = (status: string) => {
    const cores = {
      'Conferido': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Pendente': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Divergência': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Cancelado': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return cores[status as keyof typeof cores] || cores['Pendente'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Conferido':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pendente':
        return <Clock className="w-4 h-4" />;
      case 'Divergência':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const conferirEntrada = (id: number) => {
    setEntradas(prev => 
      prev.map(entrada => 
        entrada.id === id 
          ? { ...entrada, status: 'Conferido', conferido_por: 'Sistema Automático' }
          : entrada
      )
    );
    alert('✅ Entrada conferida automaticamente pela IA!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <ArrowDownCircle className="animate-pulse h-8 w-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando entradas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 min-h-screen">
      <div className="glass-card p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📥 Entrada Automatizada
            </h1>
            <p className="text-emerald-200">
              NFe Automática • Conferência IA • Integração Fornecedores
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-emerald-600/20 hover:bg-emerald-600/30 text-white border border-emerald-500/30">
              <Upload className="w-4 h-4 mr-2" />
              Importar NFe
            </Button>
            <Button className="bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
              <Plus className="w-4 h-4 mr-2" />
              Nova Entrada
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Input
              placeholder="NFe ou Fornecedor..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
          >
            <option value="">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Conferido">Conferido</option>
            <option value="Divergência">Divergência</option>
          </select>
          <Button className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
            <Scan className="w-4 h-4 mr-2" />
            Scanner Mobile
          </Button>
          <Button className="bg-orange-600/20 hover:bg-orange-600/30 text-white border border-orange-500/30">
            <Truck className="w-4 h-4 mr-2" />
            Rastreamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {entradasFiltradas.map((entrada) => (
          <Card key={entrada.id} className="glass-card border-white/20 card-hover">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">NFe {entrada.numero_nfe}</CardTitle>
                  <p className="text-gray-400 text-sm">{entrada.fornecedor}</p>
                </div>
                <Badge className={getStatusColor(entrada.status)}>
                  {getStatusIcon(entrada.status)}
                  <span className="ml-1">{entrada.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Valor Total</p>
                  <p className="text-green-400 font-bold text-lg">R$ {entrada.valor_total.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Itens</p>
                  <p className="text-blue-400 font-bold text-lg">{entrada.itens_count}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Data Entrada:</span>
                  <span className="text-white text-sm">{entrada.data_entrada}</span>
                </div>
                {entrada.conferido_por && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Conferido por:</span>
                    <span className="text-white text-sm">{entrada.conferido_por}</span>
                  </div>
                )}
                <div className="mt-2">
                  <p className="text-gray-400 text-xs">Observações:</p>
                  <p className="text-gray-300 text-sm">{entrada.observacoes}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {entrada.status === 'Pendente' && (
                  <Button 
                    size="sm" 
                    onClick={() => conferirEntrada(entrada.id)}
                    className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-white border border-green-500/30"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conferir IA
                  </Button>
                )}
                <Button size="sm" className="bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
                  <FileText className="w-3 h-3 mr-1" />
                  Detalhes
                </Button>
                <Button size="sm" className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
                  <Scan className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {entradasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <ArrowDownCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhuma entrada encontrada</h3>
          <p className="text-gray-400">Tente ajustar os filtros ou importar uma nova NFe</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-emerald-400" />
              NFe Automática
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Processadas Hoje:</span>
                <span className="text-emerald-400 font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valor Total:</span>
                <span className="text-emerald-400 font-semibold">R$ 47.8K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Precisão IA:</span>
                <span className="text-emerald-400 font-semibold">98.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Truck className="h-5 w-5 text-blue-400" />
              Fornecedores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Distribuidora Premium:</span>
                <span className="text-green-400 font-semibold">Ativo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Águas do Brasil:</span>
                <span className="text-green-400 font-semibold">Ativo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Alimentos Frescos:</span>
                <span className="text-yellow-400 font-semibold">Pendente</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5 text-purple-400" />
              Conferência IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Automáticas:</span>
                <span className="text-purple-400 font-semibold">89%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Divergências:</span>
                <span className="text-red-400 font-semibold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Economia Tempo:</span>
                <span className="text-purple-400 font-semibold">67%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EntradaEstoque;
