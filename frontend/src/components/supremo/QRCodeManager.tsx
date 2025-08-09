import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  QrCode, 
  CreditCard, 
  Plus, 
  Search, 
  Eye, 
  Lock, 
  Unlock,
  Download,
  RefreshCw,
  Smartphone,
  Wallet,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { pdvService } from '../../services/api';

interface Comanda {
  id: string;
  qrCode: string;
  clienteCPF: string;
  clienteNome: string;
  saldo: number;
  status: 'ativa' | 'bloqueada' | 'cancelada';
  eventoId: number;
  eventoNome: string;
  criadoEm: string;
  ultimaTransacao?: string;
}

interface NovaComandaData {
  clienteCPF: string;
  clienteNome: string;
  eventoId: number;
  saldoInicial: number;
  tipo: 'digital' | 'fisica';
}

const QRCodeManager: React.FC = () => {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvento, setSelectedEvento] = useState<number | null>(null);
  const [showNovaComanda, setShowNovaComanda] = useState(false);
  const [novaComandaData, setNovaComandaData] = useState<NovaComandaData>({
    clienteCPF: '',
    clienteNome: '',
    eventoId: 0,
    saldoInicial: 0,
    tipo: 'digital'
  });

  const comandasSimuladas: Comanda[] = [
    {
      id: 'CMD001',
      qrCode: 'QR_CMD001_ABC123',
      clienteCPF: '123.456.789-00',
      clienteNome: 'João Silva',
      saldo: 85.50,
      status: 'ativa',
      eventoId: 1,
      eventoNome: 'Festa de Ano Novo 2025',
      criadoEm: '2024-12-30T10:30:00',
      ultimaTransacao: '2024-12-30T22:15:00'
    },
    {
      id: 'CMD002',
      qrCode: 'QR_CMD002_DEF456',
      clienteCPF: '987.654.321-00',
      clienteNome: 'Maria Santos',
      saldo: 120.00,
      status: 'ativa',
      eventoId: 1,
      eventoNome: 'Festa de Ano Novo 2025',
      criadoEm: '2024-12-30T11:00:00',
      ultimaTransacao: '2024-12-30T21:45:00'
    },
    {
      id: 'CMD003',
      qrCode: 'QR_CMD003_GHI789',
      clienteCPF: '456.789.123-00',
      clienteNome: 'Pedro Costa',
      saldo: 0.00,
      status: 'bloqueada',
      eventoId: 2,
      eventoNome: 'Show Rock Nacional',
      criadoEm: '2024-12-29T15:20:00',
      ultimaTransacao: '2024-12-29T23:30:00'
    }
  ];

  useEffect(() => {
    carregarComandas();
  }, [selectedEvento]);

  const carregarComandas = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let comandasFiltradas = comandasSimuladas;
      if (selectedEvento) {
        comandasFiltradas = comandasSimuladas.filter(c => c.eventoId === selectedEvento);
      }
      
      setComandas(comandasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar comandas:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarComanda = async () => {
    if (!novaComandaData.clienteCPF || !novaComandaData.clienteNome || !novaComandaData.eventoId) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const novaComanda: Comanda = {
        id: `CMD${String(comandas.length + 1).padStart(3, '0')}`,
        qrCode: `QR_CMD${String(comandas.length + 1).padStart(3, '0')}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        clienteCPF: novaComandaData.clienteCPF,
        clienteNome: novaComandaData.clienteNome,
        saldo: novaComandaData.saldoInicial,
        status: 'ativa',
        eventoId: novaComandaData.eventoId,
        eventoNome: 'Evento Selecionado',
        criadoEm: new Date().toISOString(),
        ultimaTransacao: undefined
      };

      setComandas(prev => [novaComanda, ...prev]);
      setShowNovaComanda(false);
      setNovaComandaData({
        clienteCPF: '',
        clienteNome: '',
        eventoId: 0,
        saldoInicial: 0,
        tipo: 'digital'
      });

      alert('Comanda criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar comanda:', error);
      alert('Erro ao criar comanda');
    } finally {
      setLoading(false);
    }
  };

  const alterarStatusComanda = async (comandaId: string) => {
    const comanda = comandas.find(c => c.id === comandaId);
    if (!comanda) return;

    const novoStatus = comanda.status === 'ativa' ? 'bloqueada' : 'ativa';
    
    setComandas(prev => prev.map(c => 
      c.id === comandaId ? { ...c, status: novoStatus } : c
    ));

    alert(`Comanda ${novoStatus === 'ativa' ? 'desbloqueada' : 'bloqueada'} com sucesso!`);
  };

  const gerarQRCode = (qrCode: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    if (ctx) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(qrCode, 100, 100);
    }
    
    const link = document.createElement('a');
    link.download = `qrcode-${qrCode}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const comandasFiltradas = comandas.filter(comanda =>
    comanda.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comanda.clienteCPF.includes(searchTerm) ||
    comanda.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-500';
      case 'bloqueada': return 'bg-red-500';
      case 'cancelada': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa': return <CheckCircle className="w-4 h-4" />;
      case 'bloqueada': return <Lock className="w-4 h-4" />;
      case 'cancelada': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <QrCode className="w-8 h-8 text-purple-400" />
            Gerenciador de QR Codes
          </h1>
          <p className="text-gray-300 mt-2">Gestão completa de comandas e cartões cashless</p>
        </div>
        
        <Button 
          onClick={() => setShowNovaComanda(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Comanda
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, CPF ou ID da comanda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <Button 
              onClick={carregarComandas}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Nova Comanda */}
      {showNovaComanda && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-gray-900 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Nova Comanda
              </CardTitle>
              <CardDescription className="text-gray-400">
                Criar nova comanda cashless para cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cpf" className="text-white">CPF do Cliente</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={novaComandaData.clienteCPF}
                  onChange={(e) => setNovaComandaData(prev => ({ ...prev, clienteCPF: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="nome" className="text-white">Nome do Cliente</Label>
                <Input
                  id="nome"
                  placeholder="Nome completo"
                  value={novaComandaData.clienteNome}
                  onChange={(e) => setNovaComandaData(prev => ({ ...prev, clienteNome: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="evento" className="text-white">ID do Evento</Label>
                <Input
                  id="evento"
                  type="number"
                  placeholder="1"
                  value={novaComandaData.eventoId || ''}
                  onChange={(e) => setNovaComandaData(prev => ({ ...prev, eventoId: parseInt(e.target.value) || 0 }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="saldo" className="text-white">Saldo Inicial (R$)</Label>
                <Input
                  id="saldo"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={novaComandaData.saldoInicial || ''}
                  onChange={(e) => setNovaComandaData(prev => ({ ...prev, saldoInicial: parseFloat(e.target.value) || 0 }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={criarComanda}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Criando...' : 'Criar Comanda'}
                </Button>
                <Button 
                  onClick={() => setShowNovaComanda(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Comandas */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-gray-300">Carregando comandas...</p>
            </CardContent>
          </Card>
        ) : comandasFiltradas.length === 0 ? (
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-8 text-center">
              <QrCode className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma comanda encontrada</p>
            </CardContent>
          </Card>
        ) : (
          comandasFiltradas.map((comanda) => (
            <Card key={comanda.id} className="bg-black/20 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-purple-400" />
                    </div>
                    
                    <div>
                      <h3 className="text-white font-semibold">{comanda.clienteNome}</h3>
                      <p className="text-gray-400 text-sm">{comanda.clienteCPF} • {comanda.id}</p>
                      <p className="text-gray-500 text-xs">{comanda.eventoNome}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">R$ {comanda.saldo.toFixed(2)}</p>
                      <Badge className={`${getStatusColor(comanda.status)} text-white`}>
                        {getStatusIcon(comanda.status)}
                        <span className="ml-1 capitalize">{comanda.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => gerarQRCode(comanda.qrCode)}
                        className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alterarStatusComanda(comanda.id)}
                        className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                      >
                        {comanda.status === 'ativa' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {comanda.ultimaTransacao && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-sm">
                      Última transação: {new Date(comanda.ultimaTransacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{comandas.length}</p>
            <p className="text-gray-400 text-sm">Total Comandas</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{comandas.filter(c => c.status === 'ativa').length}</p>
            <p className="text-gray-400 text-sm">Ativas</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-sm border-red-500/20">
          <CardContent className="p-4 text-center">
            <Lock className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{comandas.filter(c => c.status === 'bloqueada').length}</p>
            <p className="text-gray-400 text-sm">Bloqueadas</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-sm border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Wallet className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">R$ {comandas.reduce((sum, c) => sum + c.saldo, 0).toFixed(2)}</p>
            <p className="text-gray-400 text-sm">Saldo Total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeManager;
