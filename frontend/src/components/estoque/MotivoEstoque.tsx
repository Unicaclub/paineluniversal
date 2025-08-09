import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Search, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  FileText,
  Plus
} from 'lucide-react';

interface MotivoItem {
  id: number;
  categoria: string;
  motivo: string;
  frequencia: number;
  impacto_financeiro: number;
  tendencia: string;
  sugestao_ia: string;
  cor: string;
}

const MotivoEstoque: React.FC = () => {
  const [motivos, setMotivos] = useState<MotivoItem[]>([]);
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockMotivos: MotivoItem[] = [
      {
        id: 1,
        categoria: 'Venda',
        motivo: 'Venda PDV Automática',
        frequencia: 847,
        impacto_financeiro: 45230.50,
        tendencia: 'crescente',
        sugestao_ia: 'Padrão normal de vendas. Manter estoque atual.',
        cor: 'green'
      },
      {
        id: 2,
        categoria: 'Perda',
        motivo: 'Produto Vencido',
        frequencia: 23,
        impacto_financeiro: 1250.00,
        tendencia: 'estavel',
        sugestao_ia: 'Implementar rotação FIFO mais rigorosa.',
        cor: 'red'
      },
      {
        id: 3,
        categoria: 'Transferência',
        motivo: 'Reposição Filial',
        frequencia: 156,
        impacto_financeiro: 12800.00,
        tendencia: 'crescente',
        sugestao_ia: 'Otimizar distribuição entre filiais.',
        cor: 'blue'
      },
      {
        id: 4,
        categoria: 'Ajuste',
        motivo: 'Correção Inventário',
        frequencia: 45,
        impacto_financeiro: 890.00,
        tendencia: 'decrescente',
        sugestao_ia: 'Melhorar precisão do controle de estoque.',
        cor: 'purple'
      },
      {
        id: 5,
        categoria: 'Quebra',
        motivo: 'Avaria Transporte',
        frequencia: 12,
        impacto_financeiro: 450.00,
        tendencia: 'estavel',
        sugestao_ia: 'Revisar processo de manuseio e transporte.',
        cor: 'orange'
      }
    ];
    
    setMotivos(mockMotivos);
    setLoading(false);
  }, []);

  const motivosFiltrados = motivos.filter(motivo => 
    motivo.motivo.toLowerCase().includes(filtro.toLowerCase()) &&
    (categoriaFiltro === '' || motivo.categoria === categoriaFiltro)
  );

  const getCategoriaColor = (categoria: string) => {
    const cores = {
      'Venda': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Perda': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Transferência': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Ajuste': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Quebra': 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    };
    return cores[categoria as keyof typeof cores] || cores['Ajuste'];
  };

  const getTendenciaColor = (tendencia: string) => {
    const cores = {
      'crescente': 'text-green-400',
      'decrescente': 'text-red-400',
      'estavel': 'text-yellow-400'
    };
    return cores[tendencia as keyof typeof cores] || cores['estavel'];
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return <TrendingUp className="w-4 h-4" />;
      case 'decrescente':
        return <TrendingUp className="w-4 h-4 rotate-180" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Search className="animate-pulse h-8 w-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Analisando motivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 min-h-screen">
      <div className="glass-card p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🔍 Motivo Inteligente
            </h1>
            <p className="text-indigo-200">
              Análise IA de Padrões • Categorização Automática • Sugestões Inteligentes
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-indigo-600/20 hover:bg-indigo-600/30 text-white border border-indigo-500/30">
              <Brain className="w-4 h-4 mr-2" />
              Análise IA
            </Button>
            <Button className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
              <Plus className="w-4 h-4 mr-2" />
              Novo Motivo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar motivos..."
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
            <option value="Venda">Venda</option>
            <option value="Perda">Perda</option>
            <option value="Transferência">Transferência</option>
            <option value="Ajuste">Ajuste</option>
            <option value="Quebra">Quebra</option>
          </select>
          <Button className="bg-orange-600/20 hover:bg-orange-600/30 text-white border border-orange-500/30">
            <FileText className="w-4 h-4 mr-2" />
            Relatório Detalhado
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {motivosFiltrados.map((motivo) => (
          <Card key={motivo.id} className="glass-card border-white/20 card-hover">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{motivo.motivo}</CardTitle>
                  <Badge className={getCategoriaColor(motivo.categoria)}>
                    {motivo.categoria}
                  </Badge>
                </div>
                <div className={`flex items-center gap-1 ${getTendenciaColor(motivo.tendencia)}`}>
                  {getTendenciaIcon(motivo.tendencia)}
                  <span className="text-sm font-semibold capitalize">{motivo.tendencia}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Frequência</p>
                  <p className="text-white font-bold text-xl">{motivo.frequencia}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Impacto Financeiro</p>
                  <p className="text-red-400 font-bold text-lg">R$ {motivo.impacto_financeiro.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Sugestão IA:</p>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-blue-300 text-sm">{motivo.sugestao_ia}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Análise
                </Button>
                <Button size="sm" className="bg-green-600/20 hover:bg-green-600/30 text-white border border-green-500/30">
                  <CheckCircle className="w-3 h-3" />
                </Button>
                <Button size="sm" className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
                  <Brain className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {motivosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum motivo encontrado</h3>
          <p className="text-gray-400">Tente ajustar os filtros de busca</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-indigo-400" />
              Análise Preditiva IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-semibold">Padrão Identificado</span>
                </div>
                <p className="text-sm text-gray-300">
                  Vendas PDV seguem padrão sazonal. Pico às 18h-20h.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 font-semibold">Atenção Requerida</span>
                </div>
                <p className="text-sm text-gray-300">
                  Aumento de 15% em perdas por vencimento. Revisar FIFO.
                </p>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-semibold">Oportunidade</span>
                </div>
                <p className="text-sm text-gray-300">
                  Otimizar transferências pode reduzir custos em 12%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Estatísticas Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="text-2xl font-bold text-green-300">847</div>
                  <div className="text-xs text-gray-400">Vendas Hoje</div>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <div className="text-2xl font-bold text-red-300">35</div>
                  <div className="text-xs text-gray-400">Perdas/Quebras</div>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-300">156</div>
                  <div className="text-xs text-gray-400">Transferências</div>
                </div>
                <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <div className="text-2xl font-bold text-purple-300">45</div>
                  <div className="text-xs text-gray-400">Ajustes</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Precisão IA:</span>
                  <span className="text-indigo-400 font-semibold">96.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Economia Identificada:</span>
                  <span className="text-green-400 font-semibold">R$ 2.8K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Padrões Detectados:</span>
                  <span className="text-purple-400 font-semibold">12</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MotivoEstoque;
