import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  MapPin, 
  Search, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  Navigation
} from 'lucide-react';

interface PosicaoItem {
  id: number;
  produto_nome: string;
  localizacao: string;
  setor: string;
  prateleira: string;
  quantidade: number;
  status: string;
  ultima_movimentacao: string;
  responsavel: string;
}

const PosicaoEstoque: React.FC = () => {
  const [posicoes, setPosicoes] = useState<PosicaoItem[]>([]);
  const [filtro, setFiltro] = useState('');
  const [setorFiltro, setSetorFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockPosicoes: PosicaoItem[] = [
      {
        id: 1,
        produto_nome: 'Cerveja Heineken 350ml',
        localizacao: 'A1-P2-N3',
        setor: 'Bebidas Refrigeradas',
        prateleira: 'A1-P2',
        quantidade: 45,
        status: 'Disponível',
        ultima_movimentacao: '2025-08-09 14:30',
        responsavel: 'João Silva'
      },
      {
        id: 2,
        produto_nome: 'Hambúrguer Artesanal',
        localizacao: 'B2-P1-N1',
        setor: 'Congelados',
        prateleira: 'B2-P1',
        quantidade: 23,
        status: 'Baixo Estoque',
        ultima_movimentacao: '2025-08-09 13:15',
        responsavel: 'Maria Santos'
      },
      {
        id: 3,
        produto_nome: 'Água Mineral 500ml',
        localizacao: 'C3-P4-N2',
        setor: 'Bebidas Ambiente',
        prateleira: 'C3-P4',
        quantidade: 8,
        status: 'Crítico',
        ultima_movimentacao: '2025-08-09 12:45',
        responsavel: 'Pedro Costa'
      }
    ];
    
    setPosicoes(mockPosicoes);
    setLoading(false);
  }, []);

  const posicoesFiltradas = posicoes.filter(posicao => 
    posicao.produto_nome.toLowerCase().includes(filtro.toLowerCase()) &&
    (setorFiltro === '' || posicao.setor === setorFiltro)
  );

  const getStatusColor = (status: string) => {
    const cores = {
      'Disponível': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Baixo Estoque': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Crítico': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Indisponível': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return cores[status as keyof typeof cores] || cores['Indisponível'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Disponível':
        return <CheckCircle className="w-4 h-4" />;
      case 'Baixo Estoque':
        return <Clock className="w-4 h-4" />;
      case 'Crítico':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MapPin className="animate-pulse h-8 w-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando posições...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 min-h-screen">
      <div className="glass-card p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📍 Posição de Estoque
            </h1>
            <p className="text-green-200">
              Localização em tempo real • Mapeamento 3D • Otimização de Layout
            </p>
          </div>
          <Button className="bg-green-600/20 hover:bg-green-600/30 text-white border border-green-500/30">
            <Navigation className="w-4 h-4 mr-2" />
            Mapa 3D
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por produto..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <select
            value={setorFiltro}
            onChange={(e) => setSetorFiltro(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
          >
            <option value="">Todos os setores</option>
            <option value="Bebidas Refrigeradas">Bebidas Refrigeradas</option>
            <option value="Congelados">Congelados</option>
            <option value="Bebidas Ambiente">Bebidas Ambiente</option>
          </select>
          <Button className="bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
            <Eye className="w-4 h-4 mr-2" />
            Visualizar Mapa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {posicoesFiltradas.map((posicao) => (
          <Card key={posicao.id} className="glass-card border-white/20 card-hover">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{posicao.produto_nome}</CardTitle>
                  <p className="text-gray-400 text-sm">{posicao.setor}</p>
                </div>
                <Badge className={getStatusColor(posicao.status)}>
                  {getStatusIcon(posicao.status)}
                  <span className="ml-1">{posicao.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Localização</p>
                  <p className="text-white font-bold text-lg">{posicao.localizacao}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Quantidade</p>
                  <p className="text-blue-400 font-bold text-lg">{posicao.quantidade}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Prateleira:</span>
                  <span className="text-white text-sm">{posicao.prateleira}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Responsável:</span>
                  <span className="text-white text-sm">{posicao.responsavel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Última Mov.:</span>
                  <span className="text-gray-300 text-sm">{posicao.ultima_movimentacao}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
                  <MapPin className="w-3 h-3 mr-1" />
                  Localizar
                </Button>
                <Button size="sm" className="bg-green-600/20 hover:bg-green-600/30 text-white border border-green-500/30">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm" className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
                  <BarChart3 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posicoesFiltradas.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhuma posição encontrada</h3>
          <p className="text-gray-400">Tente ajustar os filtros de busca</p>
        </div>
      )}

      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Navigation className="h-5 w-5 text-green-400" />
            Mapa de Calor - Movimentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-2xl font-bold text-green-300 mb-2">Setor A</div>
              <div className="text-sm text-gray-400">Alta Movimentação</div>
              <div className="text-xs text-green-400 mt-1">85% Ocupação</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-300 mb-2">Setor B</div>
              <div className="text-sm text-gray-400">Média Movimentação</div>
              <div className="text-xs text-yellow-400 mt-1">62% Ocupação</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="text-2xl font-bold text-red-300 mb-2">Setor C</div>
              <div className="text-sm text-gray-400">Baixa Movimentação</div>
              <div className="text-xs text-red-400 mt-1">34% Ocupação</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PosicaoEstoque;
