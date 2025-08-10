import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Brain, 
  Target, 
  TrendingUp,
  Plus,
  Settings,
  Zap,
  BarChart3,
  Crown,
  Star
} from 'lucide-react';

interface Segmento {
  id: number;
  nome: string;
  descricao: string;
  tipo: string;
  total_clientes: number;
  automatico: boolean;
  cor: string;
  criterios: any;
  ultima_atualizacao: string;
}

const SegmentacaoClientes: React.FC = () => {
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [loading, setLoading] = useState(true);
  const [executandoIA, setExecutandoIA] = useState(false);
  const [empresaId] = useState(1);

  const carregarSegmentos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/marketing-crm/segmentos?empresa_id=${empresaId}`);
      const data = await response.json();
      
      if (data.success) {
        setSegmentos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const executarSegmentacaoIA = async (algoritmo: string = 'rfm') => {
    try {
      setExecutandoIA(true);
      const response = await fetch('/api/marketing-crm/segmentacao-automatica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresa_id: empresaId,
          algoritmo
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await carregarSegmentos();
      }
    } catch (error) {
      console.error('Erro na segmentação IA:', error);
    } finally {
      setExecutandoIA(false);
    }
  };

  useEffect(() => {
    carregarSegmentos();
  }, []);

  const getTipoIcon = (tipo: string, automatico: boolean) => {
    if (automatico) return <Brain className="w-4 h-4" />;
    
    switch (tipo) {
      case 'vip': return <Crown className="w-4 h-4" />;
      case 'frequente': return <Star className="w-4 h-4" />;
      case 'alto_valor': return <TrendingUp className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getTipoBadge = (segmento: Segmento) => {
    if (segmento.automatico) {
      return <Badge className="bg-purple-500 text-white">IA Automático</Badge>;
    }
    
    return <Badge variant="outline">{segmento.tipo}</Badge>;
  };

  const formatarDataAtualizacao = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Segmentação de Clientes</h2>
          <p className="text-gray-600">Segmente seus clientes com inteligência artificial</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => executarSegmentacaoIA('rfm')}
            disabled={executandoIA}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            {executandoIA ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Segmentação IA
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Segmento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segmentos.map((segmento) => (
          <Card key={segmento.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${segmento.cor}20`, color: segmento.cor }}
                  >
                    {getTipoIcon(segmento.tipo, segmento.automatico)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{segmento.nome}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{segmento.descricao}</p>
                  </div>
                </div>
                {getTipoBadge(segmento)}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {segmento.total_clientes.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Clientes no segmento</div>
                </div>

                {segmento.criterios && Object.keys(segmento.criterios).length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Critérios:</h4>
                    <div className="space-y-1">
                      {Object.entries(segmento.criterios).map(([key, value]) => (
                        <div key={key} className="text-xs text-gray-600">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 text-center">
                  Última atualização: {formatarDataAtualizacao(segmento.ultima_atualizacao)}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                  
                  <Button variant="outline" size="sm" className="flex-1">
                    <Target className="w-4 h-4 mr-1" />
                    Campanha
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segmentos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum segmento encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Crie segmentos personalizados ou use nossa IA para segmentação automática.
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline"
                onClick={() => executarSegmentacaoIA('rfm')}
                disabled={executandoIA}
              >
                <Brain className="w-4 h-4 mr-2" />
                Segmentação IA
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Segmento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Segmentação Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900">RFM Analysis</h4>
              <p className="text-sm text-blue-700">Recência, Frequência e Valor Monetário</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900">Comportamental</h4>
              <p className="text-sm text-green-700">Baseado em padrões de comportamento</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900">Preditivo</h4>
              <p className="text-sm text-purple-700">Previsão de comportamento futuro</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SegmentacaoClientes;
