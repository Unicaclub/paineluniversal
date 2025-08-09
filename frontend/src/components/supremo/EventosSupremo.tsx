import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  Download,
  Upload,
  Zap
} from 'lucide-react';

interface Evento {
  id: number;
  nome: string;
  data: string;
  local: string;
  capacidade: number;
  participantes: number;
  faturamento: number;
  status: 'ativo' | 'finalizado' | 'cancelado' | 'planejamento';
  tipo: 'festa' | 'show' | 'corporativo' | 'casamento' | 'formatura';
  cashlessAtivo: boolean;
  cartoesEmitidos: number;
  saldoTotal: number;
  transacoes: number;
}

interface NovoEvento {
  nome: string;
  data: string;
  local: string;
  capacidade: number;
  tipo: string;
  cashlessAtivo: boolean;
  valorMinimo: number;
}

const EventosSupremo: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showNovoEvento, setShowNovoEvento] = useState(false);
  const [novoEvento, setNovoEvento] = useState<NovoEvento>({
    nome: '',
    data: '',
    local: '',
    capacidade: 0,
    tipo: 'festa',
    cashlessAtivo: true,
    valorMinimo: 10.00
  });

  const eventosSimulados: Evento[] = [
    {
      id: 1,
      nome: 'Festa de Ano Novo 2025',
      data: '2024-12-31T22:00:00',
      local: 'Clube Supremo',
      capacidade: 1000,
      participantes: 850,
      faturamento: 125000.00,
      status: 'ativo',
      tipo: 'festa',
      cashlessAtivo: true,
      cartoesEmitidos: 850,
      saldoTotal: 45000.00,
      transacoes: 2340
    },
    {
      id: 2,
      nome: 'Show Rock Nacional',
      data: '2025-01-15T20:00:00',
      local: 'Arena Central',
      capacidade: 2000,
      participantes: 1200,
      faturamento: 89000.00,
      status: 'ativo',
      tipo: 'show',
      cashlessAtivo: true,
      cartoesEmitidos: 1200,
      saldoTotal: 32000.00,
      transacoes: 1890
    },
    {
      id: 3,
      nome: 'Casamento Silva & Santos',
      data: '2025-01-20T18:00:00',
      local: 'Espaço Elegance',
      capacidade: 300,
      participantes: 280,
      faturamento: 45000.00,
      status: 'planejamento',
      tipo: 'casamento',
      cashlessAtivo: true,
      cartoesEmitidos: 0,
      saldoTotal: 0,
      transacoes: 0
    },
    {
      id: 4,
      nome: 'Evento Corporativo TechCorp',
      data: '2024-12-20T19:00:00',
      local: 'Hotel Business',
      capacidade: 500,
      participantes: 450,
      faturamento: 67000.00,
      status: 'finalizado',
      tipo: 'corporativo',
      cashlessAtivo: true,
      cartoesEmitidos: 450,
      saldoTotal: 1200.00,
      transacoes: 890
    }
  ];

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEventos(eventosSimulados);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarEvento = async () => {
    if (!novoEvento.nome || !novoEvento.data || !novoEvento.local) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const evento: Evento = {
        id: eventos.length + 1,
        nome: novoEvento.nome,
        data: novoEvento.data,
        local: novoEvento.local,
        capacidade: novoEvento.capacidade,
        participantes: 0,
        faturamento: 0,
        status: 'planejamento',
        tipo: novoEvento.tipo as any,
        cashlessAtivo: novoEvento.cashlessAtivo,
        cartoesEmitidos: 0,
        saldoTotal: 0,
        transacoes: 0
      };

      setEventos(prev => [evento, ...prev]);
      setShowNovoEvento(false);
      setNovoEvento({
        nome: '',
        data: '',
        local: '',
        capacidade: 0,
        tipo: 'festa',
        cashlessAtivo: true,
        valorMinimo: 10.00
      });
      
      alert('Evento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  const filtrarEventos = () => {
    return eventos.filter(evento => {
      const matchSearch = evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.local.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'todos' || evento.status === statusFilter;
      return matchSearch && matchStatus;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500';
      case 'finalizado': return 'bg-blue-500';
      case 'cancelado': return 'bg-red-500';
      case 'planejamento': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'festa': return '🎉';
      case 'show': return '🎵';
      case 'corporativo': return '🏢';
      case 'casamento': return '💒';
      case 'formatura': return '🎓';
      default: return '📅';
    }
  };

  const calcularOcupacao = (participantes: number, capacidade: number) => {
    return capacidade > 0 ? (participantes / capacidade) * 100 : 0;
  };

  const eventosAtivos = eventos.filter(e => e.status === 'ativo').length;
  const totalParticipantes = eventos.reduce((sum, e) => sum + e.participantes, 0);
  const faturamentoTotal = eventos.reduce((sum, e) => sum + e.faturamento, 0);
  const mediaOcupacao = eventos.length > 0 ? 
    eventos.reduce((sum, e) => sum + calcularOcupacao(e.participantes, e.capacidade), 0) / eventos.length : 0;

  if (loading && eventos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 animate-pulse text-purple-400 mx-auto mb-4" />
            <p className="text-white text-lg">Carregando eventos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Eventos Supremo</h1>
              <p className="text-gray-400">Gestão completa de eventos com cashless integrado</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowNovoEvento(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{eventosAtivos}</p>
                  <p className="text-gray-400 text-sm">Eventos Ativos</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{totalParticipantes.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Total Participantes</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">R$ {(faturamentoTotal / 1000).toFixed(0)}K</p>
                  <p className="text-gray-400 text-sm">Faturamento Total</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{mediaOcupacao.toFixed(1)}%</p>
                  <p className="text-gray-400 text-sm">Ocupação Média</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-600 text-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="planejamento">Planejamento</option>
            <option value="finalizado">Finalizados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Modal Novo Evento */}
      {showNovoEvento && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-gray-900 border-purple-500/30 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Criar Novo Evento</CardTitle>
              <CardDescription className="text-gray-400">
                Configure um novo evento com sistema cashless integrado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome" className="text-white">Nome do Evento *</Label>
                  <Input
                    id="nome"
                    value={novoEvento.nome}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, nome: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Ex: Festa de Ano Novo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipo" className="text-white">Tipo de Evento</Label>
                  <select
                    id="tipo"
                    value={novoEvento.tipo}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                  >
                    <option value="festa">🎉 Festa</option>
                    <option value="show">🎵 Show</option>
                    <option value="corporativo">🏢 Corporativo</option>
                    <option value="casamento">💒 Casamento</option>
                    <option value="formatura">🎓 Formatura</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data" className="text-white">Data e Hora *</Label>
                  <Input
                    id="data"
                    type="datetime-local"
                    value={novoEvento.data}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, data: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="capacidade" className="text-white">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    value={novoEvento.capacidade}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, capacidade: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Ex: 1000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="local" className="text-white">Local do Evento *</Label>
                <Input
                  id="local"
                  value={novoEvento.local}
                  onChange={(e) => setNovoEvento(prev => ({ ...prev, local: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="Ex: Clube Supremo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cashless"
                    checked={novoEvento.cashlessAtivo}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, cashlessAtivo: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="cashless" className="text-white">Ativar Sistema Cashless</Label>
                </div>
                
                {novoEvento.cashlessAtivo && (
                  <div>
                    <Label htmlFor="valorMinimo" className="text-white">Valor Mínimo Recarga (R$)</Label>
                    <Input
                      id="valorMinimo"
                      type="number"
                      step="0.01"
                      value={novoEvento.valorMinimo}
                      onChange={(e) => setNovoEvento(prev => ({ ...prev, valorMinimo: parseFloat(e.target.value) || 0 }))}
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                )}
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/30">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  O sistema cashless será configurado automaticamente com caixa integrado e relatórios em tempo real.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => setShowNovoEvento(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={criarEvento}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? 'Criando...' : 'Criar Evento'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtrarEventos().map((evento) => (
          <Card key={evento.id} className="bg-black/20 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTipoIcon(evento.tipo)}</span>
                  <div>
                    <CardTitle className="text-white text-lg">{evento.nome}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {new Date(evento.data).toLocaleDateString('pt-BR')} às {new Date(evento.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={`${getStatusColor(evento.status)} text-white`}>
                  {evento.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{evento.local}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-lg font-bold text-white">{evento.participantes}</p>
                  <p className="text-xs text-gray-400">Participantes</p>
                </div>
                <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-lg font-bold text-white">{calcularOcupacao(evento.participantes, evento.capacidade).toFixed(1)}%</p>
                  <p className="text-xs text-gray-400">Ocupação</p>
                </div>
              </div>

              {evento.cashlessAtivo && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-300">Cashless Ativo</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="font-bold text-white">{evento.cartoesEmitidos}</p>
                      <p className="text-gray-400">Cartões</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white">R$ {(evento.saldoTotal / 1000).toFixed(1)}K</p>
                      <p className="text-gray-400">Saldo</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white">{evento.transacoes}</p>
                      <p className="text-gray-400">Transações</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-lg font-bold text-green-400">R$ {(evento.faturamento / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-400">Faturamento</p>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtrarEventos().length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum evento encontrado</p>
          <p className="text-gray-500 text-sm">Crie seu primeiro evento ou ajuste os filtros</p>
        </div>
      )}
    </div>
  );
};

export default EventosSupremo;
