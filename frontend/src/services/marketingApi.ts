const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface PontosCalculados {
  pontosBase: number;
  multiplicadorTotal: number;
  pontosFinais: number;
  detalhesMultiplicadores: any;
  bonusAplicados: string[];
}

export interface AnalysePreditiva {
  scoreEngajamento: number;
  probabilidadeRetorno: number;
  valorMedioProjetado: number;
  riscoCancelamento: string;
  proximoNivelEstimado: string;
  diasParaProximoNivel: number;
  recomendacoes: any[];
  melhorDiaContato: string;
  melhorHorarioContato: string;
  preferencias: any;
  insights: string[];
}

export interface DashboardMarketing {
  totalClientesFidelidade: number;
  pontosEmitidos: number;
  pontosResgatados: number;
  campanhasAtivas: number;
  promocoesAtivas: number;
  segmentosAtivos: number;
  taxaEngajamento: number;
  roiFidelidade: number;
  conversaoCampanhas: number;
}

class MarketingApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async obterDashboard(): Promise<DashboardMarketing> {
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/dashboard`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao obter dashboard');
    }
    
    return data.data;
  }

  async calcularPontos(dadosTransacao: {
    clienteCpf: string;
    valorCompra: number;
    eventoId: number;
    tipoTransacao?: string;
  }): Promise<PontosCalculados> {
    const response = await fetch(`${this.baseUrl}/api/marketing/pontos/calcular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosTransacao),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao calcular pontos');
    }
    
    return data.data;
  }

  async executarSegmentacao(empresaId: number, algoritmo: string = 'rfm') {
    const response = await fetch(`${this.baseUrl}/api/marketing/segmentacao/executar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ empresaId, algoritmo }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro na segmentação');
    }
    
    return data.data;
  }

  async obterAnalisePreditiva(clienteCpf: string): Promise<AnalysePreditiva> {
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/analise-preditiva/${clienteCpf}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro na análise preditiva');
    }
    
    return data.data;
  }

  async criarProgramaFidelidade(programa: any) {
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/programas-fidelidade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(programa),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao criar programa');
    }
    
    return data.data;
  }

  async adicionarPontos(dadosPontos: {
    carteiraId: number;
    pontos: number;
    valorCompra: number;
    eventoId?: number;
    descricao?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/adicionar-pontos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosPontos),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao adicionar pontos');
    }
    
    return data.data;
  }

  async listarSegmentos(empresaId: number, ativo?: boolean) {
    const params = new URLSearchParams({ empresa_id: empresaId.toString() });
    if (ativo !== undefined) {
      params.append('ativo', ativo.toString());
    }
    
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/segmentos?${params}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao listar segmentos');
    }
    
    return data.data;
  }

  async criarSegmento(segmento: any) {
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/segmentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(segmento),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao criar segmento');
    }
    
    return data.data;
  }

  async listarCampanhas(empresaId: number, status?: string, tipo?: string) {
    const params = new URLSearchParams({ empresa_id: empresaId.toString() });
    if (status) params.append('status', status);
    if (tipo) params.append('tipo', tipo);
    
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/campanhas?${params}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao listar campanhas');
    }
    
    return data.data;
  }

  async executarCampanha(campanhaId: number) {
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/campanhas/${campanhaId}/executar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao executar campanha');
    }
    
    return data;
  }

  async listarTemplates(empresaId: number, tipo?: string, canal?: string) {
    const params = new URLSearchParams({ empresa_id: empresaId.toString() });
    if (tipo) params.append('tipo', tipo);
    if (canal) params.append('canal', canal);
    
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/templates?${params}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao listar templates');
    }
    
    return data.data;
  }

  async obterAnalytics(eventoId: number, dataInicio?: string, dataFim?: string) {
    const params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/analytics/${eventoId}?${params}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao obter analytics');
    }
    
    return data.data;
  }

  async calcularROI(programaId: number, periodoMeses: number = 12) {
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/roi-programa/${programaId}?periodo_meses=${periodoMeses}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro ao calcular ROI');
    }
    
    return data.data;
  }

  async executarSegmentacaoAutomatica(empresaId: number, algoritmo: string = 'rfm') {
    const response = await fetch(`${this.baseUrl}/api/marketing-crm/segmentacao-automatica`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ empresa_id: empresaId, algoritmo }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erro na segmentação automática');
    }
    
    return data.data;
  }
}

export const marketingApiService = new MarketingApiService();
