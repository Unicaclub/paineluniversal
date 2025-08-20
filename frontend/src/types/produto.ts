export interface Produto {
  id: string;
  nome: string;
  codigo?: string;
  categoria_id: string;
  categoria?: Categoria;
  ncm?: string;
  cfop?: string;
  cest?: string;
  valor: number;
  destaque: boolean;
  habilitado: boolean;
  descricao?: string;
  imagem?: string;
  estoque?: number;
  marca?: string;
  fornecedor?: string;
  preco_custo?: number;
  margem_lucro?: number;
  unidade_medida?: string;
  volume?: number;
  teor_alcoolico?: number;
  temperatura_ideal?: string;
  validade_dias?: number;
  icms?: number;
  ipi?: number;
  promocional: boolean;
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProdutoCreate {
  nome: string;
  descricao?: string;
  preco: number;
  codigo_barras?: string;
  categoria_id?: number;
  tipo?: string;
  estoque_atual?: number;
  marca?: string;
  fornecedor?: string;
  preco_custo?: number;
  margem_lucro?: number;
  unidade_medida?: string;
  volume?: number;
  teor_alcoolico?: number;
  temperatura_ideal?: string;
  ncm?: string;
  destaque?: boolean;
  promocional?: boolean;
}

export interface Categoria {
  id: string;
  nome: string;
  mostrar_dashboard: boolean;
  mostrar_pos: boolean;
  maximo_composicao?: number;
  minimo_composicao?: number;
  cor?: string;
  icone?: string;
  ordem: number;
  produtos_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface AgendamentoProduto {
  id: string;
  nome: string;
  regra: string;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  produtos: Produto[];
  ativo: boolean;
  tipo: 'promocao' | 'sazonal' | 'evento';
  created_at: Date;
  updated_at: Date;
}

export interface ProdutoFilter {
  nome?: string;
  categoria?: string;
  tipo?: string;
  habilitado?: 'all' | 'true' | 'false';
  destaque?: 'true' | 'false';
  marca?: string;
  fornecedor?: string;
}

export interface CategoriaFilter {
  nome?: string;
  mostrar_dashboard?: boolean;
  mostrar_pos?: boolean;
}

export interface AgendamentoFilter {
  nome?: string;
  tipo?: 'promocao' | 'sazonal' | 'evento';
  ativo?: boolean;
}

export interface ImportOperation {
  id: string;
  tipo_operacao: 'IMPORTACAO' | 'EXPORTACAO';
  nome_arquivo: string;
  formato_arquivo: 'csv' | 'xlsx' | 'json' | 'xml';
  tamanho_arquivo?: number;
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDA' | 'ERRO' | 'CANCELADA';
  total_registros: number;
  registros_processados: number;
  registros_sucesso: number;
  registros_erro: number;
  registros_aviso: number;
  mapeamento_campos?: Record<string, string>;
  filtros_aplicados?: Record<string, any>;
  inicio_processamento?: Date;
  fim_processamento?: Date;
  log_detalhado?: string;
  url_arquivo_resultado?: string;
  resumo_operacao?: string;
  created_at: Date;
}

export interface ValidationError {
  field: string;
  type: 'required' | 'unique' | 'pattern' | 'range' | 'type';
  message: string;
  severity: 'critical' | 'warning';
  linha_arquivo?: number;
  valor_original?: string;
  valor_sugerido?: string;
}