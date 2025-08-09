import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Lock,
  Unlock,
  QrCode,
  Smartphone,
  Wallet,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  Zap,
  Clock,
  MapPin
} from 'lucide-react';

interface Cartao {
  id: string;
  qrCode: string;
  tipo: 'fisico' | 'digital';
  status: 'ativo' | 'bloqueado' | 'perdido' | 'devolvido';
  saldo: number;
  clienteId?: number;
  clienteNome?: string;
  clienteCPF?: string;
  eventoId: number;
  eventoNome: string;
  dataEmissao: string;
  ultimaTransacao?: string;
  totalTransacoes: number;
  totalRecarregado: number;
  totalGasto: number;
  localizacao?: string;
}

interface NovoCartao {
  tipo: 'fisico' | 'digital';
  clienteId?: number;
  eventoId: number;
  saldoInicial: number;
  observacoes: string;
}

const CartoesSupremo: React.FC = () => {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [showNovoCartao, setShowNovoCartao] = useState(false);
  const [novoCartao, setNovoCartao] = useState<NovoCartao>({
    tipo: 'digital',
    eventoId: 1,
    saldoInicial: 0,
    observacoes: ''
  });

  const cartoesSimulados: Cartao[] = [
    {
      id: 'CMD001',
      qrCode: 'QR_CMD001_ABC123',
      tipo: 'digital',
      status: 'ativo',
      saldo: 125.50,
      clienteId: 1,
      clienteNome: 'João Silva Santos',
      clienteCPF: '123.456.789-00',
      eventoId: 1,
      eventoNome: 'Festa de Ano Novo 2025',
      dataEmissao: '2024-12-30T18:00:00',
      ultimaTransacao: '2024-12-30T22:15:00',
      totalTransacoes: 8,
      totalRecarregado: 200.00,
      totalGasto: 74.50,
      localizacao: 'Bar Principal'
    },
    {
      id: 'CMD002',
      qrCode: 'QR_CMD002_DEF456',
      tipo: 'fisico',
      status: 'ativo',
      saldo: 89.75,
      clienteId: 2,
      clienteNome: 'Maria Oliveira Costa',
      clienteCPF: '987.654.321-00',
      eventoId: 1,
      eventoNome: 'Festa de Ano Novo 2025',
      dataEmissao: '2024-12-30T19:30:00',
      ultimaTransacao: '2024-12-30T21:45:00',
      totalTransacoes: 5,
      totalRecarregado: 150.00,
      totalGasto: 60.25,
      localizacao: 'Food Truck'
    },
    {
      id: 'CMD003',
      qrCode: 'QR_CMD003_GHI789',
      tipo: 'digital',
      status: 'bloqueado',
      saldo: 45.20,
      clienteId: 3,
      clienteNome: 'Carlos Eduardo Lima',
      clienteCPF: '456.789.123-00',
      eventoId: 2,
      eventoNome: 'Show Rock Nacional',
      dataEmissao: '2025-01-10T16:00:00',
      ultimaTransacao: '2025-01-10T20:30:00',
      totalTransacoes: 3,
      totalRecarregado: 100.00,
      totalGasto: 54.80,
      localizacao: 'Arena Central'
    },
    {
      id: 'CMD004',
      qrCode: 'QR_CMD004_JKL012',
      tipo: 'fisico',
      status: 'perdido',
      saldo: 0,
      clienteId: 4,
      clienteNome: 'Ana Paula Ferreira',
      clienteCPF: '321.654.987-00',
      eventoId: 1,
      eventoNome: 'Festa de Ano Novo 2025',
      dataEmissao: '2024-12-29T20:00:00',
      ultimaTransacao: '2024-12-30T19:15:00',
      totalTransacoes: 12,
      totalRecarregado: 180.00,
      totalGasto: 180.00,
      localizacao: 'Perdido'
    },
    {
      id: 'CMD005',
      qrCode: 'QR_CMD005_MNO345',
      tipo: 'digital',
      status: 'devolvido',
      saldo: 15.30,
      eventoId: 4,
      eventoNome: 'Evento Corporativo TechCorp',
      dataEmissao: '2024-12-20T18:00:00',
      ultimaTransacao: '2024-12-20T22:00:00',
      totalTransacoes: 6,
      totalRecarregado: 80.00,
      totalGasto: 64.70,
      localizacao: 'Hotel Business'
    }
  ];

  useEffect(() => {
    carregarCartoes();
  }, []);

  const carregarCartoes = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCartoes(cartoesSimulados);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarCartao = async () => {
    if (!novoCartao.eventoId) {
      alert('Selecione um evento');
      return;
    }

    setLoading(true);
    try {
      const cartao: Cartao = {
        id: `CMD${String(cartoes.length + 1).padStart(3, '0')}`,
        qrCode: `QR_CMD${String(cartoes.length + 1).padStart(3, '0')}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        tipo: novoCartao.tipo,
        status: 'ativo',
        saldo: novoCartao.saldoInicial,
        clienteId: novoCartao.clienteId,
        eventoId: novoCartao.eventoId,
        eventoNome: 'Evento Selecionado',
        dataEmissao: new Date().toISOString(),
        totalTransacoes: 0,
        totalRecarregado: novoCartao.saldoInicial,
        totalGasto: 0
      };

      setCartoes(prev => [cartao, ...prev]);
      setShowNovoCartao(false);
      setNovoCartao({
        tipo: 'digital',
        eventoId: 1,
        saldoInicial: 0,
        observacoes: ''
      });
      
      alert('Cartão criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      alert('Erro ao criar cartão');
    } finally {
      setLoading(false);
    }
  };

  const alterarStatusCartao = async (cartaoId: string, novoStatus: string) => {
    setCartoes(prev => prev.map(cartao => 
      cartao.id === cartaoId 
        ? { ...cartao, status: novoStatus as any }
        : cartao
    ));
    
    alert(`Cartão ${novoStatus} com sucesso!`);
  };

  const filtrarCartoes = () => {
    return cartoes.filter(cartao => {
      const matchSearch = cartao.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cartao.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cartao.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cartao.clienteCPF?.includes(searchTerm);
      const matchStatus = statusFilter === 'todos' || cartao.status === statusFilter;
      const matchTipo = tipoFilter === 'todos' || cartao.tipo === tipoFilter;
      return matchSearch && matchStatus && matchTipo;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500';
      case 'bloqueado': return 'bg-yellow-500';
      case 'perdido': return 'bg-red-500';
      case 'devolvido': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return <CheckCircle className="w-4 h-4" />;
      case 'bloqueado': return <Lock className="w-4 h-4" />;
      case 'perdido': return <XCircle className="w-4 h-4" />;
      case 'devolvido': return <RefreshCw className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'digital' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />;
  };

  const cartoesAtivos = cartoes.filter(c => c.status === 'ativo').length;
  const cartoesBloqueados = cartoes.filter(c => c.status === 'bloqueado').length;
  const saldoTotal = cartoes.reduce((sum, c) => sum + c.saldo, 0);
  const faturamentoTotal = cartoes.reduce((sum, c) => sum + c.totalGasto, 0);

  if (loading && cartoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-8 text-center">
            <CreditCard className="w-12 h-12 animate-pulse text-purple-400 mx-auto mb-4" />
            <p className="text-white text-lg">Carregando cartões...</p>
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
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Cartões Supremo</h1>
              <p className="text-gray-400">Gestão completa de cartões e comandas cashless</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowNovoCartao(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cartão
          </Button>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{cartoesAtivos}</p>
                  <p className="text-gray-400 text-sm">Cartões Ativos</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{cartoesBloqueados}</p>
                  <p className="text-gray-400 text-sm">Cartões Bloqueados</p>
                </div>
                <Lock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">R$ {(saldoTotal / 1000).toFixed(1)}K</p>
                  <p className="text-gray-400 text-sm">Saldo Total</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">R$ {(faturamentoTotal / 1000).toFixed(0)}K</p>
                  <p className="text-gray-400 text-sm">Faturamento</p>
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
              placeholder="Buscar por ID, QR Code, cliente..."
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
            <option value="bloqueado">Bloqueados</option>
            <option value="perdido">Perdidos</option>
            <option value="devolvido">Devolvidos</option>
          </select>

          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="digital">Digital</option>
            <option value="fisico">Físico</option>
          </select>

          <Button
            onClick={carregarCartoes}
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Modal Novo Cartão */}
      {showNovoCartao && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-gray-900 border-purple-500/30 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Criar Novo Cartão</CardTitle>
              <CardDescription className="text-gray-400">
                Configure um novo cartão cashless para o evento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo" className="text-white">Tipo de Cartão</Label>
                  <select
                    id="tipo"
                    value={novoCartao.tipo}
                    onChange={(e) => setNovoCartao(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                  >
                    <option value="digital">📱 Digital (QR Code)</option>
                    <option value="fisico">💳 Físico (NFC/RFID)</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="evento" className="text-white">Evento</Label>
                  <select
                    id="evento"
                    value={novoCartao.eventoId}
                    onChange={(e) => setNovoCartao(prev => ({ ...prev, eventoId: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                  >
                    <option value="1">Festa de Ano Novo 2025</option>
                    <option value="2">Show Rock Nacional</option>
                    <option value="3">Casamento Silva & Santos</option>
                    <option value="4">Evento Corporativo TechCorp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente" className="text-white">Cliente (Opcional)</Label>
                  <select
                    id="cliente"
                    value={novoCartao.clienteId || ''}
                    onChange={(e) => setNovoCartao(prev => ({ ...prev, clienteId: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Sem cliente vinculado</option>
                    <option value="1">João Silva Santos</option>
                    <option value="2">Maria Oliveira Costa</option>
                    <option value="3">Carlos Eduardo Lima</option>
                    <option value="4">Ana Paula Ferreira</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="saldoInicial" className="text-white">Saldo Inicial (R$)</Label>
                  <Input
                    id="saldoInicial"
                    type="number"
                    step="0.01"
                    value={novoCartao.saldoInicial}
                    onChange={(e) => setNovoCartao(prev => ({ ...prev, saldoInicial: parseFloat(e.target.value) || 0 }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-white">Observações</Label>
                <Input
                  id="observacoes"
                  value={novoCartao.observacoes}
                  onChange={(e) => setNovoCartao(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="Observações sobre o cartão"
                />
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/30">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  {novoCartao.tipo === 'digital' 
                    ? 'Cartão digital será criado com QR Code único para uso no app mobile.'
                    : 'Cartão físico requer programação NFC/RFID no momento da entrega.'
                  }
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => setShowNovoCartao(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={criarCartao}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? 'Criando...' : 'Criar Cartão'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Cartões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtrarCartoes().map((cartao) => (
          <Card key={cartao.id} className="bg-black/20 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                    {getTipoIcon(cartao.tipo)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{cartao.id}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {cartao.eventoNome}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getStatusColor(cartao.status)} text-white flex items-center gap-1`}>
                    {getStatusIcon(cartao.status)}
                    {cartao.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-gray-300">
                    {cartao.tipo.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {cartao.clienteNome && (
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{cartao.clienteNome}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <QrCode className="w-4 h-4" />
                <span className="font-mono text-xs">{cartao.qrCode}</span>
              </div>

              <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                <p className="text-3xl font-bold text-white">R$ {cartao.saldo.toFixed(2)}</p>
                <p className="text-gray-400 text-sm">Saldo Atual</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-800/20 rounded">
                  <p className="font-bold text-white">{cartao.totalTransacoes}</p>
                  <p className="text-gray-400">Transações</p>
                </div>
                <div className="text-center p-2 bg-gray-800/20 rounded">
                  <p className="font-bold text-white">R$ {cartao.totalRecarregado.toFixed(0)}</p>
                  <p className="text-gray-400">Recarregado</p>
                </div>
                <div className="text-center p-2 bg-gray-800/20 rounded">
                  <p className="font-bold text-white">R$ {cartao.totalGasto.toFixed(0)}</p>
                  <p className="text-gray-400">Gasto</p>
                </div>
              </div>

              {cartao.ultimaTransacao && (
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Última transação: {new Date(cartao.ultimaTransacao).toLocaleString('pt-BR')}</span>
                </div>
              )}

              {cartao.localizacao && (
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{cartao.localizacao}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                
                {cartao.status === 'ativo' ? (
                  <Button 
                    size="sm" 
                    onClick={() => alterarStatusCartao(cartao.id, 'bloqueado')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Lock className="w-4 h-4 mr-1" />
                    Bloquear
                  </Button>
                ) : cartao.status === 'bloqueado' ? (
                  <Button 
                    size="sm" 
                    onClick={() => alterarStatusCartao(cartao.id, 'ativo')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Unlock className="w-4 h-4 mr-1" />
                    Ativar
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-600 text-gray-300"
                    disabled
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {cartao.status}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtrarCartoes().length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum cartão encontrado</p>
          <p className="text-gray-500 text-sm">Crie seu primeiro cartão ou ajuste os filtros</p>
        </div>
      )}
    </div>
  );
};

export default CartoesSupremo;
