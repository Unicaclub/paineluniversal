import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Smartphone, 
  QrCode, 
  CreditCard, 
  Wallet, 
  Plus, 
  Minus,
  History,
  Scan,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock,
  User,
  MapPin,
  Zap
} from 'lucide-react';

interface Transacao {
  id: string;
  tipo: 'recarga' | 'consumo';
  valor: number;
  descricao: string;
  data: string;
  local: string;
  status: 'aprovada' | 'pendente' | 'rejeitada';
}

interface ComandaMobile {
  id: string;
  qrCode: string;
  saldo: number;
  status: 'ativa' | 'bloqueada';
  clienteNome: string;
  eventoNome: string;
  ultimaTransacao?: string;
}

const CashlessMobile: React.FC = () => {
  const [comanda, setComanda] = useState<ComandaMobile | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('saldo');
  const [valorRecarga, setValorRecarga] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const comandaSimulada: ComandaMobile = {
    id: 'CMD001',
    qrCode: 'QR_CMD001_ABC123',
    saldo: 125.50,
    status: 'ativa',
    clienteNome: 'João Silva',
    eventoNome: 'Festa de Ano Novo 2025',
    ultimaTransacao: '2024-12-30T22:15:00'
  };

  const transacoesSimuladas: Transacao[] = [
    {
      id: 'T001',
      tipo: 'consumo',
      valor: -15.00,
      descricao: 'Cerveja Heineken',
      data: '2024-12-30T22:15:00',
      local: 'Bar Principal',
      status: 'aprovada'
    },
    {
      id: 'T002',
      tipo: 'consumo',
      valor: -25.00,
      descricao: 'Combo Hambúrguer',
      data: '2024-12-30T21:30:00',
      local: 'Food Truck',
      status: 'aprovada'
    },
    {
      id: 'T003',
      tipo: 'recarga',
      valor: 100.00,
      descricao: 'Recarga PIX',
      data: '2024-12-30T20:00:00',
      local: 'App Mobile',
      status: 'aprovada'
    },
    {
      id: 'T004',
      tipo: 'consumo',
      valor: -12.50,
      descricao: 'Água + Energético',
      data: '2024-12-30T19:45:00',
      local: 'Bar Secundário',
      status: 'aprovada'
    }
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setComanda(comandaSimulada);
      setTransacoes(transacoesSimuladas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const processarRecarga = async () => {
    if (!valorRecarga || parseFloat(valorRecarga) <= 0) {
      alert('Digite um valor válido para recarga');
      return;
    }

    setLoading(true);
    try {
      const valor = parseFloat(valorRecarga);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (comanda) {
        setComanda(prev => prev ? { ...prev, saldo: prev.saldo + valor } : null);
        
        const novaTransacao: Transacao = {
          id: `T${String(transacoes.length + 1).padStart(3, '0')}`,
          tipo: 'recarga',
          valor: valor,
          descricao: 'Recarga Mobile',
          data: new Date().toISOString(),
          local: 'App Mobile',
          status: 'aprovada'
        };
        
        setTransacoes(prev => [novaTransacao, ...prev]);
        setValorRecarga('');
        alert(`Recarga de R$ ${valor.toFixed(2)} realizada com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao processar recarga:', error);
      alert('Erro ao processar recarga');
    } finally {
      setLoading(false);
    }
  };

  const abrirScanner = () => {
    setShowScanner(true);
    setTimeout(() => {
      setShowScanner(false);
      alert('QR Code escaneado com sucesso!');
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-500';
      case 'bloqueada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTransacaoIcon = (tipo: string) => {
    return tipo === 'recarga' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />;
  };

  const getTransacaoColor = (tipo: string) => {
    return tipo === 'recarga' ? 'text-green-400' : 'text-red-400';
  };

  if (loading && !comanda) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white text-lg">Carregando...</p>
            <p className="text-gray-400 text-sm mt-2">Conectando com seu cartão</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      {/* Header Mobile */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Cashless Mobile</h1>
              <p className="text-gray-400 text-sm">{comanda?.eventoNome}</p>
            </div>
          </div>
          
          <Button 
            onClick={carregarDados}
            size="sm"
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Status da Comanda */}
        {comanda && (
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{comanda.clienteNome}</p>
                  <p className="text-gray-400 text-sm">{comanda.id}</p>
                </div>
                <Badge className={`${getStatusColor(comanda.status)} text-white`}>
                  {comanda.status === 'ativa' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  {comanda.status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-sm bg-gray-900 border-purple-500/30">
            <CardContent className="p-8 text-center">
              <div className="w-32 h-32 border-4 border-purple-500 border-dashed rounded-lg mx-auto mb-4 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-purple-400 animate-pulse" />
              </div>
              <p className="text-white font-semibold mb-2">Escaneando QR Code</p>
              <p className="text-gray-400 text-sm">Aponte a câmera para o código</p>
              <Button 
                onClick={() => setShowScanner(false)}
                variant="outline"
                className="mt-4 border-gray-600 text-gray-300"
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Mobile */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-black/20 backdrop-blur-sm">
          <TabsTrigger value="saldo" className="text-white data-[state=active]:bg-purple-600">
            <Wallet className="w-4 h-4 mr-2" />
            Saldo
          </TabsTrigger>
          <TabsTrigger value="recarga" className="text-white data-[state=active]:bg-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Recarga
          </TabsTrigger>
          <TabsTrigger value="historico" className="text-white data-[state=active]:bg-purple-600">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Tab Saldo */}
        <TabsContent value="saldo" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-4xl font-bold text-white">R$ {comanda?.saldo.toFixed(2)}</p>
                <p className="text-gray-400">Saldo disponível</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button 
                  onClick={abrirScanner}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Pagar
                </Button>
                <Button 
                  onClick={() => setActiveTab('recarga')}
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Recarregar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* QR Code da Comanda */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Seu QR Code</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Mostre este código para recarregar ou pagar
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                <QrCode className="w-24 h-24 text-black" />
              </div>
              <p className="text-gray-400 text-sm font-mono">{comanda?.qrCode}</p>
            </CardContent>
          </Card>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">R$ 165,00</p>
                <p className="text-gray-400 text-xs">Total Recarregado</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 backdrop-blur-sm border-red-500/20">
              <CardContent className="p-4 text-center">
                <Minus className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">R$ 52,50</p>
                <p className="text-gray-400 text-xs">Total Gasto</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Recarga */}
        <TabsContent value="recarga" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Recarregar Cartão</CardTitle>
              <CardDescription className="text-gray-400">
                Adicione créditos ao seu cartão cashless
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="valor" className="text-white">Valor da Recarga (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={valorRecarga}
                  onChange={(e) => setValorRecarga(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white text-lg text-center"
                />
              </div>
              
              {/* Valores Rápidos */}
              <div className="grid grid-cols-3 gap-2">
                {[20, 50, 100].map(valor => (
                  <Button
                    key={valor}
                    onClick={() => setValorRecarga(valor.toString())}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                  >
                    R$ {valor}
                  </Button>
                ))}
              </div>
              
              <Button 
                onClick={processarRecarga}
                disabled={loading || !valorRecarga}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Recarregar via PIX
                  </>
                )}
              </Button>
              
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Recarga instantânea via PIX. Sem taxas adicionais.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Histórico */}
        <TabsContent value="historico" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Histórico de Transações</CardTitle>
              <CardDescription className="text-gray-400">
                Suas últimas movimentações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {transacoes.map((transacao) => (
                <div key={transacao.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transacao.tipo === 'recarga' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {getTransacaoIcon(transacao.tipo)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{transacao.descricao}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{transacao.local}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{new Date(transacao.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransacaoColor(transacao.tipo)}`}>
                      {transacao.tipo === 'recarga' ? '+' : ''}R$ {Math.abs(transacao.valor).toFixed(2)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transacao.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Mobile */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-xs">
          Powered by Sistema Supremo • Cashless Technology
        </p>
      </div>
    </div>
  );
};

export default CashlessMobile;
