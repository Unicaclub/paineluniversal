import axios from 'axios';

// Configuração da URL da API baseada no ambiente
const getApiBaseUrl = () => {
  // Detectar se está em produção pela URL ou variável de ambiente
  const hostname = window.location.hostname;
  const isProd = import.meta.env.PROD || 
                hostname.includes('railway.app') || 
                hostname.includes('netlify.app') ||
                hostname.includes('vercel.app');
  
  if (isProd) {
    // 🔥 EM PRODUÇÃO: URL completa do backend Railway
    console.log('🚀 PRODUÇÃO: URL backend Railway direta');
    return 'https://backend-painel-universal-production.up.railway.app';
  } else {
    // 🔧 EM DESENVOLVIMENTO: localhost
    console.log('🔧 DESENVOLVIMENTO: localhost');
    return 'http://localhost:8000';
  }
};

const API_BASE_URL = getApiBaseUrl();

// 🔧 DEBUG: Log da configuração da API
console.log('🔧 API Configuration:');
console.log('  - hostname:', window.location.hostname);
console.log('  - import.meta.env.PROD:', import.meta.env.PROD);
console.log('  - API_BASE_URL:', API_BASE_URL);
console.log('  - User Agent:', navigator.userAgent.slice(0, 50));

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
  (response) => {
    // Verificar se a resposta tem conteúdo válido
    if (response.config.responseType === 'json' || !response.config.responseType) {
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/json') && typeof response.data === 'string') {
        console.warn('⚠️ Resposta não é JSON válido, tentando corrigir');
        try {
          response.data = JSON.parse(response.data);
        } catch {
          response.data = { message: response.data };
        }
      }
    }
    return response;
  },
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
  (response) => {
    // Verificar se a resposta tem conteúdo válido
    if (response.config.responseType === 'json' || !response.config.responseType) {
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/json') && typeof response.data === 'string') {
        console.warn('⚠️ Resposta não é JSON válido, tentando corrigir');
        try {
          response.data = JSON.parse(response.data);
        } catch {
          response.data = { message: response.data };
        }
      }
    }
    return response;
  },
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
  empresa_id?: number;  // Agora opcional
  criador_id?: number;
}

export interface EventoCreate {
  nome: string;
  descricao?: string;
  data_evento: string;
  local: string;
  endereco?: string;
  limite_idade: number;
  capacidade_maxima?: number;
  empresa_id?: number;
}

// Serviços de autenticação
export const authService = {
  async login(data: LoginRequest): Promise<Token> {
    try {
      console.log('🔐 Fazendo login...', { cpf: data.cpf.slice(0, 3) + '***' });
      
      const response = await publicApi.post('/api/auth/login', data);
      
      console.log('📊 Resposta do login:', {
        status: response.status,
        hasData: !!response.data,
        dataType: typeof response.data,
        data: response.data
      });
      
      // Log mais detalhado da estrutura
      if (response.data) {
        console.log('🔍 Análise detalhada da resposta:', {
          keys: Object.keys(response.data),
          hasAccessToken: !!response.data.access_token,
          hasTokenType: !!response.data.token_type,
          hasUsuario: !!response.data.usuario,
          accessTokenType: typeof response.data.access_token,
          usuarioType: typeof response.data.usuario,
          usuarioKeys: response.data.usuario ? Object.keys(response.data.usuario) : 'N/A'
        });
      }
      
      // Verificar se a resposta tem o formato esperado
      if (response.status === 200 && response.data && typeof response.data === 'object') {
        if (response.data.access_token) {
          console.log('✅ Token encontrado!');
          
          // Verificar se tem usuário
          if (response.data.usuario) {
            console.log('✅ Usuário encontrado! Login bem-sucedido!');
            return response.data;
          } else {
            console.warn('⚠️ Token válido, mas usuário não encontrado na resposta');
            // Ainda assim retornar o token - o usuário pode ser buscado depois
            return response.data;
          }
        }
      }
      
      // Se chegou aqui, formato inesperado
      console.error('❌ Formato de resposta inesperado:', {
        status: response.status,
        data: response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'N/A'
      });
      throw new Error('Formato de resposta inválido do servidor');
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      // Verificar se é erro de rede/conexão
      if (!error.response) {
        throw new Error('Erro de conexão: Verifique sua internet');
      }
      
      // Verificar status codes específicos
      if (error.response.status === 401) {
        throw new Error('CPF ou senha incorretos');
      } else if (error.response.status === 400) {
        const detail = error.response.data?.detail || 'Dados inválidos';
        throw new Error(detail);
      } else if (error.response.status >= 500) {
        throw new Error('Erro no servidor. Tente novamente.');
      }
      
      // Erro genérico
      const message = error.response.data?.detail || error.message || 'Erro desconhecido';
      throw new Error(message);
    }
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
  },

  async listarPromoters(): Promise<Usuario[]> {
    const response = await api.get('/api/usuarios/');
    return response.data.filter((usuario: Usuario) => usuario.tipo === 'promoter');
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

  async create(eventoData: EventoCreate): Promise<Evento> {
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
    const response = await api.get('/api/dashboard/resumo');
    return response.data;
  },

  async getEventosProximos(): Promise<any[]> {
    const response = await api.get('/api/eventos/');
    return response.data;
  },

  async getResumoFinanceiro(): Promise<any> {
    const response = await api.get('/api/dashboard/avancado');
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

// Interfaces para produtos
export interface Categoria {
  id?: number;
  nome: string;
  descricao?: string;
  cor?: string;
  ativo?: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface CategoriaCreate {
  nome: string;
  descricao?: string;
  cor?: string;
  evento_id?: number;
}

export interface Produto {
  id?: number;
  nome: string;
  descricao?: string;
  tipo: 'BEBIDA' | 'COMIDA' | 'INGRESSO' | 'FICHA' | 'COMBO' | 'VOUCHER';
  valor: number; // Manter consistente com types/produto.ts
  codigo?: string; // Manter consistente com types/produto.ts
  categoria_id?: number;
  categoria?: Categoria;
  codigo_barras?: string;
  estoque_atual?: number;
  destaque?: boolean;
  habilitado?: boolean;
  promocional?: boolean;
  ativo?: boolean;
  created_at?: Date;
  updated_at?: Date;
  // Campos adicionais
  marca?: string;
  fornecedor?: string;
  preco_custo?: number;
  margem_lucro?: number;
  unidade_medida?: string;
  volume?: number;
  teor_alcoolico?: number;
  temperatura_ideal?: string;
  validade_dias?: number;
  ncm?: string;
  cfop?: string;
  cest?: string;
  icms?: number;
  ipi?: number;
  observacoes?: string;
  imagem_url?: string;
  evento_id?: number;
  empresa_id?: number;
}

export interface ProdutoCreate {
  nome: string;
  descricao?: string;
  tipo: 'BEBIDA' | 'COMIDA' | 'INGRESSO' | 'FICHA' | 'COMBO' | 'VOUCHER';
  preco: number; // API espera 'preco'
  evento_id: number;
  categoria_id?: number;
  codigo_interno?: string; // API espera 'codigo_interno'
  codigo_barras?: string;
  estoque_atual?: number;
  destaque?: boolean;
  promocional?: boolean;
  // Campos adicionais
  marca?: string;
  fornecedor?: string;
  preco_custo?: number;
  margem_lucro?: number;
  unidade_medida?: string;
  volume?: number;
  teor_alcoolico?: number;
  temperatura_ideal?: string;
  validade_dias?: number;
  ncm?: string;
  cfop?: string;
  cest?: string;
  icms?: number;
  ipi?: number;
  observacoes?: string;
}

// Serviços de categorias
export const categoriaService = {
  async getAll(eventoId?: number): Promise<Categoria[]> {
    const params = eventoId ? { evento_id: eventoId } : {};
    const response = await api.get('/api/produtos/categorias/', { params });
    return response.data.categorias || response.data;
  },

  async getById(id: number): Promise<Categoria> {
    const response = await api.get(`/api/produtos/categorias/${id}`);
    return response.data;
  },

  async create(categoriaData: CategoriaCreate): Promise<Categoria> {
    // Garantir que evento_id está presente
    if (!categoriaData.evento_id) {
      const eventoId = localStorage.getItem('evento_id');
      if (eventoId) {
        categoriaData.evento_id = parseInt(eventoId);
      } else {
        throw new Error('ID do evento é obrigatório para criar categoria');
      }
    }
    
    const response = await api.post('/api/produtos/categorias/', categoriaData);
    return response.data;
  },

  async update(id: number, categoriaData: Partial<CategoriaCreate>): Promise<Categoria> {
    const response = await api.put(`/api/produtos/categorias/${id}`, categoriaData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/produtos/categorias/${id}`);
  }
};

// Serviços de produtos
export const produtoService = {
  async getAll(eventoId?: number): Promise<Produto[]> {
    const params = eventoId ? { evento_id: eventoId } : {};
    const response = await api.get('/api/produtos/', { params });
    
    // A API retorna { produtos: [], total: 0, ... } mas precisa retornar Produto[]
    const produtosApi = response.data.produtos || response.data;
    
    // Transformar dados da API para o formato frontend
    return produtosApi.map((produto: any) => ({
      id: produto.id?.toString() || '',
      nome: produto.nome,
      codigo: produto.codigo_interno || produto.codigo || '',
      tipo: produto.tipo,
      categoria_id: produto.categoria_id?.toString() || '',
      categoria: produto.categoria_produto ? {
        id: produto.categoria_produto.id?.toString(),
        nome: produto.categoria_produto.nome,
        mostrar_dashboard: true,
        mostrar_pos: true,
        ordem: 1,
        created_at: new Date(),
        updated_at: new Date()
      } : undefined,
      ncm: produto.ncm || '',
      cfop: produto.cfop || '',
      cest: produto.cest || '',
      valor: produto.preco || produto.valor || 0,
      destaque: produto.destaque || false,
      habilitado: produto.status === 'ATIVO',
      descricao: produto.descricao || '',
      estoque: produto.estoque_atual || 0,
      promocional: produto.promocional || false,
      marca: produto.marca,
      fornecedor: produto.fornecedor,
      preco_custo: produto.preco_custo,
      margem_lucro: produto.margem_lucro,
      unidade_medida: produto.unidade_medida,
      volume: produto.volume,
      teor_alcoolico: produto.teor_alcoolico,
      temperatura_ideal: produto.temperatura_ideal,
      validade_dias: produto.validade_dias,
      icms: produto.icms,
      ipi: produto.ipi,
      observacoes: produto.observacoes,
      created_at: produto.criado_em ? new Date(produto.criado_em) : new Date(),
      updated_at: produto.atualizado_em ? new Date(produto.atualizado_em) : new Date()
    }));
  },

  async getById(id: number): Promise<Produto> {
    const response = await api.get(`/api/produtos/${id}`);
    const produto = response.data;
    
    // Transformar dados da API para o formato frontend
    return {
      id: produto.id?.toString() || '',
      nome: produto.nome,
      codigo: produto.codigo_interno || produto.codigo || '',
      tipo: produto.tipo,
      categoria_id: produto.categoria_id?.toString() || '',
      valor: produto.preco || produto.valor || 0,
      destaque: produto.destaque || false,
      habilitado: produto.status === 'ATIVO',
      descricao: produto.descricao || '',
      promocional: produto.promocional || false,
      created_at: produto.criado_em ? new Date(produto.criado_em) : new Date(),
      updated_at: produto.atualizado_em ? new Date(produto.atualizado_em) : new Date()
    };
  },

  async create(produtoData: ProdutoCreate): Promise<Produto> {
    // Garantir que evento_id está presente
    if (!produtoData.evento_id) {
      // Tentar obter o evento_id do localStorage ou context
      const eventoId = localStorage.getItem('evento_id');
      if (eventoId) {
        produtoData.evento_id = parseInt(eventoId);
      } else {
        throw new Error('ID do evento é obrigatório para criar produto');
      }
    }
    
    const response = await api.post('/api/produtos/', produtoData);
    return response.data;
  },

  async update(id: number, produtoData: Partial<ProdutoCreate>): Promise<Produto> {
    const response = await api.put(`/api/produtos/${id}`, produtoData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/produtos/${id}`);
  },

  async getByCodigo(codigo: string): Promise<Produto> {
    const response = await api.get(`/api/produtos/codigo/${codigo}`);
    return response.data;
  }
};

export default api;
