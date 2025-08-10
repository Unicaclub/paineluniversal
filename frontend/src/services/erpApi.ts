import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const MEEP_API_URL = process.env.REACT_APP_MEEP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const meepApi = axios.create({
  baseURL: MEEP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

meepApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const erpService = {
  async obterKPIsExecutivos(filtros: any) {
    const response = await meepApi.get('/api/erp/dashboard/1', { params: filtros });
    return response.data;
  },

  async obterFluxoCaixaPreditivo(filtros: any) {
    const response = await meepApi.get('/api/erp/fluxo-caixa/1', { params: filtros });
    return response.data;
  },

  async obterAnaliseVendas(filtros: any) {
    const response = await meepApi.get('/api/erp/analise-vendas/1', { params: filtros });
    return response.data;
  },

  async obterAnaliseEstoque(filtros: any) {
    const response = await api.get('/api/erp-supremo/classificacao-abc-xyz', { params: filtros });
    return response.data;
  },

  async obterStatusIntegracoes() {
    const response = await api.get('/api/erp-supremo/conectores-nativos');
    return response.data;
  },

  async obterAlertas() {
    const response = await api.get('/api/erp-supremo/predicoes-insights');
    return response.data;
  },

  async gerarFluxoCaixaPreditivo(empresaId: number, diasProjecao: number = 90) {
    const response = await api.post('/api/erp-supremo/fluxo-caixa-preditivo', {
      empresaId,
      diasProjecao
    });
    return response.data;
  },

  async executarConciliacaoBancaria(empresaId: number, bancoContaId: number, periodo: any) {
    const response = await meepApi.post('/api/erp/conciliacao-bancaria', {
      empresaId,
      bancoContaId,
      periodo
    });
    return response.data;
  },

  async obterPrevisaoDemanda(produtoId: number, diasPrevisao: number = 60) {
    const response = await meepApi.get(`/api/erp/previsao-demanda/${produtoId}`, {
      params: { diasPrevisao }
    });
    return response.data;
  },

  async analisarCliente360(clienteId: number) {
    const response = await meepApi.get(`/api/erp/cliente-360/${clienteId}`);
    return response.data;
  },

  async configurarIntegracao(empresaId: number, tipoIntegracao: string, configuracao: any) {
    const response = await meepApi.post('/api/erp/integracoes/configurar', {
      empresaId,
      tipoIntegracao,
      configuracao
    });
    return response.data;
  },

  async sincronizarIntegracao(integracaoId: number) {
    const response = await meepApi.post(`/api/erp/integracoes/${integracaoId}/sincronizar`);
    return response.data;
  },

  async calcularScoreCredito(dadosCliente: any) {
    const response = await meepApi.post('/api/erp/ia/score-credito', { dadosCliente });
    return response.data;
  },

  async detectarFraudes(transacao: any) {
    const response = await meepApi.post('/api/erp/ia/deteccao-fraude', { transacao });
    return response.data;
  },

  async otimizarPrecos(dados: any) {
    const response = await meepApi.post('/api/erp/ia/otimizacao-precos', dados);
    return response.data;
  },

  async preverVendas(dados: any) {
    const response = await meepApi.post('/api/erp/ia/previsao-vendas', dados);
    return response.data;
  },

  async obterDashboardExecutivo(empresaId: number, periodo: number = 30) {
    const response = await meepApi.get(`/api/erp/dashboard/${empresaId}`, {
      params: { periodo }
    });
    return response.data;
  },

  async obterPlanoContasIA(empresaId: number) {
    const response = await api.get('/api/erp-supremo/plano-contas-ia', {
      params: { empresaId }
    });
    return response.data;
  },

  async criarContaIA(dados: any) {
    const response = await api.post('/api/erp-supremo/plano-contas-ia', dados);
    return response.data;
  },

  async obterDREAutomatico(empresaId: number, periodo: any) {
    const response = await api.get('/api/erp-supremo/dre-automatico', {
      params: { empresaId, ...periodo }
    });
    return response.data;
  },

  async executarInventarioIA(filialId: number, configuracao: any) {
    const response = await meepApi.post('/api/erp/inventario-ia', {
      filialId,
      configuracao
    });
    return response.data;
  }
};

export default erpService;
