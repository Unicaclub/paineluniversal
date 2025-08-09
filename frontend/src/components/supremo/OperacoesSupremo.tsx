import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  DollarSign, 
  CreditCard, 
  ShoppingCart, 
  BarChart3,
  Plus, 
  Minus,
  Search, 
  QrCode,
  Scan,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  MapPin,
  Download,
  FileText,
  Printer,
  Mail,
  Smartphone,
  Zap,
  Target,
  PieChart,
  Activity
} from 'lucide-react';

interface Transacao {
  id: string;
  tipo: 'recarga' | 'consumo';
  cartaoId: string;
  clienteNome: string;
  valor: number;
  descricao: string;
  pontoVenda: string;
  data: string;
  status: 'aprovada' | 'pendente' | 'rejeitada';
  operador: string;
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  estoque: number;
  vendas: number;
}

interface ResumoFinanceiro {
  totalRecargas: number;
  totalConsumos: number;
  saldoCartoes: number;
  transacoesDia: number;
  ticketMedio: number;
  margemLiquida: number;
}

const OperacoesSupremo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recarga');
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [qrCodeRecarga, setQrCodeRecarga] = useState('');
  const [valorRecarga, setValorRecarga] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  
  const [qrCodeConsumo, setQrCodeConsumo] = useState('');
  const [produtosSelecionados, setProdutosSelecionados] = useState<{id: number, quantidade: number}[]>([]);
  const [pontoVenda, setPontoVenda] = useState('Bar Principal');
  
  const [tipoRelatorio, setTipoRelatorio] = useState('vendas');
  const [periodoRelatorio, setPeriodoRelatorio] = useState('hoje');

  const transacoesSimuladas: Transacao[] = [
    {
      id: 'T001',
      tipo: 'consumo',
      cartaoId: 'CMD001',
      clienteNome: 'João Silva',
      valor: -15.00,
      descricao: 'Cerveja Heineken',
      pontoVenda: 'Bar Principal',
      data: new Date().toISOString(),
      status: 'aprovada',
      operador: 'Sistema'
    },
    {
      id: 'T002',
      tipo: 'recarga',
      cartaoId: 'CMD002',
      clienteNome: 'Maria Oliveira',
      valor: 50.00,
      descricao: 'Recarga PIX',
      pontoVenda: 'Caixa Central',
      data: new Date(Date.now() - 300000).toISOString(),
      status: 'aprovada',
      operador: 'Operador 1'
    }
  ];

  const produtosSimulados: Produto[] = [
    { id: 1, nome: 'Cerveja Heineken', preco: 15.00, categoria: 'Bebidas', estoque: 120, vendas: 45 },
    { id: 2, nome: 'Hambúrguer Artesanal', preco: 25.00, categoria: 'Comidas', estoque: 30, vendas: 18 },
    { id: 3, nome: 'Água Mineral', preco: 5.00, categoria: 'Bebidas', estoque: 200, vendas: 67 },
    { id: 4, nome: 'Batata Frita', preco: 12.00, categoria: 'Comidas', estoque: 50, vendas: 23 }
  ];

  const resumoFinanceiro: ResumoFinanceiro = {
    totalRecargas: 12500.00,
    totalConsumos: 8750.00,
    saldoCartoes: 3750.00,
    transacoesDia: 156,
    ticketMedio: 18.50,
    margemLiquida: 87.5
  };

  useEffect(() => {
    setTransacoes(transacoesSimuladas);
    setProdutos(produtosSimulados);
  }, []);

  const processarRecarga = async () => {
    if (!qrCodeRecarga || !valorRecarga) {
      alert('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const novaTransacao: Transacao = {
        id: `T${String(transacoes.length + 1).padStart(3, '0')}`,
        tipo: 'recarga',
        cartaoId: qrCodeRecarga,
        clienteNome: 'Cliente Identificado',
        valor: parseFloat(valorRecarga),
        descricao: `Recarga via ${metodoPagamento.toUpperCase()}`,
        pontoVenda: 'Caixa Central',
        data: new Date().toISOString(),
        status: 'aprovada',
        operador: 'Sistema'
      };

      setTransacoes(prev => [novaTransacao, ...prev]);
      setQrCodeRecarga('');
      setValorRecarga('');
      alert(`Recarga de R$ ${valorRecarga} processada com sucesso!`);
    } catch (error) {
      alert('Erro ao processar recarga');
    } finally {
      setLoading(false);
    }
  };

  const processarVenda = async () => {
    if (!qrCodeConsumo || produtosSelecionados.length === 0) {
      alert('Escaneie um cartão e selecione produtos');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const valorTotal = produtosSelecionados.reduce((total, item) => {
        const produto = produtos.find(p => p.id === item.id);
        return total + (produto ? produto.preco * item.quantidade : 0);
      }, 0);

      const novaTransacao: Transacao = {
        id: `T${String(transacoes.length + 1).padStart(3, '0')}`,
        tipo: 'consumo',
        cartaoId: qrCodeConsumo,
        clienteNome: 'Cliente Identificado',
        valor: -valorTotal,
        descricao: `Venda - ${produtosSelecionados.length} itens`,
        pontoVenda: pontoVenda,
        data: new Date().toISOString(),
        status: 'aprovada',
        operador: 'Sistema'
      };

      setTransacoes(prev => [novaTransacao, ...prev]);
      setQrCodeConsumo('');
      setProdutosSelecionados([]);
      alert(`Venda de R$ ${valorTotal.toFixed(2)} processada com sucesso!`);
    } catch (error) {
      alert('Erro ao processar venda');
    } finally {
      setLoading(false);
    }
  };

  const adicionarProduto = (produtoId: number) => {
    setProdutosSelecionados(prev => {
      const existing = prev.find(p => p.id === produtoId);
      if (existing) {
        return prev.map(p => p.id === produtoId ? { ...p, quantidade: p.quantidade + 1 } : p);
      }
      return [...prev, { id: produtoId, quantidade: 1 }];
    });
  };

  const removerProduto = (produtoId: number) => {
    setProdutosSelecionados(prev => {
      const existing = prev.find(p => p.id === produtoId);
      if (existing && existing.quantidade > 1) {
        return prev.map(p => p.id === produtoId ? { ...p, quantidade: p.quantidade - 1 } : p);
      }
      return prev.filter(p => p.id !== produtoId);
    });
  };

  const calcularTotalVenda = () => {
    return produtosSelecionados.reduce((total, item) => {
      const produto = produtos.find(p => p.id === item.id);
      return total + (produto ? produto.preco * item.quantidade : 0);
    }, 0);
  };

  const gerarRelatorio = () => {
    alert(`Relatório de ${tipoRelatorio} (${periodoRelatorio}) gerado com sucesso!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Operações Supremo</h1>
            <p className="text-gray-400">Recarga, Consumo, Caixa e Relatórios Integrados</p>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">R$ {(resumoFinanceiro.totalRecargas / 1000).toFixed(1)}K</p>
              <p className="text-gray-400 text-xs">Recargas</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-red-500/20">
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">R$ {(resumoFinanceiro.totalConsumos / 1000).toFixed(1)}K</p>
              <p className="text-gray-400 text-xs">Consumos</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-blue-500/20">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">R$ {(resumoFinanceiro.saldoCartoes / 1000).toFixed(1)}K</p>
              <p className="text-gray-400 text-xs">Saldo Cartões</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{resumoFinanceiro.transacoesDia}</p>
              <p className="text-gray-400 text-xs">Transações</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-yellow-500/20">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">R$ {resumoFinanceiro.ticketMedio.toFixed(0)}</p>
              <p className="text-gray-400 text-xs">Ticket Médio</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
            <CardContent className="p-4 text-center">
              <PieChart className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{resumoFinanceiro.margemLiquida}%</p>
              <p className="text-gray-400 text-xs">Margem</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs de Operações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-black/20 backdrop-blur-sm">
          <TabsTrigger value="recarga" className="text-white data-[state=active]:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Recarga
          </TabsTrigger>
          <TabsTrigger value="consumo" className="text-white data-[state=active]:bg-red-600">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Consumo
          </TabsTrigger>
          <TabsTrigger value="caixa" className="text-white data-[state=active]:bg-blue-600">
            <DollarSign className="w-4 h-4 mr-2" />
            Caixa
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="text-white data-[state=active]:bg-purple-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Tab Recarga */}
        <TabsContent value="recarga" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Processar Recarga
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Adicione créditos ao cartão do cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="qrRecarga" className="text-white">QR Code / ID do Cartão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qrRecarga"
                      value={qrCodeRecarga}
                      onChange={(e) => setQrCodeRecarga(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white"
                      placeholder="Escaneie ou digite o código"
                    />
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Scan className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="valorRecarga" className="text-white">Valor da Recarga (R$)</Label>
                  <Input
                    id="valorRecarga"
                    type="number"
                    step="0.01"
                    value={valorRecarga}
                    onChange={(e) => setValorRecarga(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white text-lg text-center"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="metodo" className="text-white">Método de Pagamento</Label>
                  <select
                    id="metodo"
                    value={metodoPagamento}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                  >
                    <option value="pix">💰 PIX</option>
                    <option value="cartao">💳 Cartão</option>
                    <option value="dinheiro">💵 Dinheiro</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[20, 50, 100].map(valor => (
                    <Button
                      key={valor}
                      onClick={() => setValorRecarga(valor.toString())}
                      variant="outline"
                      size="sm"
                      className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                    >
                      R$ {valor}
                    </Button>
                  ))}
                </div>

                <Button 
                  onClick={processarRecarga}
                  disabled={loading || !qrCodeRecarga || !valorRecarga}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Processar Recarga
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Últimas Recargas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transacoes.filter(t => t.tipo === 'recarga').slice(0, 5).map((transacao) => (
                    <div key={transacao.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium text-sm">{transacao.clienteNome}</p>
                        <p className="text-gray-400 text-xs">{transacao.descricao}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">+R$ {transacao.valor.toFixed(2)}</p>
                        <p className="text-gray-400 text-xs">{new Date(transacao.data).toLocaleTimeString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Consumo */}
        <TabsContent value="consumo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-red-400" />
                  Processar Venda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="qrConsumo" className="text-white">QR Code do Cliente</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qrConsumo"
                      value={qrCodeConsumo}
                      onChange={(e) => setQrCodeConsumo(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white"
                      placeholder="Escaneie o cartão"
                    />
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Scan className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ponto" className="text-white">Ponto de Venda</Label>
                  <select
                    id="ponto"
                    value={pontoVenda}
                    onChange={(e) => setPontoVenda(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                  >
                    <option value="Bar Principal">🍺 Bar Principal</option>
                    <option value="Food Truck">🍔 Food Truck</option>
                    <option value="Bar Secundário">🥤 Bar Secundário</option>
                    <option value="Loja de Souvenirs">🎁 Souvenirs</option>
                  </select>
                </div>

                {produtosSelecionados.length > 0 && (
                  <div className="bg-gray-800/30 rounded-lg p-3">
                    <h4 className="text-white font-semibold mb-2">Carrinho</h4>
                    {produtosSelecionados.map(item => {
                      const produto = produtos.find(p => p.id === item.id);
                      return produto ? (
                        <div key={item.id} className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-300">{produto.nome} x{item.quantidade}</span>
                          <span className="text-white">R$ {(produto.preco * item.quantidade).toFixed(2)}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Total:</span>
                        <span className="text-green-400">R$ {calcularTotalVenda().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={processarVenda}
                  disabled={loading || !qrCodeConsumo || produtosSelecionados.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Finalizar Venda
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Produtos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {produtos.map((produto) => (
                    <div key={produto.id} className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{produto.nome}</h4>
                          <p className="text-gray-400 text-sm">{produto.categoria}</p>
                        </div>
                        <Badge variant="outline" className="text-gray-300">
                          {produto.estoque} un.
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-bold">R$ {produto.preco.toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => removerProduto(produto.id)}
                            variant="outline"
                            className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white min-w-[20px] text-center">
                            {produtosSelecionados.find(p => p.id === produto.id)?.quantidade || 0}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => adicionarProduto(produto.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Caixa */}
        <TabsContent value="caixa" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white">Resumo do Caixa</CardTitle>
                <CardDescription className="text-gray-400">
                  Movimentação financeira do dia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">R$ 2.450</p>
                    <p className="text-gray-400 text-sm">Entradas</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">R$ 1.680</p>
                    <p className="text-gray-400 text-sm">Saídas</p>
                  </div>
                </div>

                <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">R$ 770</p>
                  <p className="text-gray-400 text-sm">Saldo do Dia</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">PIX:</span>
                    <span className="text-white">R$ 1.850 (75%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cartão:</span>
                    <span className="text-white">R$ 450 (18%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dinheiro:</span>
                    <span className="text-white">R$ 150 (7%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transacoes.slice(0, 10).map((transacao) => (
                    <div key={transacao.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transacao.tipo === 'recarga' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {transacao.tipo === 'recarga' ? 
                            <Plus className="w-4 h-4 text-green-400" /> : 
                            <Minus className="w-4 h-4 text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{transacao.clienteNome}</p>
                          <p className="text-gray-400 text-xs">{transacao.descricao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transacao.tipo === 'recarga' ? 'text-green-400' : 'text-red-400'}`}>
                          {transacao.tipo === 'recarga' ? '+' : ''}R$ {Math.abs(transacao.valor).toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-xs">{new Date(transacao.data).toLocaleTimeString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Relatórios */}
        <TabsContent value="relatorios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Gerar Relatórios</CardTitle>
                <CardDescription className="text-gray-400">
                  Relatórios detalhados de vendas e operações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tipoRel" className="text-white">Tipo de Relatório</Label>
                  <select
                    id="tipoRel"
                    value={tipoRelatorio}
                    onChange={(e) => setTipoRelatorio(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                  >
                    <option value="vendas">📊 Relatório de Vendas</option>
                    <option value="financeiro">💰 Relatório Financeiro</option>
                    <option value="clientes">👥 Relatório de Clientes</option>
                    <option value="produtos">📦 Relatório de Produtos</option>
                    <option value="eventos">🎪 Relatório de Eventos</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="periodo" className="text-white">Período</Label>
                  <select
                    id="periodo"
                    value={periodoRelatorio}
                    onChange={(e) => setPeriodoRelatorio(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                  >
                    <option value="hoje">📅 Hoje</option>
                    <option value="semana">📅 Esta Semana</option>
                    <option value="mes">📅 Este Mês</option>
                    <option value="trimestre">📅 Trimestre</option>
                    <option value="ano">📅 Ano</option>
                    <option value="personalizado">📅 Período Personalizado</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={gerarRelatorio}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar PDF
                  </Button>
                  <Button 
                    onClick={gerarRelatorio}
                    variant="outline"
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>

                <Button 
                  onClick={() => alert('Relatório enviado por email!')}
                  variant="outline"
                  className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por Email
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Analytics em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-white">156</p>
                    <p className="text-gray-400 text-xs">Transações Hoje</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-white">R$ 18,50</p>
                    <p className="text-gray-400 text-xs">Ticket Médio</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Cerveja Heineken</span>
                      <span className="text-white">45 vendas</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Hambúrguer</span>
                      <span className="text-white">18 vendas</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Água Mineral</span>
                      <span className="text-white">67 vendas</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>
                </div>

                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Sistema operando normalmente. Todas as transações sendo processadas com sucesso.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperacoesSupremo;
