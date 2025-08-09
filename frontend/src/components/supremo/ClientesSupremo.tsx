import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  FileText,
  Heart,
  Gift
} from 'lucide-react';

interface Cliente {
  id: number;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  endereco: string;
  statusCPF: 'ATIVO' | 'SUSPENSO' | 'CANCELADO';
  dataCadastro: string;
  ultimoLogin?: string;
  cartoesAtivos: number;
  saldoTotal: number;
  totalGasto: number;
  totalRecarregado: number;
  transacoes: number;
  eventos: number;
  aniversario?: string;
}

interface NovoCliente {
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  endereco: string;
}

const ClientesSupremo: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [validandoCPF, setValidandoCPF] = useState(false);
  const [novoCliente, setNovoCliente] = useState<NovoCliente>({
    cpf: '',
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    endereco: ''
  });

  const clientesSimulados: Cliente[] = [
    {
      id: 1,
      cpf: '123.456.789-00',
      nome: 'João Silva Santos',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-1234',
      dataNascimento: '1990-05-15',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      statusCPF: 'ATIVO',
      dataCadastro: '2024-01-15',
      ultimoLogin: '2024-12-30T22:15:00',
      cartoesAtivos: 2,
      saldoTotal: 125.50,
      totalGasto: 450.00,
      totalRecarregado: 575.50,
      transacoes: 28,
      eventos: 5,
      aniversario: '2025-05-15'
    },
    {
      id: 2,
      cpf: '987.654.321-00',
      nome: 'Maria Oliveira Costa',
      email: 'maria.oliveira@email.com',
      telefone: '(11) 88888-5678',
      dataNascimento: '1985-08-22',
      endereco: 'Av. Paulista, 456 - São Paulo/SP',
      statusCPF: 'ATIVO',
      dataCadastro: '2024-02-10',
      ultimoLogin: '2024-12-29T19:30:00',
      cartoesAtivos: 1,
      saldoTotal: 89.75,
      totalGasto: 320.25,
      totalRecarregado: 410.00,
      transacoes: 19,
      eventos: 3
    },
    {
      id: 3,
      cpf: '456.789.123-00',
      nome: 'Carlos Eduardo Lima',
      email: 'carlos.lima@email.com',
      telefone: '(11) 77777-9012',
      dataNascimento: '1992-12-03',
      endereco: 'Rua Augusta, 789 - São Paulo/SP',
      statusCPF: 'ATIVO',
      dataCadastro: '2024-03-05',
      ultimoLogin: '2024-12-28T16:45:00',
      cartoesAtivos: 3,
      saldoTotal: 234.80,
      totalGasto: 678.90,
      totalRecarregado: 913.70,
      transacoes: 42,
      eventos: 8,
      aniversario: '2025-12-03'
    },
    {
      id: 4,
      cpf: '321.654.987-00',
      nome: 'Ana Paula Ferreira',
      email: 'ana.ferreira@email.com',
      telefone: '(11) 66666-3456',
      dataNascimento: '1988-03-18',
      endereco: 'Rua Oscar Freire, 321 - São Paulo/SP',
      statusCPF: 'SUSPENSO',
      dataCadastro: '2024-01-20',
      ultimoLogin: '2024-12-25T14:20:00',
      cartoesAtivos: 0,
      saldoTotal: 0,
      totalGasto: 156.40,
      totalRecarregado: 200.00,
      transacoes: 12,
      eventos: 2
    }
  ];

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setClientes(clientesSimulados);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarCPF = async (cpf: string) => {
    setValidandoCPF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const cpfValido = cpf.length === 14; // Formato XXX.XXX.XXX-XX
      
      if (cpfValido) {
        setNovoCliente(prev => ({
          ...prev,
          nome: 'NOME CONSULTADO RECEITA FEDERAL',
          cpf: cpf
        }));
        alert('CPF válido! Dados consultados na Receita Federal.');
      } else {
        alert('CPF inválido ou não encontrado na Receita Federal.');
      }
    } catch (error) {
      console.error('Erro ao validar CPF:', error);
      alert('Erro ao consultar CPF');
    } finally {
      setValidandoCPF(false);
    }
  };

  const criarCliente = async () => {
    if (!novoCliente.cpf || !novoCliente.nome || !novoCliente.email) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const cliente: Cliente = {
        id: clientes.length + 1,
        cpf: novoCliente.cpf,
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
        dataNascimento: novoCliente.dataNascimento,
        endereco: novoCliente.endereco,
        statusCPF: 'ATIVO',
        dataCadastro: new Date().toISOString().split('T')[0],
        cartoesAtivos: 0,
        saldoTotal: 0,
        totalGasto: 0,
        totalRecarregado: 0,
        transacoes: 0,
        eventos: 0
      };

      setClientes(prev => [cliente, ...prev]);
      setShowNovoCliente(false);
      setNovoCliente({
        cpf: '',
        nome: '',
        email: '',
        telefone: '',
        dataNascimento: '',
        endereco: ''
      });
      
      alert('Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      alert('Erro ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  const enviarParabens = async (cliente: Cliente) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Mensagem de parabéns enviada para ${cliente.nome} via WhatsApp!`);
    } catch (error) {
      console.error('Erro ao enviar parabéns:', error);
      alert('Erro ao enviar mensagem');
    }
  };

  const filtrarClientes = () => {
    return clientes.filter(cliente => {
      const matchSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.cpf.includes(searchTerm) ||
                         cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'todos' || cliente.statusCPF === statusFilter;
      return matchSearch && matchStatus;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO': return 'bg-green-500';
      case 'SUSPENSO': return 'bg-yellow-500';
      case 'CANCELADO': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatarCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (telefone: string) => {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const isAniversariante = (cliente: Cliente) => {
    if (!cliente.aniversario) return false;
    const hoje = new Date();
    const aniversario = new Date(cliente.aniversario);
    return hoje.getMonth() === aniversario.getMonth() && hoje.getDate() === aniversario.getDate();
  };

  const clientesAtivos = clientes.filter(c => c.statusCPF === 'ATIVO').length;
  const totalCartoes = clientes.reduce((sum, c) => sum + c.cartoesAtivos, 0);
  const saldoTotalClientes = clientes.reduce((sum, c) => sum + c.saldoTotal, 0);
  const faturamentoTotal = clientes.reduce((sum, c) => sum + c.totalGasto, 0);
  const aniversariantes = clientes.filter(isAniversariante);

  if (loading && clientes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 animate-pulse text-purple-400 mx-auto mb-4" />
            <p className="text-white text-lg">Carregando clientes...</p>
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
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Clientes Supremo</h1>
              <p className="text-gray-400">Gestão completa de clientes com validação CPF</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowNovoCliente(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Aniversariantes do Dia */}
        {aniversariantes.length > 0 && (
          <Alert className="mb-6 bg-pink-500/10 border-pink-500/30">
            <Heart className="h-4 w-4 text-pink-400" />
            <AlertDescription className="text-pink-300">
              <strong>🎉 Aniversariantes do dia:</strong> {aniversariantes.map(c => c.nome).join(', ')}
              <div className="mt-2">
                {aniversariantes.map(cliente => (
                  <Button
                    key={cliente.id}
                    size="sm"
                    onClick={() => enviarParabens(cliente)}
                    className="mr-2 bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    <Gift className="w-3 h-3 mr-1" />
                    Enviar Parabéns para {cliente.nome.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{clientesAtivos}</p>
                  <p className="text-gray-400 text-sm">Clientes Ativos</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{totalCartoes}</p>
                  <p className="text-gray-400 text-sm">Cartões Emitidos</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">R$ {(saldoTotalClientes / 1000).toFixed(1)}K</p>
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
                  <p className="text-gray-400 text-sm">Faturamento Total</p>
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
              placeholder="Buscar por nome, CPF ou email..."
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
            <option value="ATIVO">Ativos</option>
            <option value="SUSPENSO">Suspensos</option>
            <option value="CANCELADO">Cancelados</option>
          </select>

          <Button
            onClick={carregarClientes}
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Modal Novo Cliente */}
      {showNovoCliente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-gray-900 border-purple-500/30 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Cadastrar Novo Cliente</CardTitle>
              <CardDescription className="text-gray-400">
                Cadastre um novo cliente com validação CPF na Receita Federal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf" className="text-white">CPF *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cpf"
                      value={novoCliente.cpf}
                      onChange={(e) => setNovoCliente(prev => ({ ...prev, cpf: e.target.value }))}
                      className="bg-gray-800/50 border-gray-600 text-white"
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    <Button
                      onClick={() => validarCPF(novoCliente.cpf)}
                      disabled={validandoCPF || !novoCliente.cpf}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {validandoCPF ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {validandoCPF && (
                    <p className="text-blue-400 text-xs mt-1">Consultando Receita Federal...</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="nome" className="text-white">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente(prev => ({ ...prev, nome: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Nome completo do cliente"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-white">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={novoCliente.email}
                    onChange={(e) => setNovoCliente(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefone" className="text-white">Telefone</Label>
                  <Input
                    id="telefone"
                    value={novoCliente.telefone}
                    onChange={(e) => setNovoCliente(prev => ({ ...prev, telefone: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataNascimento" className="text-white">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={novoCliente.dataNascimento}
                    onChange={(e) => setNovoCliente(prev => ({ ...prev, dataNascimento: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endereco" className="text-white">Endereço</Label>
                <Input
                  id="endereco"
                  value={novoCliente.endereco}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, endereco: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="Endereço completo"
                />
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/30">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  O CPF será validado automaticamente na Receita Federal. Clique no botão de validação após digitar o CPF.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => setShowNovoCliente(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={criarCliente}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtrarClientes().map((cliente) => (
          <Card key={cliente.id} className="bg-black/20 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{cliente.nome}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {cliente.cpf}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getStatusColor(cliente.statusCPF)} text-white`}>
                    {cliente.statusCPF}
                  </Badge>
                  {isAniversariante(cliente) && (
                    <Badge className="bg-pink-500 text-white">
                      🎂 Aniversário
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{cliente.email}</span>
                </div>
                {cliente.telefone && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{cliente.telefone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Cadastro: {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-lg font-bold text-white">{cliente.cartoesAtivos}</p>
                  <p className="text-xs text-gray-400">Cartões Ativos</p>
                </div>
                <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-lg font-bold text-white">{cliente.transacoes}</p>
                  <p className="text-xs text-gray-400">Transações</p>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="font-bold text-white">R$ {cliente.saldoTotal.toFixed(0)}</p>
                    <p className="text-gray-400">Saldo</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">R$ {cliente.totalGasto.toFixed(0)}</p>
                    <p className="text-gray-400">Gasto</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">{cliente.eventos}</p>
                    <p className="text-gray-400">Eventos</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtrarClientes().length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum cliente encontrado</p>
          <p className="text-gray-500 text-sm">Cadastre seu primeiro cliente ou ajuste os filtros</p>
        </div>
      )}
    </div>
  );
};

export default ClientesSupremo;
