import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3,
  Camera,
  QrCode
} from 'lucide-react';

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  preco: number;
  localizacao: string;
  abc_classificacao: string;
  giro_estoque: number;
}

const InventarioModule: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockProdutos: Produto[] = [
      {
        id: 1,
        nome: 'Cerveja Heineken 350ml',
        categoria: 'Bebidas',
        estoque_atual: 45,
        estoque_minimo: 20,
        estoque_maximo: 200,
        preco: 15.00,
        localizacao: 'A1-P2',
        abc_classificacao: 'A',
        giro_estoque: 8.5
      },
      {
        id: 2,
        nome: 'Hambúrguer Artesanal',
        categoria: 'Comidas',
        estoque_atual: 23,
        estoque_minimo: 10,
        estoque_maximo: 50,
        preco: 25.00,
        localizacao: 'B2-P1',
        abc_classificacao: 'B',
        giro_estoque: 6.2
      }
    ];
    
    setProdutos(mockProdutos);
    setLoading(false);
  }, []);

  const produtosFiltrados = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(filtro.toLowerCase()) &&
    (categoriaFiltro === '' || produto.categoria === categoriaFiltro)
  );

  const getStatusEstoque = (produto: Produto) => {
    if (produto.estoque_atual <= produto.estoque_minimo) {
      return { status: 'Crítico', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
    } else if (produto.estoque_atual <= produto.estoque_minimo * 1.5) {
      return { status: 'Baixo', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    } else {
      return { status: 'Normal', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
    }
  };

  const getClasseABC = (classe: string) => {
    const cores = {
      'A': 'bg-green-500/20 text-green-300 border-green-500/30',
      'B': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'C': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return cores[classe as keyof typeof cores] || cores['C'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="animate-pulse h-8 w-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando inventário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen">
      <div className="glass-card p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📋 Inventário Inteligente
            </h1>
            <p className="text-blue-200">
              Gestão completa de produtos com localização e classificação ABC
            </p>
          </div>
          <Button className="bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
          >
            <option value="">Todas as categorias</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Comidas">Comidas</option>
            <option value="Sobremesas">Sobremesas</option>
          </select>
          <Button className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avançados
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {produtosFiltrados.map((produto) => {
          const statusEstoque = getStatusEstoque(produto);
          return (
            <Card key={produto.id} className="glass-card border-white/20 card-hover">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">{produto.nome}</CardTitle>
                    <p className="text-gray-400 text-sm">{produto.categoria}</p>
                  </div>
                  <Badge className={getClasseABC(produto.abc_classificacao)}>
                    Classe {produto.abc_classificacao}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs">Estoque Atual</p>
                    <p className="text-white font-bold text-xl">{produto.estoque_atual}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Giro</p>
                    <p className="text-blue-400 font-bold text-xl">{produto.giro_estoque}x</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Status:</span>
                    <Badge className={statusEstoque.color}>
                      {statusEstoque.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Localização:</span>
                    <span className="text-white text-sm">{produto.localizacao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Preço:</span>
                    <span className="text-green-400 font-semibold">R$ {produto.preco.toFixed(2)}</span>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((produto.estoque_atual / produto.estoque_maximo) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Min: {produto.estoque_minimo}</span>
                  <span>Max: {produto.estoque_maximo}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
                    <QrCode className="w-3 h-3" />
                  </Button>
                  <Button size="sm" className="bg-green-600/20 hover:bg-green-600/30 text-white border border-green-500/30">
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {produtosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-400">Tente ajustar os filtros ou adicionar novos produtos</p>
        </div>
      )}
    </div>
  );
};

export default InventarioModule;
