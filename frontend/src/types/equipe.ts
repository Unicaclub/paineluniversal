export interface Cargo {
  id: number;
  nome: string;
  descricao?: string;
  nivel_hierarquico: number;
  permissoes: PermissoesGranulares;
  ativo: boolean;
  empresa_id: number;
  criado_em: string;
  atualizado_em?: string;
}

export interface Colaborador {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  cargo_id: number;
  cargo?: Cargo;
  data_admissao: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  foto_perfil?: string;
  empresa_id: number;
  criado_em: string;
  atualizado_em?: string;
  criado_por?: number;
}

export interface PermissoesGranulares {
  dashboard: {
    visualizar: boolean;
    export: boolean;
  };
  eventos: {
    criar: boolean;
    editar: boolean;
    excluir: boolean;
    visualizar: boolean;
  };
  clientes: {
    criar: boolean;
    editar: boolean;
    excluir: boolean;
    visualizar: boolean;
    exportar: boolean;
  };
  cartoes: {
    emitir: boolean;
    bloquear: boolean;
    recarregar: boolean;
    consultar: boolean;
  };
  financeiro: {
    caixa: boolean;
    relatorios: boolean;
    configurar: boolean;
  };
  equipe: {
    gerenciar_colaboradores: boolean;
    gerenciar_cargos: boolean;
    definir_permissoes: boolean;
  };
}

export interface ColaboradorFormData {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  cargo_id: number;
  data_admissao: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  empresa_id: number;
}

export interface CargoFormData {
  nome: string;
  descricao?: string;
  nivel_hierarquico: number;
  permissoes: PermissoesGranulares;
  empresa_id: number;
}

export interface EstatisticasEquipe {
  total_colaboradores: number;
  colaboradores_ativos: number;
  total_cargos: number;
  taxa_atividade: number;
}

export interface FiltrosColaboradores {
  cargo_id?: number;
  status?: string;
  nome?: string;
  email?: string;
}
