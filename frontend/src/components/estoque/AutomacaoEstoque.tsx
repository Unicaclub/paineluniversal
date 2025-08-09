import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { 
  Zap, 
  Brain, 
  Settings, 
  Bell, 
  TrendingUp, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface AutomacaoConfig {
  reposicao_automatica: boolean;
  alertas_inteligentes: boolean;
  previsao_demanda: boolean;
  otimizacao_estoque: boolean;
  notificacoes_whatsapp: boolean;
  integracao_erp: boolean;
}

interface ReposicaoSugerida {
  id: number;
  produto_nome: string;
  quantidade_atual: number;
  quantidade_sugerida: number;
  fornecedor: string;
  prazo_entrega: number;
  economia_estimada: number;
  confianca_ia: number;
}

const AutomacaoEstoque: React.FC = () => {
  const [config, setConfig] = useState<AutomacaoConfig>({
    reposicao_automatica: true,
    alertas_inteligentes: true,
    previsao_demanda: true,
    otimizacao_estoque: false,
    notificacoes_whatsapp: true,
    integracao_erp: false
  });

  const [reposicoesSugeridas, setReposicoesSugeridas] = useState<ReposicaoSugerida[]>([]);
  const [processandoIA, setProcessandoIA] = useState(false);

  useEffect(() => {
    const mockReposicoes: ReposicaoSugerida[] = [
      {
        id: 1,
        produto_nome: 'Cerveja Heineken 350ml',
        quantidade_atual: 15,
        quantidade_sugerida: 120,
        fornecedor: 'Distribuidora Premium',
        prazo_entrega: 3,
        economia_estimada: 450.00,
        confianca_ia: 94.2
      },
      {
        id: 2,
        produto_nome: 'Água Mineral 500ml',
        quantidade_atual: 8,
        quantidade_sugerida: 200,
        fornecedor: 'Águas do Brasil',
        prazo_entrega: 2,
        economia_estimada: 180.00,
        confianca_ia: 91.8
      }
    ];
    
    setReposicoesSugeridas(mockReposicoes);
  }, []);

  const handleConfigChange = (key: keyof AutomacaoConfig, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const processarReposicaoIA = async () => {
    setProcessandoIA(true);
    
    setTimeout(() => {
      setProcessandoIA(false);
      alert('✅ Reposição automática processada! 3 pedidos criados com economia de R$ 1.250,00');
    }, 3000);
  };

  const aprovarReposicao = (id: number) => {
    setReposicoesSugeridas(prev => 
      prev.filter(r => r.id !== id)
    );
    alert('✅ Reposição aprovada e pedido enviado ao fornecedor!');
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
      <div className="glass-card p-6 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🤖 Automação Inteligente
            </h1>
            <p className="text-purple-200">
              IA Avançada • Reposição Automática • Economia 35% Custos
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Brain className="w-4 h-4 mr-1" />
              IA Ativa
            </Badge>
            <Button 
              onClick={processarReposicaoIA}
              disabled={processandoIA}
              className="bg-purple-600/20 hover:bg-purple-600/30 text-white border border-purple-500/30"
            >
              {processandoIA ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {processandoIA ? 'Processando IA...' : 'Executar IA Completa'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5 text-blue-400" />
              Configurações de Automação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-semibold text-white">Reposição Automática</h3>
                  <p className="text-sm text-gray-400">IA calcula e cria pedidos automaticamente</p>
                </div>
                <Switch
                  checked={config.reposicao_automatica}
                  onCheckedChange={(value) => handleConfigChange('reposicao_automatica', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-semibold text-white">Alertas Inteligentes</h3>
                  <p className="text-sm text-gray-400">Notificações preditivas baseadas em IA</p>
                </div>
                <Switch
                  checked={config.alertas_inteligentes}
                  onCheckedChange={(value) => handleConfigChange('alertas_inteligentes', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-semibold text-white">Previsão de Demanda</h3>
                  <p className="text-sm text-gray-400">ML para prever vendas futuras (94% precisão)</p>
                </div>
                <Switch
                  checked={config.previsao_demanda}
                  onCheckedChange={(value) => handleConfigChange('previsao_demanda', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-semibold text-white">Otimização de Estoque</h3>
                  <p className="text-sm text-gray-400">Algoritmos para minimizar custos</p>
                </div>
                <Switch
                  checked={config.otimizacao_estoque}
                  onCheckedChange={(value) => handleConfigChange('otimizacao_estoque', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-semibold text-white">Notificações WhatsApp</h3>
                  <p className="text-sm text-gray-400">Alertas automáticos via WhatsApp Business</p>
                </div>
                <Switch
                  checked={config.notificacoes_whatsapp}
                  onCheckedChange={(value) => handleConfigChange('notificacoes_whatsapp', value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-semibold text-white">Integração ERP</h3>
                  <p className="text-sm text-gray-400">Sincronização automática com sistemas ERP</p>
                </div>
                <Switch
                  checked={config.integracao_erp}
                  onCheckedChange={(value) => handleConfigChange('integracao_erp', value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Métricas de Performance IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="text-2xl font-bold text-green-300">94.2%</div>
                <div className="text-sm text-gray-400">Precisão Previsões</div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-300">35%</div>
                <div className="text-sm text-gray-400">Redução Custos</div>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-300">89%</div>
                <div className="text-sm text-gray-400">Menos Rupturas</div>
              </div>
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <div className="text-2xl font-bold text-orange-300">2.1s</div>
                <div className="text-sm text-gray-400">Tempo Resposta</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-white">Últimas Execuções IA</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div className="flex-1">
                    <div className="text-sm text-white">Análise ABC Automática</div>
                    <div className="text-xs text-gray-400">Há 15 minutos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div className="flex-1">
                    <div className="text-sm text-white">Previsão Demanda 7 dias</div>
                    <div className="text-xs text-gray-400">Há 32 minutos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1">
                    <div className="text-sm text-white">Otimização Estoque</div>
                    <div className="text-xs text-gray-400">Em processamento...</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            Reposições Sugeridas pela IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reposicoesSugeridas.map((reposicao) => (
              <div key={reposicao.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{reposicao.produto_nome}</h3>
                    <p className="text-sm text-gray-400">Fornecedor: {reposicao.fornecedor}</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {reposicao.confianca_ia}% confiança
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400">Estoque Atual</div>
                    <div className="text-lg font-bold text-red-300">{reposicao.quantidade_atual}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Quantidade Sugerida</div>
                    <div className="text-lg font-bold text-green-300">{reposicao.quantidade_sugerida}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Prazo Entrega</div>
                    <div className="text-lg font-bold text-blue-300">{reposicao.prazo_entrega} dias</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Economia Estimada</div>
                    <div className="text-lg font-bold text-yellow-300">R$ {reposicao.economia_estimada.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => aprovarReposicao(reposicao.id)}
                    className="bg-green-600/20 hover:bg-green-600/30 text-white border border-green-500/30"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar Reposição
                  </Button>
                  <Button className="bg-gray-600/20 hover:bg-gray-600/30 text-white border border-gray-500/30">
                    Ajustar Quantidade
                  </Button>
                  <Button className="bg-red-600/20 hover:bg-red-600/30 text-white border border-red-500/30">
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {reposicoesSugeridas.length === 0 && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma reposição pendente</h3>
              <p className="text-gray-400">A IA está monitorando continuamente e sugerirá reposições quando necessário</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomacaoEstoque;
