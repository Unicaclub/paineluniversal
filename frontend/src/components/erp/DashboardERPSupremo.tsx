import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { erpService } from '../../services/erpApi';
import FluxoCaixaWidget from './FluxoCaixaWidget';
import VendasWidget from './VendasWidget';
import EstoqueWidget from './EstoqueWidget';
import IntegracaoWidget from './IntegracaoWidget';
import AlertasWidget from './AlertasWidget';


interface KPICardProps {
  titulo: string;
  valor: string | number;
  variacao?: number;
  icone: string;
  cor: string;
  descricao?: string;
}

const KPICard: React.FC<KPICardProps> = ({ titulo, valor, variacao, icone, cor, descricao }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
      <div className={`text-2xl ${cor}`}>{icone}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{valor}</div>
      {variacao !== undefined && (
        <div className={`text-xs ${variacao >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
          {variacao >= 0 ? '↗️' : '↘️'} {Math.abs(variacao)}%
        </div>
      )}
      {descricao && <p className="text-xs text-muted-foreground mt-1">{descricao}</p>}
    </CardContent>
  </Card>
);

const DashboardERPSupremo: React.FC = () => {
  const [dados, setDados] = useState({
    kpis: {},
    fluxoCaixa: {},
    vendas: {},
    estoque: {},
    integracoes: {},
    alertas: []
  });
  
  const [filtros, setFiltros] = useState({
    periodo: '30d',
    filial: 'todas',
    comparativo: true
  });
  
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useWebSocket('/erp');

  const carregarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      
      const [
        kpis,
        fluxoCaixa,
        vendas,
        estoque,
        integracoes,
        alertas
      ] = await Promise.all([
        erpService.obterKPIsExecutivos(filtros),
        erpService.obterFluxoCaixaPreditivo(filtros),
        erpService.obterAnaliseVendas(filtros),
        erpService.obterAnaliseEstoque(filtros),
        erpService.obterStatusIntegracoes(),
        erpService.obterAlertas()
      ]);

      setDados({
        kpis: kpis.data,
        fluxoCaixa: fluxoCaixa.data,
        vendas: vendas.data,
        estoque: estoque.data,
        integracoes: integracoes.data,
        alertas: alertas.data
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    if (connected) {
      socket.on('kpis_atualizados', (novosKpis) => {
        setDados(prev => ({ ...prev, kpis: { ...prev.kpis, ...novosKpis } }));
      });

      socket.on('nova_venda', (venda) => {
        setDados(prev => ({
          ...prev,
          vendas: {
            ...prev.vendas,
            receitaHoje: prev.vendas.receitaHoje + venda.valor
          }
        }));
      });

      socket.on('estoque_atualizado', (produto) => {
        carregarDashboard();
      });

      socket.on('integracao_sincronizada', (integracao) => {
        setDados(prev => ({
          ...prev,
          integracoes: {
            ...prev.integracoes,
            [integracao.tipo]: {
              ...prev.integracoes[integracao.tipo],
              ultimaSync: integracao.ultimaSync,
              status: integracao.status
            }
          }
        }));
      });

      socket.on('novo_alerta', (alerta) => {
        setDados(prev => ({
          ...prev,
          alertas: [alerta, ...prev.alertas.slice(0, 9)]
        }));
      });
    }
  }, [connected, socket, carregarDashboard]);

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-2xl font-bold mt-4">Carregando ERP Supremo...</h2>
          <p className="text-gray-600">Processando dados com IA avançada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            🚀 ERP SUPREMO
          </h1>
          <p className="text-gray-600">Sistema Enterprise 1000x mais poderoso que o MEEP</p>
        </div>

        <div className="flex gap-4 items-center">
          <select 
            value={filtros.periodo}
            onChange={(e) => setFiltros(prev => ({ ...prev, periodo: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
            <option value="1y">1 ano</option>
          </select>

          <select 
            value={filtros.filial}
            onChange={(e) => setFiltros(prev => ({ ...prev, filial: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="todas">Todas as filiais</option>
            <option value="matriz">Matriz</option>
            <option value="filial1">Filial 1</option>
            <option value="filial2">Filial 2</option>
          </select>

          <button 
            onClick={carregarDashboard}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          titulo="Receita Total"
          valor={`R$ ${dados.kpis.receitaTotal?.toLocaleString() || '0'}`}
          variacao={dados.kpis.crescimentoReceita}
          icone="💰"
          cor="text-green-600"
          descricao="Receita acumulada no período"
        />
        
        <KPICard
          titulo="Margem de Lucro"
          valor={`${dados.kpis.margemLucro || 0}%`}
          variacao={dados.kpis.variacaoMargem}
          icone="📈"
          cor="text-blue-600"
          descricao="Margem líquida média"
        />
        
        <KPICard
          titulo="Fluxo de Caixa"
          valor={`R$ ${dados.kpis.fluxoCaixa?.toLocaleString() || '0'}`}
          variacao={dados.kpis.variacaoFluxo}
          icone="💳"
          cor="text-purple-600"
          descricao="Saldo projetado 30 dias"
        />
        
        <KPICard
          titulo="Score Geral"
          valor={dados.kpis.scoreGeral || 0}
          icone="⭐"
          cor="text-yellow-600"
          descricao="Performance geral da empresa"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FluxoCaixaWidget dados={dados.fluxoCaixa} />
        <VendasWidget dados={dados.vendas} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EstoqueWidget dados={dados.estoque} />
        <IntegracaoWidget dados={dados.integracoes} />
        <AlertasWidget alertas={dados.alertas} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧠 Insights de IA
            </CardTitle>
            <CardDescription>
              Análises preditivas e recomendações inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dados.kpis.insights?.map((insight: any, index: number) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${insight.tipo === 'oportunidade' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {insight.tipo}
                    </span>
                    <span className="font-medium">{insight.titulo}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{insight.descricao}</p>
                  {insight.acao && (
                    <p className="text-sm font-medium text-blue-600 mt-2">
                      💡 {insight.acao}
                    </p>
                  )}
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  Nenhum insight disponível no momento
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Previsões Estratégicas
            </CardTitle>
            <CardDescription>
              Projeções baseadas em machine learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Vendas Próximo Mês</p>
                  <p className="text-sm text-gray-600">Baseado em IA preditiva</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    R$ {dados.kpis.previsaoVendas?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dados.kpis.confiabilidadePrevisao || 0}% confiança
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">Risco de Inadimplência</p>
                  <p className="text-sm text-gray-600">Análise de crédito IA</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">
                    {dados.kpis.riscoInadimplencia || 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {dados.kpis.clientesRisco || 0} clientes em risco
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">Otimização de Estoque</p>
                  <p className="text-sm text-gray-600">Economia potencial</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">
                    R$ {dados.kpis.economiaPotencial?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dados.kpis.itensOtimizacao || 0} itens para otimizar
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardERPSupremo;
