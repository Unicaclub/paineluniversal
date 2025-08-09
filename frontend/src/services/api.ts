import axios from 'axios';

// Configuração da URL da API baseada no ambiente
const getApiBaseUrl = () => {
  // Detectar se está em produção
  const isProd = import.meta.env.PROD || window.location.hostname.includes('railway.app');
  
  if (isProd) {
    // 🔥 EM PRODUÇÃO: Usar URL completa do backend DIRETO
    console.log('🚀 Modo produção - URL backend direta (sem CORS via middleware)');
    return 'https://backend-painel-universal-production.up.railway.app';
  } else {
    // 🔧 EM DESENVOLVIMENTO: Usar localhost com middleware CORS
    console.log('🔧 Modo desenvolvimento - localhost com middleware CORS');
    return 'http://localhost:8000';
  }
};

const API_BASE_URL = getApiBaseUrl();

// Instância pública da API (sem autenticação automática)
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false, // Explicitamente desabilitar credentials
});

// Interceptor para API pública (apenas log de erros, sem redirect)
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🔥 Public API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      message: error.message,
      corsError: error.message?.includes('CORS') || error.message?.includes('Access-Control')
    });
    
    return Promise.reject(error);
  }
);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos timeout
  withCredentials: false, // Explicitamente desabilitar credentials
});

// 🔧 LOG DETALHADO PARA DEBUG
console.log('🔍 API Configuration:', {
  baseURL: API_BASE_URL,
  isProd: import.meta.env.PROD,
  hostname: window.location.hostname,
  origin: window.location.origin
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 🔍 LOG DA REQUISIÇÃO
  console.log('🚀 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    headers: config.headers
  });
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Interfaces
export interface LoginRequest {
  cpf: string;
  senha: string;
  codigo_verificacao?: string;
}

export interface Usuario {
  id?: number;
  cpf: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo: 'admin' | 'promoter' | 'cliente';
  ativo?: boolean;
  criado_em?: string;
  ultimo_login?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Empresa {
  id?: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone?: string;
  endereco?: string;
  ativa?: boolean;
}

export interface Evento {
  id?: number;
  nome: string;
  descricao?: string;
  data_evento: string;
  local: string;
  endereco?: string;
  limite_idade?: number;
  capacidade_maxima?: number;
  status?: string;
  empresa_id: number;
  criador_id?: number;
}

// Serviços de autenticação
export const authService = {
  async login(data: LoginRequest): Promise<Token> {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  async register(data: {
    cpf: string;
    nome: string;
    email: string;
    telefone?: string;
    senha: string;
    tipo?: 'admin' | 'promoter' | 'cliente';
  }): Promise<Usuario> {
    return publicService.register(data);
  },

  async getProfile(): Promise<Usuario> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
};

// Serviços de usuários
export const usuarioService = {
  async getAll(): Promise<Usuario[]> {
    const response = await api.get('/api/usuarios/');
    return response.data;
  },

  async getById(id: number): Promise<Usuario> {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data;
  },

  async create(usuarioData: any): Promise<Usuario> {
    const response = await api.post('/api/usuarios/', usuarioData);
    return response.data;
  },

  async update(id: number, usuarioData: any): Promise<Usuario> {
    const response = await api.put(`/api/usuarios/${id}`, usuarioData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}`);
  },

  async toggleStatus(id: number, ativo: boolean): Promise<Usuario> {
    const response = await api.patch(`/api/usuarios/${id}/status`, { ativo });
    return response.data;
  }
};

// Serviços de empresas
export const empresaService = {
  async getAll(): Promise<Empresa[]> {
    const response = await api.get('/api/empresas/');
    return response.data;
  },

  async getById(id: number): Promise<Empresa> {
    const response = await api.get(`/api/empresas/${id}`);
    return response.data;
  },

  async create(empresaData: Empresa): Promise<Empresa> {
    const response = await api.post('/api/empresas/', empresaData);
    return response.data;
  },

  async update(id: number, empresaData: Empresa): Promise<Empresa> {
    const response = await api.put(`/api/empresas/${id}`, empresaData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/empresas/${id}`);
  }
};

// Serviços de eventos
export const eventoService = {
  async getAll(): Promise<Evento[]> {
    const response = await api.get('/api/eventos/');
    return response.data;
  },

  async getById(id: number): Promise<Evento> {
    const response = await api.get(`/api/eventos/${id}`);
    return response.data;
  },

  async create(eventoData: Evento): Promise<Evento> {
    const response = await api.post('/api/eventos/', eventoData);
    return response.data;
  },

  async update(id: number, eventoData: Evento): Promise<Evento> {
    const response = await api.put(`/api/eventos/${id}`, eventoData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/eventos/${id}`);
  }
};

// Serviços de dashboard
export const dashboardService = {
  async getStats(): Promise<any> {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },

  async getEventosProximos(): Promise<any[]> {
    const response = await api.get('/api/dashboard/eventos-proximos');
    return response.data;
  },

  async getResumoFinanceiro(): Promise<any> {
    const response = await api.get('/api/dashboard/resumo-financeiro');
    return response.data;
  }
};

// Serviços de checkin
export const checkinService = {
  async checkinCPF(cpf: string, eventoId: number, validacaoCpf?: string): Promise<any> {
    const response = await api.post('/api/checkins/', {
      cpf: cpf.replace(/\D/g, ''),
      evento_id: eventoId,
      validacao_cpf: validacaoCpf
    });
    return response.data;
  },

  async getCheckins(eventoId: number): Promise<any[]> {
    const response = await api.get(`/api/checkins/evento/${eventoId}`);
    return response.data;
  }
};

// Serviços de listas
export const listaService = {
  async getAll(eventoId?: number): Promise<any[]> {
    const params = eventoId ? { evento_id: eventoId } : {};
    const response = await api.get('/api/listas/', { params });
    return response.data;
  },

  async create(listaData: any): Promise<any> {
    const response = await api.post('/api/listas/', listaData);
    return response.data;
  },

  async update(id: number, listaData: any): Promise<any> {
    const response = await api.put(`/api/listas/${id}`, listaData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/listas/${id}`);
  },

  async importarConvidados(listaId: number, convidados: any[]): Promise<any> {
    const response = await api.post(`/api/listas/${listaId}/convidados/import`, { convidados });
    return response.data;
  }
};

// Serviços de gamificação
export const gamificacaoService = {
  async obterRanking(filtros?: any): Promise<any[]> {
    const response = await api.get('/api/gamificacao/ranking', { params: filtros });
    return response.data;
  },

  async obterDashboard(eventoId?: number): Promise<any> {
    const response = await api.get('/api/gamificacao/dashboard', { 
      params: eventoId ? { evento_id: eventoId } : {} 
    });
    return response.data;
  },

  async criarConquista(conquista: any): Promise<any> {
    const response = await api.post('/api/gamificacao/conquistas', conquista);
    return response.data;
  },

  async verificarConquistas(promoterId: number): Promise<any> {
    const response = await api.post(`/api/gamificacao/verificar-conquistas/${promoterId}`);
    return response.data;
  }
};

// Serviços de financeiro
export const financeiroService = {
  async obterDashboard(eventoId?: number): Promise<any> {
    const params = eventoId ? { evento_id: eventoId } : {};
    const response = await api.get('/api/financeiro/dashboard', { params });
    return response.data;
  },

  async criarMovimentacao(movimentacao: any): Promise<any> {
    const response = await api.post('/api/financeiro/movimentacoes', movimentacao);
    return response.data;
  },

  async obterMovimentacoes(eventoId?: number): Promise<any[]> {
    const params = eventoId ? { evento_id: eventoId } : {};
    const response = await api.get('/api/financeiro/movimentacoes', { params });
    return response.data;
  }
};

// Serviços de transações
export const transacaoService = {
  async getAll(eventoId?: number): Promise<any[]> {
    const params = eventoId ? { evento_id: eventoId } : {};
    const response = await api.get('/api/transacoes/', { params });
    return response.data;
  },

  async getById(id: number): Promise<any> {
    const response = await api.get(`/api/transacoes/${id}`);
    return response.data;
  },

  async create(transacaoData: any): Promise<any> {
    const response = await api.post('/api/transacoes/', transacaoData);
    return response.data;
  },

  async update(id: number, transacaoData: any): Promise<any> {
    const response = await api.put(`/api/transacoes/${id}`, transacaoData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/transacoes/${id}`);
  },

  async confirmarPagamento(id: number): Promise<any> {
    const response = await api.patch(`/api/transacoes/${id}/confirmar`);
    return response.data;
  }
};

// Tipos para exportação
export interface Transacao {
  id?: number;
  evento_id: number;
  lista_id: number;
  usuario_id: number;
  valor: number;
  status: 'pendente' | 'aprovada' | 'cancelada';
  created_at?: string;
}

export interface Lista {
  id?: number;
  nome: string;
  tipo: string;
  preco: number;
  limite_vendas?: number;
  vendas_realizadas?: number;
  evento_id: number;
  ativa?: boolean;
}

// Serviços públicos (sem autenticação)
export const publicService = {
  async register(data: {
    cpf: string;
    nome: string;
    email: string;
    telefone?: string;
    senha: string;
    tipo?: 'admin' | 'promoter' | 'cliente';
  }): Promise<Usuario> {
    const userData = {
      ...data,
      tipo: data.tipo || 'cliente'
    };
    
    const response = await publicApi.post('/api/auth/register', userData);
    return response.data;
  },

  async setupInicial(): Promise<any> {
    const response = await publicApi.post('/setup-inicial');
    return response.data;
  },

  async healthCheck(): Promise<any> {
    const response = await publicApi.get('/healthz');
    return response.data;
  },

  // 🔧 TESTE DE CONECTIVIDADE
  async testConnection(): Promise<any> {
    console.log('🧪 Testando conectividade com backend...');
    try {
      const response = await publicApi.get('/api/cors-test', { timeout: 10000 });
      console.log('✅ Conectividade OK:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ Falha na conectividade:', error);
      return { 
        success: false, 
        error: error.message,
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          baseURL: error.config?.baseURL,
          url: error.config?.url
        }
      };
    }
  }
};

// Setup inicial do sistema (mantido para compatibilidade)
export const setupInicial = async (): Promise<any> => {
  return publicService.setupInicial();
};

// Serviços de PDV
export const pdvService = {
  async getAll(): Promise<any[]> {
    const response = await api.get('/api/pdv/');
    return response.data;
  },

  async getById(id: number): Promise<any> {
    const response = await api.get(`/api/pdv/${id}`);
    return response.data;
  },

  async create(pdvData: any): Promise<any> {
    const response = await api.post('/api/pdv/', pdvData);
    return response.data;
  },

  async update(id: number, pdvData: any): Promise<any> {
    const response = await api.put(`/api/pdv/${id}`, pdvData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/pdv/${id}`);
  },

  async registrarVenda(vendaData: any): Promise<any> {
    const response = await api.post('/api/pdv/vendas/', vendaData);
    return response.data;
  },

  async obterVendas(pdvId?: number): Promise<any[]> {
    const params = pdvId ? { pdv_id: pdvId } : {};
    const response = await api.get('/api/pdv/vendas/', { params });
    return response.data;
  },

  async obterDashboard(pdvId?: number): Promise<any> {
    const params = pdvId ? { pdv_id: pdvId } : {};
    const response = await api.get('/api/pdv/dashboard', { params });
    return response.data;
  }
};

export default api;
