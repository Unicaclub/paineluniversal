import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus,
  Target,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  BarChart3
} from 'lucide-react';

interface Campanha {
  id: number;
  nome: string;
  descricao: string;
  tipo: string;
  status: string;
  objetivo: string;
  segmento_id: number;
  data_inicio: string;
  data_fim: string;
  total_envios: number;
  total_aberturas: number;
  total_cliques: number;
  total_conversoes: number;
  receita_gerada: number;
}

const CampanhaManager: React.FC = () => {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [empresaId] = useState(1);

  const carregarCampanhas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/marketing-crm/campanhas?empresa_id=${empresaId}`);
      const data = await response.json();
      
      if (data.success) {
        setCampanhas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const executarCampanha = async (campanhaId: number) => {
    try {
      const response = await fetch(`/api/marketing-crm/campanhas/${campanhaId}/executar`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await carregarCampanhas();
      }
    } catch (error) {
      console.error('Erro ao executar campanha:', error);
    }
  };

  useEffect(() => {
    carregarCampanhas();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executando': return 'bg-green-500';
      case 'agendada': return 'bg-blue-500';
      case 'pausada': return 'bg-yellow-500';
      case 'finalizada': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'push': return <Smartphone className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const calcularTaxaAbertura = (campanha: Campanha) => {
    return campanha.total_envios > 0 
      ? ((campanha.total_aberturas / campanha.total_envios) * 100).toFixed(1)
      : '0.0';
  };

  const calcularTaxaConversao = (campanha: Campanha) => {
    return campanha.total_envios > 0 
      ? ((campanha.total_conversoes / campanha.total_envios) * 100).toFixed(1)
      : '0.0';
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
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Campanhas</h2>
          <p className="text-gray-600">Crie e gerencie campanhas de marketing inteligentes</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid gap-6">
        {campanhas.map((campanha) => (
          <Card key={campanha.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    {getTipoIcon(campanha.tipo)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{campanha.nome}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{campanha.descricao}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(campanha.status)} text-white`}>
                    {campanha.status}
                  </Badge>
                  <Badge variant="outline">
                    {campanha.tipo.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {campanha.total_envios.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Envios</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {calcularTaxaAbertura(campanha)}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa Abertura</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {calcularTaxaConversao(campanha)}%
                  </div>
                  <div className="text-sm text-gray-600">Conversão</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    R$ {campanha.receita_gerada.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Receita</div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Objetivo: {campanha.objetivo}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  
                  {campanha.status === 'agendada' && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => executarCampanha(campanha.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Executar
                    </Button>
                  )}
                  
                  {campanha.status === 'executando' && (
                    <Button size="sm" variant="outline">
                      <Pause className="w-4 h-4 mr-1" />
                      Pausar
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campanhas.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma campanha encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              Crie sua primeira campanha de marketing para começar a engajar seus clientes.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampanhaManager;
