import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Monitor, 
  Smartphone, 
  Printer, 
  Wifi, 
  WifiOff,
  Settings,
  Plus,
  RefreshCw
} from 'lucide-react';

interface Equipamento {
  id: number;
  nome: string;
  tipo: string;
  status: string;
  localizacao: string;
  ip_address: string;
  ultimo_ping?: string;
}

const EquipamentosMEEP: React.FC = () => {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipamentos = async () => {
      try {
        const mockEquipamentos: Equipamento[] = [
          {
            id: 1,
            nome: 'QR Reader Principal',
            tipo: 'qr_reader',
            status: 'ativo',
            localizacao: 'Entrada Principal',
            ip_address: '192.168.1.10',
            ultimo_ping: '2 min atrás'
          },
          {
            id: 2,
            nome: 'Tablet Check-in A',
            tipo: 'tablet',
            status: 'ativo',
            localizacao: 'Portão A',
            ip_address: '192.168.1.11',
            ultimo_ping: '1 min atrás'
          },
          {
            id: 3,
            nome: 'Impressora Tickets',
            tipo: 'printer',
            status: 'manutencao',
            localizacao: 'Balcão Central',
            ip_address: '192.168.1.12',
            ultimo_ping: '15 min atrás'
          },
          {
            id: 4,
            nome: 'QR Reader Secundário',
            tipo: 'qr_reader',
            status: 'inativo',
            localizacao: 'Entrada VIP',
            ip_address: '192.168.1.13',
            ultimo_ping: '2 horas atrás'
          },
          {
            id: 5,
            nome: 'Tablet Check-in B',
            tipo: 'tablet',
            status: 'ativo',
            localizacao: 'Portão B',
            ip_address: '192.168.1.14',
            ultimo_ping: '30 seg atrás'
          }
        ];
        
        setEquipamentos(mockEquipamentos);
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipamentos();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'inativo':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'manutencao':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'qr_reader':
        return <Monitor className="w-5 h-5" />;
      case 'tablet':
        return <Smartphone className="w-5 h-5" />;
      case 'printer':
        return <Printer className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getTypeName = (tipo: string) => {
    switch (tipo) {
      case 'qr_reader':
        return 'Leitor QR';
      case 'tablet':
        return 'Tablet';
      case 'printer':
        return 'Impressora';
      default:
        return tipo;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-400" />
          <p className="text-sm text-gray-600">Carregando equipamentos...</p>
        </div>
      </div>
    );
  }

  const equipamentosAtivos = equipamentos.filter(eq => eq.status === 'ativo').length;
  const equipamentosInativos = equipamentos.filter(eq => eq.status === 'inativo').length;
  const equipamentosManutencao = equipamentos.filter(eq => eq.status === 'manutencao').length;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🔧 Equipamentos MEEP
          </h1>
          <p className="text-blue-200">
            Monitoramento e controle de equipamentos em tempo real
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Equipamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-green-400">
              <Wifi className="h-4 w-4 mr-2" />
              Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{equipamentosAtivos}</div>
            <div className="text-sm text-green-400 font-medium">Online e funcionando</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-red-400">
              <WifiOff className="h-4 w-4 mr-2" />
              Inativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{equipamentosInativos}</div>
            <div className="text-sm text-red-400 font-medium">Offline ou com problemas</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-yellow-400">
              <Settings className="h-4 w-4 mr-2" />
              Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{equipamentosManutencao}</div>
            <div className="text-sm text-yellow-400 font-medium">Em manutenção</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-blue-400">
              <Monitor className="h-4 w-4 mr-2" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{equipamentos.length}</div>
            <div className="text-sm text-blue-400 font-medium">Equipamentos cadastrados</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Monitor className="h-5 w-5 text-blue-400" />
            Lista de Equipamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {equipamentos.map((equipamento) => (
              <div
                key={equipamento.id}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-600/30 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                    {getTypeIcon(equipamento.tipo)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{equipamento.nome}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{getTypeName(equipamento.tipo)}</span>
                      <span>•</span>
                      <span>{equipamento.localizacao}</span>
                      <span>•</span>
                      <span>{equipamento.ip_address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge className={getStatusColor(equipamento.status)}>
                      {equipamento.status === 'ativo' && <Wifi className="w-3 h-3 mr-1" />}
                      {equipamento.status === 'inativo' && <WifiOff className="w-3 h-3 mr-1" />}
                      {equipamento.status === 'manutencao' && <Settings className="w-3 h-3 mr-1" />}
                      {equipamento.status.charAt(0).toUpperCase() + equipamento.status.slice(1)}
                    </Badge>
                    {equipamento.ultimo_ping && (
                      <div className="text-xs text-gray-400 mt-1">
                        Último ping: {equipamento.ultimo_ping}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipamentosMEEP;
