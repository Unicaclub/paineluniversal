// Tipos de autenticação
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

// Tipos de empresa
export interface Empresa {
  id?: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone?: string;
  endereco?: string;
  ativa?: boolean;
}

// Tipos de evento
export interface Evento {
  id?: number;
  nome: string;
  descricao?: string;
  data_evento: string;
  local: string;
  endereco?: string;
  limite_idade?: number;
  capacidade_maxima?: number;
  status?: 'PLANEJADO' | 'ATIVO' | 'FINALIZADO' | 'CANCELADO';
  empresa_id?: number;
  criador_id?: number;
  criado_em?: string;
  atualizado_em?: string;
}

export interface EventoCreate {
  nome: string;
  descricao?: string;
  data_evento: string;
  local: string;
  endereco?: string;
  limite_idade?: number;
  capacidade_maxima?: number;
  empresa_id?: number;
}

// Tipos de produto
export interface Produto {
  id?: number;
  nome: string;
  codigo?: string;
  categoria?: string;
  tipo?: 'BEBIDA' | 'COMIDA' | 'INGRESSO' | 'FICHA' | 'COMBO' | 'VOUCHER';
  valor?: number;
  descricao?: string;
  estoque?: number;
  estoque_minimo?: number;
  estoque_maximo?: number;
  controla_estoque?: boolean;
  status?: 'ATIVO' | 'INATIVO' | 'ESGOTADO';
  imagem_url?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ProdutoFormData {
  nome: string;
  codigo_interno?: string;
  categoria: string;
  tipo: 'BEBIDA' | 'COMIDA' | 'INGRESSO' | 'FICHA' | 'COMBO' | 'VOUCHER';
  preco: number;
  descricao?: string;
  estoque_atual?: number;
  estoque_minimo?: number;
  estoque_maximo?: number;
  controla_estoque?: boolean;
  status?: 'ATIVO' | 'INATIVO' | 'ESGOTADO';
  imagem_url?: string;
}

// Tipos de venda
export interface Venda {
  id?: number;
  evento_id: number;
  produto_id: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  desconto?: number;
  metodo_pagamento: 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO';
  status: 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
  vendedor_id?: number;
  cliente_cpf?: string;
  observacoes?: string;
  criado_em?: string;
}

export interface VendaCreate {
  evento_id: number;
  items: {
    produto_id: number;
    quantidade: number;
    valor_unitario: number;
  }[];
  metodo_pagamento: 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO';
  desconto?: number;
  cliente_cpf?: string;
  observacoes?: string;
}

// Tipos de check-in
export interface Checkin {
  id?: number;
  evento_id: number;
  cpf: string;
  nome?: string;
  data_checkin: string;
  validacao_cpf?: string;
  origem?: string;
  criado_em?: string;
}

export interface CheckinRequest {
  cpf: string;
  evento_id: number;
  validacao_cpf?: string;
}

// Tipos de lista
export interface Lista {
  id?: number;
  nome: string;
  tipo: string;
  preco: number;
  limite_vendas?: number;
  vendas_realizadas?: number;
  evento_id: number;
  ativa?: boolean;
  criado_em?: string;
}

// Tipos de dashboard
export interface DashboardStats {
  total_eventos: number;
  eventos_ativos: number;
  total_vendas: number;
  receita_total: number;
  total_checkins: number;
  usuarios_ativos: number;
  vendas_hoje: number;
  receita_hoje: number;
}

export interface DashboardResumo {
  stats: DashboardStats;
  eventos_proximos: Evento[];
  vendas_recentes: Venda[];
  top_produtos: {
    produto: Produto;
    total_vendido: number;
    receita: number;
  }[];
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Tipos de erro
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Tipos de formulário
export interface FormError {
  field: string;
  message: string;
}

// Tipos de estado de loading
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Tipos de filtros
export interface EventoFilter {
  status?: Evento['status'];
  data_inicio?: string;
  data_fim?: string;
  search?: string;
}

export interface ProdutoFilter {
  categoria?: string;
  tipo?: Produto['tipo'];
  status?: Produto['status'];
  search?: string;
}

export interface VendaFilter {
  evento_id?: number;
  data_inicio?: string;
  data_fim?: string;
  metodo_pagamento?: Venda['metodo_pagamento'];
  status?: Venda['status'];
}

// Tipos de configuração
export interface AppConfig {
  api_url: string;
  app_name: string;
  version: string;
  features: {
    pwa_enabled: boolean;
    offline_mode: boolean;
    analytics_enabled: boolean;
  };
}

// Tipos de tema
export type ThemeMode = 'light' | 'dark' | 'system';

// Tipos de notificação
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  autoRemove?: boolean;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

// Tipos de permissão
export type Permission = 
  | 'read:events'
  | 'write:events'
  | 'read:products'
  | 'write:products'
  | 'read:sales'
  | 'write:sales'
  | 'read:users'
  | 'write:users'
  | 'read:dashboard'
  | 'admin:all';

export interface UserPermissions {
  permissions: Permission[];
  role: Usuario['tipo'];
}

// Tipos do Vite para import.meta.env
// interface ImportMeta removida

// interface ImportMetaEnv removida
