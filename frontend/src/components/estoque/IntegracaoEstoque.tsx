import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { 
  Link, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Settings,
  Zap,
  Database,
  Cloud,
  Smartphone
} from 'lucide-react';

interface IntegracaoItem {
  id: number;
  nome: string;
  categoria: string;
  status: string;
  ativo: boolean;
  ultima_sync: string;
  registros_sync: number;
  erro_count: number;
  descricao: string;
  icone: string;
}

const IntegracaoEstoque: React.FC = () => {
  const [integracoes, setIntegracoes] = useState<IntegracaoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockIntegracoes: IntegracaoItem[] = [
      {
        id: 1,
        nome: 'SAP Business One',
        categoria: 'ERP',
        status: 'Conectado',
        ativo: true,
        ultima_sync: '2025-08-09 14:30',
        registros_sync: 1247,
        erro_count: 0,
        descricao: 'Sincronização completa de produtos, estoque e movimentações',
        icone: '🏢'
      },
      {
        id: 2,
        nome: 'Conta Azul',
        categoria: 'Contábil',
        status: 'Conectado',
        ativo: true,
        ultima_sync: '2025-08-09 14:25',
        registros_sync: 856,
        erro_count: 0,
        descricao: 'Integração fiscal e contábil automática',
        icone: '📊'
      },
      {
        id: 3,
        nome: 'TOTVS Protheus',
        categoria: 'ERP',
        status: 'Erro',
        ativo: false,
        ultima_sync: '2025-08-09 12:15',
        registros_sync: 0,
        erro_count: 3,
        descricao: 'Falha na autenticação - verificar credenciais',
        icone: '⚠️'
      },
      {
        id: 4,
        nome: 'Omie',
        categoria: 'Gestão',
        status: 'Sincronizando',
        ativo: true,
        ultima_sync: '2025-08-09 14:32',
        registros_sync: 423,
        erro_count: 0,
        descricao: 'Sincronização em andamento...',
        icone: '🔄'
      },
      {
        id: 5,
        nome: 'WhatsApp Business',
        categoria: 'Comunicação',
        status: 'Conectado',
        ativo: true,
        ultima_sync: '2025-08-09 14:35',
        registros_sync: 89,
        erro_count: 0,
        descricao: 'Notificações automáticas de estoque',
        icone: '📱'
      },
      {
        id: 6,
        nome: 'Oracle NetSuite',
        categoria: 'ERP',
        status: 'Desconectado',
        ativo: false,
        ultima_sync: '2025-08-08 18:00',
        registros_sync: 0,
        erro_count: 0,
        descricao: 'Integração desabilitada pelo usuário',
        icone: '🔌'
      }
    ];
    
    setIntegracoes(mockIntegracoes);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    const cores = {
      'Conectado': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Sincronizando': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Erro': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Desconectado': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return cores[status as keyof typeof cores] || cores['Desconectado'];
  };

  const getCategoriaColor = (categoria: string) => {
    const cores = {
      'ERP': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Contábil': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Gestão': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Comunicação': 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    };
    return cores[categoria as keyof typeof cores] || cores['Gestão'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Conectado':
        return <CheckCircle className="w-4 h-4" />;
      case 'Sincronizando':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'Erro':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Link className="w-4 h-4" />;
    }
  };

  const toggleIntegracao = (id: number) => {
    setIntegracoes(prev => 
      prev.map(integracao => 
        integracao.id === id 
          ? { 
              ...integracao, 
              ativo: !integracao.ativo,
              status: !integracao.ativo ? 'Conectado' : 'Desconectado'
            }
          : integracao
      )
    );
  };

  const sincronizarTodas = () => {
    alert('🔄 Sincronização iniciada para todas as integrações ativas!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Link className="animate-pulse h-8 w-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Carregando integrações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 min-h-screen">
      <div className="glass-card p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🔗 Integração Enterprise
            </h1>
            <p className="text-cyan-200">
              20+ Sistemas • APIs REST/GraphQL • Sincronização Tempo Real
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={sincronizarTodas}
              className="bg-cyan-600/20 hover:bg-cyan-600/30 text-white border border-cyan-500/30"
            >
              <Zap className="w-4 h-4 mr-2" />
              Sincronizar Todas
            </Button>
            <Button className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-2xl font-bold text-green-300 mb-1">6</div>
            <div className="text-sm text-gray-400">Integrações Ativas</div>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-300 mb-1">2.6K</div>
            <div className="text-sm text-gray-400">Registros Sincronizados</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-300 mb-1">99.8%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <div className="text-2xl font-bold text-orange-300 mb-1">1.2s</div>
            <div className="text-sm text-gray-400">Latência Média</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {integracoes.map((integracao) => (
          <Card key={integracao.id} className="glass-card border-white/20 card-hover">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integracao.icone}</span>
                  <div>
                    <CardTitle className="text-white text-lg">{integracao.nome}</CardTitle>
                    <Badge className={getCategoriaColor(integracao.categoria)}>
                      {integracao.categoria}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusColor(integracao.status)}>
                    {getStatusIcon(integracao.status)}
                    <span className="ml-1">{integracao.status}</span>
                  </Badge>
                  <Switch
                    checked={integracao.ativo}
                    onCheckedChange={() => toggleIntegracao(integracao.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">{integracao.descricao}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Última Sync</p>
                  <p className="text-white text-sm">{integracao.ultima_sync}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Registros</p>
                  <p className="text-cyan-400 font-bold text-lg">{integracao.registros_sync}</p>
                </div>
              </div>

              {integracao.erro_count > 0 && (
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-300 text-sm font-semibold">
                      {integracao.erro_count} erro(s) detectado(s)
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30">
                  <Settings className="w-3 h-3 mr-1" />
                  Configurar
                </Button>
                <Button size="sm" className="bg-green-600/20 hover:bg-green-600/30 text-white border border-green-500/30">
                  <Zap className="w-3 h-3" />
                </Button>
                <Button size="sm" className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30">
                  <Database className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Cloud className="h-5 w-5 text-cyan-400" />
              Integrações Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏢</span>
                    <div>
                      <div className="text-white font-semibold">Microsoft Dynamics</div>
                      <div className="text-gray-400 text-sm">ERP Enterprise</div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-cyan-600/20 hover:bg-cyan-600/30 text-white border border-cyan-500/30">
                    Conectar
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <div className="text-white font-semibold">Bling</div>
                      <div className="text-gray-400 text-sm">Gestão Comercial</div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-cyan-600/20 hover:bg-cyan-600/30 text-white border border-cyan-500/30">
                    Conectar
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚚</span>
                    <div>
                      <div className="text-white font-semibold">Correios API</div>
                      <div className="text-gray-400 text-sm">Logística</div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-cyan-600/20 hover:bg-cyan-600/30 text-white border border-cyan-500/30">
                    Conectar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Smartphone className="h-5 w-5 text-purple-400" />
              APIs e Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 font-semibold">REST API v2.0</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  API completa para integração com sistemas externos
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Ativa
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    Rate Limit: 1000/min
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-semibold">GraphQL Endpoint</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  Consultas flexíveis e eficientes
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Ativa
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Schema v1.2
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 font-semibold">Webhooks</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  Notificações em tempo real
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    12 Ativos
                  </Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    99.9% Uptime
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegracaoEstoque;
