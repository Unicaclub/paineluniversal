// Tipos principais do sistema de eventos

// Autenticação
export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  tipo: 'admin' | 'promoter' | 'cliente';
  empresa_id?: string;
  evento_id?: string;
  ativo?: boolean;
  telefone?: string;
  cpf?: string;
  cnpj?: string;
  data_nascimento?: string;
  endereco?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'promoter' | 'cliente';
  empresa_id?: string;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
  expires_in: number;
}

// Produtos
export interface Produto {
  id?: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  imagem_url?: string;
  qr_code?: string;
  ativo?: boolean;
  evento_id?: string;
  empresa_id?: string;
  ordem?: number;
  destaque?: boolean;
  habilitado?: boolean;
  estoque?: number;
  estoque_inicial?: number;
  estoque_minimo?: number;
  permite_desconto?: boolean;
  desconto_maximo?: number;
  categoria_id?: string;
  codigo_barras?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProdutoCreate {
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  imagem_url?: string;
  ativo?: boolean;
  evento_id?: number;
  empresa_id?: string;
  ordem?: number;
  destaque?: boolean;
  estoque?: number;
  estoque_inicial?: number;
  estoque_minimo?: number;
  permite_desconto?: boolean;
  desconto_maximo?: number;
  categoria_id?: string;
  codigo_barras?: string;
}

// Categorias
export interface Categoria {
  id?: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icone?: string;
  ativo: boolean;
  ordem?: number;
  mostrar_dashboard?: boolean;
  mostrar_pos?: boolean;
  empresa_id?: string;
  evento_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Eventos
export interface Evento {
  id?: string;
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  local?: string;
  capacidade_maxima?: number;
  tipo: 'show' | 'festa' | 'conferencia' | 'workshop' | 'outro';
  status: 'planejamento' | 'ativo' | 'pausado' | 'finalizado' | 'cancelado';
  preco_entrada?: number;
  imagem_url?: string;
  empresa_id?: string;
  organizador_id?: string;
  created_at?: string;
  updated_at?: string;
}

// API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
