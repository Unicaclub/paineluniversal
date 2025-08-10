from pydantic import BaseModel, EmailStr, validator
from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal
from .models import StatusEvento, TipoLista, StatusTransacao, TipoUsuario, TipoProduto, StatusProduto, TipoComanda, StatusComanda, StatusVendaPDV, TipoPagamentoPDV, StatusColaborador, StatusMesa, TipoArea, StatusComandaOperacao, TipoBloqueio
import re


class MovimentacaoFinanceiraBase(BaseModel):
    tipo: str
    categoria: str
    descricao: str
    valor: Decimal
    promoter_id: Optional[int] = None
    numero_documento: Optional[str] = None
    observacoes: Optional[str] = None
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None
    metodo_pagamento: Optional[str] = None


class MovimentacaoFinanceiraCreate(MovimentacaoFinanceiraBase):
    evento_id: int


class MovimentacaoFinanceiraUpdate(BaseModel):
    categoria: Optional[str] = None
    descricao: Optional[str] = None
    valor: Optional[Decimal] = None
    status: Optional[str] = None
    promoter_id: Optional[int] = None
    numero_documento: Optional[str] = None
    observacoes: Optional[str] = None
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None
    metodo_pagamento: Optional[str] = None


class MovimentacaoFinanceira(MovimentacaoFinanceiraBase):
    id: int
    evento_id: int
    status: str
    usuario_responsavel_id: int
    comprovante_url: Optional[str] = None
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    evento_nome: Optional[str] = None
    usuario_responsavel_nome: Optional[str] = None
    promoter_nome: Optional[str] = None
    
    class Config:
        from_attributes = True


class CaixaEventoBase(BaseModel):
    saldo_inicial: Decimal = Decimal('0.00')
    observacoes_abertura: Optional[str] = None


class CaixaEventoCreate(CaixaEventoBase):
    evento_id: int


class CaixaEvento(CaixaEventoBase):
    id: int
    evento_id: int
    data_abertura: datetime
    data_fechamento: Optional[datetime] = None
    total_entradas: Decimal
    total_saidas: Decimal
    total_vendas_pdv: Decimal
    total_vendas_listas: Decimal
    saldo_final: Decimal
    status: str
    usuario_abertura_id: int
    usuario_fechamento_id: Optional[int] = None
    observacoes_fechamento: Optional[str] = None
    
    class Config:
        from_attributes = True


class DashboardFinanceiro(BaseModel):
    evento_id: int
    saldo_atual: Decimal
    total_entradas: Decimal
    total_saidas: Decimal
    total_vendas: Decimal
    lucro_prejuizo: Decimal
    movimentacoes_recentes: List[dict]
    categorias_despesas: List[dict]
    repasses_promoters: List[dict]
    status_caixa: str

class EmpresaBase(BaseModel):
    nome: str
    cnpj: str
    email: EmailStr
    telefone: Optional[str] = None
    endereco: Optional[str] = None

class EmpresaCreate(EmpresaBase):
    @validator('cnpj')
    def validar_cnpj(cls, v):
        cnpj = re.sub(r'\D', '', v)
        if len(cnpj) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        return f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}"

class Empresa(EmpresaBase):
    id: int
    ativa: bool
    criado_em: datetime
    
    class Config:
        from_attributes = True

class UsuarioBase(BaseModel):
    cpf: str
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    tipo: TipoUsuario

class UsuarioCreate(UsuarioBase):
    senha: str
    
    @validator('cpf')
    def validar_cpf(cls, v):
        cpf = re.sub(r'\D', '', v)
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

class UsuarioRegister(BaseModel):
    cpf: str
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    senha: str
    tipo: TipoUsuario = TipoUsuario.CLIENTE
    
    @validator('cpf')
    def validar_cpf(cls, v):
        cpf = re.sub(r'\D', '', v)
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return cpf  # Manter apenas os números para o registro público

class Usuario(UsuarioBase):
    id: int
    ativo: bool
    ultimo_login: Optional[datetime] = None
    criado_em: datetime
    
    class Config:
        from_attributes = True

class EventoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    data_evento: datetime
    local: str
    endereco: Optional[str] = None
    limite_idade: int = 18
    capacidade_maxima: Optional[int] = None

class EventoCreate(EventoBase):
    empresa_id: Optional[int] = None

class Evento(EventoBase):
    id: int
    status: StatusEvento
    empresa_id: int
    criador_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class EventoDetalhado(EventoBase):
    id: int
    status: StatusEvento
    empresa_id: int
    criador_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    total_vendas: int = 0
    receita_total: Decimal = Decimal('0.00')
    total_checkins: int = 0
    promoters_vinculados: List[dict] = []
    status_financeiro: str = "sem_vendas"
    
    class Config:
        from_attributes = True

class EventoFiltros(BaseModel):
    nome: Optional[str] = None
    status: Optional[StatusEvento] = None
    empresa_id: Optional[int] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    local: Optional[str] = None
    limite_idade_min: Optional[int] = None
    limite_idade_max: Optional[int] = None

class PromoterEventoCreate(BaseModel):
    promoter_id: int
    meta_vendas: Optional[int] = None
    comissao_percentual: Optional[Decimal] = None

class PromoterEventoResponse(BaseModel):
    id: int
    promoter_id: int
    evento_id: int
    meta_vendas: Optional[int] = None
    vendas_realizadas: int = 0
    comissao_percentual: Optional[Decimal] = None
    ativo: bool = True
    promoter_nome: str
    
    class Config:
        from_attributes = True

class ListaBase(BaseModel):
    nome: str
    tipo: TipoLista
    preco: Decimal = Decimal('0.00')
    limite_vendas: Optional[int] = None
    ativa: bool = True
    descricao: Optional[str] = None
    codigo_cupom: Optional[str] = None
    desconto_percentual: Decimal = Decimal('0.00')

class ListaCreate(ListaBase):
    evento_id: int
    promoter_id: Optional[int] = None

class Lista(ListaBase):
    id: int
    vendas_realizadas: int
    evento_id: int
    promoter_id: Optional[int] = None
    criado_em: datetime
    
    class Config:
        from_attributes = True

class TransacaoBase(BaseModel):
    cpf_comprador: str
    nome_comprador: str
    email_comprador: Optional[EmailStr] = None
    telefone_comprador: Optional[str] = None
    valor: Decimal
    metodo_pagamento: Optional[str] = None

class TransacaoCreate(TransacaoBase):
    evento_id: int
    lista_id: int
    
    @validator('cpf_comprador')
    def validar_cpf_comprador(cls, v):
        cpf = re.sub(r'\D', '', v)
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

class Transacao(TransacaoBase):
    id: int
    status: StatusTransacao
    codigo_transacao: Optional[str] = None
    qr_code_ticket: Optional[str] = None
    evento_id: int
    lista_id: int
    usuario_id: Optional[int] = None
    criado_em: datetime
    
    class Config:
        from_attributes = True

class CheckinBase(BaseModel):
    cpf: str
    metodo_checkin: str
    validacao_cpf: str

class CheckinCreate(CheckinBase):
    evento_id: int
    
    @validator('cpf')
    def validar_cpf(cls, v):
        cpf = re.sub(r'\D', '', v)
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"
    
    @validator('validacao_cpf')
    def validar_tres_digitos(cls, v):
        if len(v) != 3 or not v.isdigit():
            raise ValueError('Validação deve ter exatamente 3 dígitos')
        return v

class Checkin(CheckinBase):
    id: int
    nome: str
    evento_id: int
    usuario_id: Optional[int] = None
    transacao_id: Optional[int] = None
    checkin_em: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    usuario: Usuario

class TokenData(BaseModel):
    cpf: Optional[str] = None

class LoginRequest(BaseModel):
    cpf: str
    senha: str
    codigo_verificacao: Optional[str] = None

class DashboardResumo(BaseModel):
    total_eventos: int
    total_vendas: int
    total_checkins: int
    receita_total: Decimal
    eventos_hoje: int
    vendas_hoje: int

class RankingPromoter(BaseModel):
    promoter_id: int
    nome_promoter: str
    total_vendas: int
    receita_gerada: Decimal
    posicao: int

class RelatorioVendas(BaseModel):
    evento_id: int
    nome_evento: str
    total_vendas: int
    receita_total: Decimal
    vendas_por_lista: List[dict]
    vendas_por_promoter: List[dict]

class CupomCreate(BaseModel):
    lista_id: int
    codigo: str
    desconto_percentual: Optional[Decimal] = None
    desconto_valor: Optional[Decimal] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    limite_uso: Optional[int] = None

class CupomResponse(BaseModel):
    id: int
    codigo: str
    desconto_percentual: Optional[Decimal]
    desconto_valor: Optional[Decimal]
    lista_nome: str
    evento_nome: str
    
    class Config:
        from_attributes = True

class ProdutoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: TipoProduto
    preco: Decimal
    codigo_barras: Optional[str] = None
    codigo_interno: Optional[str] = None
    estoque_atual: int = 0
    estoque_minimo: int = 0
    estoque_maximo: int = 1000
    controla_estoque: bool = True
    categoria: Optional[str] = None
    imagem_url: Optional[str] = None

class ProdutoCreate(ProdutoBase):
    evento_id: int

class Produto(ProdutoBase):
    id: int
    status: StatusProduto
    evento_id: int
    empresa_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ComandaBase(BaseModel):
    numero_comanda: str
    cpf_cliente: Optional[str] = None
    nome_cliente: Optional[str] = None
    tipo: TipoComanda
    codigo_rfid: Optional[str] = None
    qr_code: Optional[str] = None

class ComandaCreate(ComandaBase):
    evento_id: int

class Comanda(ComandaBase):
    id: int
    saldo_atual: Decimal
    saldo_bloqueado: Decimal
    status: StatusComanda
    evento_id: int
    empresa_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ItemVendaPDVBase(BaseModel):
    produto_id: int
    quantidade: int
    preco_unitario: Decimal
    observacoes: Optional[str] = None

class ItemVendaPDVCreate(ItemVendaPDVBase):
    pass

class ItemVendaPDV(ItemVendaPDVBase):
    id: int
    venda_id: int
    preco_total: Decimal
    desconto_aplicado: Decimal
    criado_em: datetime
    produto_nome: Optional[str] = None
    
    class Config:
        from_attributes = True

class PagamentoPDVBase(BaseModel):
    tipo_pagamento: TipoPagamentoPDV
    valor: Decimal
    promoter_id: Optional[int] = None
    comissao_percentual: Optional[Decimal] = None

class PagamentoPDVCreate(PagamentoPDVBase):
    pass

class PagamentoPDV(PagamentoPDVBase):
    id: int
    venda_id: int
    codigo_transacao: Optional[str] = None
    valor_comissao: Decimal
    status: StatusVendaPDV
    criado_em: datetime
    
    class Config:
        from_attributes = True

class VendaPDVBase(BaseModel):
    cpf_cliente: Optional[str] = None
    nome_cliente: Optional[str] = None
    comanda_id: Optional[int] = None
    cupom_codigo: Optional[str] = None
    observacoes: Optional[str] = None

class VendaPDVCreate(VendaPDVBase):
    evento_id: int
    itens: List[ItemVendaPDVCreate]
    pagamentos: List[PagamentoPDVCreate]

class VendaPDV(VendaPDVBase):
    id: int
    numero_venda: str
    valor_total: Decimal
    valor_desconto: Decimal
    valor_final: Decimal
    tipo_pagamento: TipoPagamentoPDV
    status: StatusVendaPDV
    evento_id: int
    empresa_id: int
    usuario_vendedor_id: int
    promoter_id: Optional[int] = None
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    itens: List[ItemVendaPDV] = []
    pagamentos: List[PagamentoPDV] = []
    
    class Config:
        from_attributes = True

class RecargaComandaBase(BaseModel):
    valor: Decimal
    tipo_pagamento: TipoPagamentoPDV

class RecargaComandaCreate(RecargaComandaBase):
    comanda_id: int

class RecargaComanda(RecargaComandaBase):
    id: int
    comanda_id: int
    codigo_transacao: Optional[str] = None
    usuario_id: int
    status: StatusVendaPDV
    criado_em: datetime
    
    class Config:
        from_attributes = True

class CaixaPDVBase(BaseModel):
    numero_caixa: str
    valor_abertura: Decimal = Decimal('0.00')

class CaixaPDVCreate(CaixaPDVBase):
    evento_id: int

class CaixaPDV(CaixaPDVBase):
    id: int
    evento_id: int
    usuario_operador_id: int
    valor_vendas: Decimal
    valor_sangrias: Decimal
    valor_fechamento: Decimal
    status: str
    data_abertura: datetime
    data_fechamento: Optional[datetime] = None
    observacoes: Optional[str] = None
    
    class Config:
        from_attributes = True

class RelatorioVendasPDV(BaseModel):
    evento_id: int
    periodo_inicio: datetime
    periodo_fim: datetime
    total_vendas: int
    valor_total: Decimal
    vendas_por_produto: List[dict]
    vendas_por_forma_pagamento: List[dict]
    vendas_por_hora: List[dict]
    top_produtos: List[dict]

class DashboardPDV(BaseModel):
    vendas_hoje: int
    valor_vendas_hoje: Decimal
    produtos_em_falta: int
    comandas_ativas: int
    caixas_abertos: int
    vendas_por_hora: List[dict]
    produtos_mais_vendidos: List[dict]
    alertas: List[dict]

class DashboardAvancado(BaseModel):
    total_eventos: int
    total_vendas: int
    total_checkins: int
    receita_total: Decimal
    taxa_conversao: float
    vendas_hoje: int
    vendas_semana: int
    vendas_mes: int
    receita_hoje: Decimal
    receita_semana: Decimal
    receita_mes: Decimal
    checkins_hoje: int
    checkins_semana: int
    taxa_presenca: float
    fila_espera: int
    cortesias: int
    inadimplentes: int
    aniversariantes_mes: int
    consumo_medio: Decimal

class FiltrosDashboard(BaseModel):
    evento_id: Optional[int] = None
    promoter_id: Optional[int] = None
    tipo_lista: Optional[str] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    metodo_pagamento: Optional[str] = None

class RankingPromoterAvancado(BaseModel):
    promoter_id: int
    nome_promoter: str
    total_vendas: int
    receita_gerada: Decimal
    total_checkins: int
    taxa_presenca: float
    taxa_conversao: float
    posicao: int
    badge: str

class DadosGrafico(BaseModel):
    labels: List[str]
    datasets: List[dict]
    tipo: str

class ConvidadoBase(BaseModel):
    cpf: str
    nome: str
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    
    @validator('cpf')
    def validar_cpf(cls, v):
        cpf = re.sub(r'\D', '', v)
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

class ConvidadoCreate(ConvidadoBase):
    lista_id: int
    evento_id: int

class ConvidadoImport(BaseModel):
    convidados: List[ConvidadoBase]
    lista_id: int
    evento_id: int

class ListaDetalhada(Lista):
    total_convidados: int = 0
    convidados_presentes: int = 0
    taxa_presenca: float = 0.0
    receita_gerada: Decimal = Decimal('0.00')
    promoter_nome: Optional[str] = None
    
class ListaFiltros(BaseModel):
    evento_id: Optional[int] = None
    promoter_id: Optional[int] = None
    tipo: Optional[str] = None
    ativa: Optional[bool] = None
    
class RankingPromoterLista(BaseModel):
    promoter_id: int
    nome_promoter: str
    total_listas: int
    total_convidados: int
    total_presentes: int
    receita_total: Decimal
    taxa_presenca: float
    taxa_conversao: float
    posicao: int
    badge: str
    eventos_ativos: int

class DashboardListas(BaseModel):
    total_listas: int
    total_convidados: int
    total_presentes: int
    taxa_presenca_geral: float
    listas_mais_ativas: List[dict]
    promoters_destaque: List[dict]
    convidados_por_tipo: List[dict]
    presencas_tempo_real: List[dict]

class ConquistaBase(BaseModel):
    nome: str
    descricao: str
    tipo: str
    criterio_valor: int
    badge_nivel: str
    icone: Optional[str] = None

class ConquistaCreate(ConquistaBase):
    pass

class Conquista(ConquistaBase):
    id: int
    ativa: bool
    criado_em: datetime
    
    class Config:
        from_attributes = True

class PromoterConquistaResponse(BaseModel):
    id: int
    conquista_nome: str
    conquista_descricao: str
    badge_nivel: str
    icone: Optional[str] = None
    valor_alcancado: int
    data_conquista: datetime
    evento_nome: Optional[str] = None
    
    class Config:
        from_attributes = True

class MetricaPromoterResponse(BaseModel):
    promoter_id: int
    promoter_nome: str
    evento_id: Optional[int] = None
    evento_nome: Optional[str] = None
    periodo_inicio: date
    periodo_fim: date
    total_vendas: int
    receita_gerada: Decimal
    total_convidados: int
    total_presentes: int
    taxa_presenca: Decimal
    taxa_conversao: Decimal
    crescimento_vendas: Decimal
    posicao_vendas: Optional[int] = None
    posicao_presenca: Optional[int] = None
    posicao_geral: Optional[int] = None
    badge_atual: str
    conquistas_recentes: List[PromoterConquistaResponse] = []
    
    class Config:
        from_attributes = True

class RankingGamificado(BaseModel):
    promoter_id: int
    nome_promoter: str
    avatar_url: Optional[str] = None
    badge_principal: str
    nivel_experiencia: int
    total_vendas: int
    receita_gerada: Decimal
    taxa_presenca: float
    taxa_conversao: float
    crescimento_mensal: float
    posicao_atual: int
    posicao_anterior: Optional[int] = None
    conquistas_total: int
    conquistas_mes: int
    eventos_ativos: int
    streak_vendas: int
    pontuacao_total: int
    
class DashboardGamificacao(BaseModel):
    ranking_geral: List[RankingGamificado]
    conquistas_recentes: List[PromoterConquistaResponse]
    metricas_periodo: dict
    badges_disponiveis: List[dict]
    alertas_gamificacao: List[dict]
    estatisticas_gerais: dict

class FiltrosRanking(BaseModel):
    evento_id: Optional[int] = None
    periodo_inicio: Optional[date] = None
    periodo_fim: Optional[date] = None
    badge_nivel: Optional[str] = None
    tipo_ranking: Optional[str] = "geral"
    limit: int = 20

class CargoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    nivel_hierarquico: int = 4
    permissoes: dict = {}

class CargoCreate(CargoBase):
    empresa_id: int

class CargoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    nivel_hierarquico: Optional[int] = None
    permissoes: Optional[dict] = None

class Cargo(CargoBase):
    id: int
    ativo: bool
    empresa_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ColaboradorBase(BaseModel):
    nome: str
    email: EmailStr
    cpf: str
    telefone: Optional[str] = None
    cargo_id: int
    data_admissao: date
    status: StatusColaborador = StatusColaborador.ATIVO

class ColaboradorCreate(ColaboradorBase):
    empresa_id: int

class ColaboradorUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    cargo_id: Optional[int] = None
    data_admissao: Optional[date] = None
    status: Optional[StatusColaborador] = None

class Colaborador(ColaboradorBase):
    id: int
    empresa_id: int
    foto_perfil: Optional[str] = None
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    criado_por: Optional[int] = None
    cargo: Optional[Cargo] = None
    
    class Config:
        from_attributes = True

class CategoriaEstoqueBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    icone: Optional[str] = None
    cor: Optional[str] = "#6B46C1"
    ativa: bool = True

class CategoriaEstoqueCreate(CategoriaEstoqueBase):
    empresa_id: int

class CategoriaEstoque(CategoriaEstoqueBase):
    id: int
    empresa_id: int
    criado_em: datetime
    
    class Config:
        from_attributes = True

class PrevisaoDemandaBase(BaseModel):
    produto_id: int
    data_previsao: date
    quantidade_prevista: int
    confianca_percentual: Decimal
    fatores_influencia: List[str] = []
    algoritmo_usado: str = "time_series_ml"

class PrevisaoDemanda(PrevisaoDemandaBase):
    id: int
    criado_em: datetime
    produto_nome: Optional[str] = None
    
    class Config:
        from_attributes = True

class AlertaEstoqueBase(BaseModel):
    produto_id: int
    tipo_alerta: str
    nivel_criticidade: str
    mensagem: str
    ativo: bool = True

class AlertaEstoque(AlertaEstoqueBase):
    id: int
    data_resolucao: Optional[datetime] = None
    criado_em: datetime
    produto_nome: Optional[str] = None
    
    class Config:
        from_attributes = True

class DashboardEstoquePremium(BaseModel):
    valor_total_estoque: Decimal
    giro_estoque_medio: Decimal
    acuracia_estoque: Decimal
    produtos_criticos: int
    previsao_demanda_7dias: List[dict]
    alertas_ativos: List[AlertaEstoque]
    top_produtos_giro: List[dict]
    analise_abc: dict
    metricas_ia: dict

class FornecedorBase(BaseModel):
    nome: str
    cnpj: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    lead_time_medio: int = 7
    avaliacao: Decimal = Decimal('5.0')

class FornecedorCreate(FornecedorBase):
    empresa_id: int

class Fornecedor(FornecedorBase):
    id: int
    ativo: bool
    empresa_id: int
    criado_em: datetime
    
    class Config:
        from_attributes = True

class ReposicaoAutomaticaBase(BaseModel):
    produto_id: int
    fornecedor_id: Optional[int] = None
    quantidade_sugerida: int
    ponto_reposicao: int
    lote_economico: int

class ReposicaoAutomatica(ReposicaoAutomaticaBase):
    id: int
    status: str
    aprovado_por: Optional[int] = None
    criado_em: datetime
    produto_nome: Optional[str] = None
    fornecedor_nome: Optional[str] = None
    
    class Config:
        from_attributes = True

class LayoutEventoBase(BaseModel):
    nome: str
    largura: int
    altura: int
    escala: Optional[Decimal] = Decimal('1.0')
    configuracao: Optional[dict] = {}
    imagem_fundo: Optional[str] = None

class LayoutEventoCreate(LayoutEventoBase):
    evento_id: int

class LayoutEvento(LayoutEventoBase):
    id: int
    evento_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AreaEventoBase(BaseModel):
    nome: str
    tipo: TipoArea
    posicao_x: int
    posicao_y: int
    largura: int
    altura: int
    capacidade_maxima: Optional[int] = 0
    cor: Optional[str] = '#4299e1'
    ativa: Optional[bool] = True
    configuracoes: Optional[dict] = {}
    restricoes: Optional[List[str]] = []
    responsavel_id: Optional[int] = None

class AreaEventoCreate(AreaEventoBase):
    layout_id: int

class AreaEvento(AreaEventoBase):
    id: int
    layout_id: int
    
    class Config:
        from_attributes = True

class MesaBase(BaseModel):
    numero: str
    nome: Optional[str] = None
    tipo: Optional[str] = 'comum'
    capacidade_pessoas: Optional[int] = 4
    posicao_x: int
    posicao_y: int
    largura: Optional[int] = 100
    altura: Optional[int] = 100
    formato: Optional[str] = 'retangular'
    status: Optional[StatusMesa] = StatusMesa.DISPONIVEL
    valor_minimo: Optional[Decimal] = Decimal('0')
    taxa_servico: Optional[Decimal] = Decimal('10')
    observacoes: Optional[str] = None
    configuracoes: Optional[dict] = {}

class MesaCreate(MesaBase):
    area_id: int

class Mesa(MesaBase):
    id: int
    area_id: int
    criada_em: datetime
    atualizada_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ComandaOperacaoBase(BaseModel):
    numero_comanda: str
    cliente_principal_cpf: Optional[str] = None
    status: Optional[StatusComandaOperacao] = StatusComandaOperacao.ABERTA
    tipo: Optional[str] = 'mesa'
    observacoes: Optional[str] = None
    configuracoes: Optional[dict] = {}

class ComandaOperacaoCreate(ComandaOperacaoBase):
    evento_id: int
    mesa_id: Optional[int] = None

class ComandaOperacao(ComandaOperacaoBase):
    id: int
    uuid: str
    evento_id: int
    mesa_id: Optional[int] = None
    data_abertura: datetime
    data_fechamento: Optional[datetime] = None
    valor_total: Decimal
    valor_pago: Decimal
    valor_pendente: Decimal
    desconto_aplicado: Decimal
    taxa_servico: Decimal
    funcionario_abertura: Optional[int] = None
    funcionario_fechamento: Optional[int] = None
    
    class Config:
        from_attributes = True

class ComandaParticipanteBase(BaseModel):
    nome: str
    telefone: Optional[str] = None
    cliente_cpf: Optional[str] = None

class ComandaParticipanteCreate(ComandaParticipanteBase):
    comanda_id: int

class ComandaParticipante(ComandaParticipanteBase):
    id: int
    comanda_id: int
    entrada_em: datetime
    saida_em: Optional[datetime] = None
    consumo_individual: Decimal
    ativo: bool
    
    class Config:
        from_attributes = True

class ComandaItemBase(BaseModel):
    nome_produto: str
    categoria: Optional[str] = None
    quantidade: int = 1
    valor_unitario: Decimal
    valor_total: Decimal
    desconto: Optional[Decimal] = Decimal('0')
    cliente_solicitante_cpf: Optional[str] = None
    observacoes: Optional[str] = None

class ComandaItemCreate(ComandaItemBase):
    comanda_id: int
    produto_id: Optional[int] = None

class ComandaItem(ComandaItemBase):
    id: int
    comanda_id: int
    produto_id: Optional[int] = None
    funcionario_id: Optional[int] = None
    data_pedido: datetime
    data_entrega: Optional[datetime] = None
    status: str
    
    class Config:
        from_attributes = True

class BloqueioBase(BaseModel):
    tipo: TipoBloqueio
    referencia_id: str
    motivo: str
    detalhes: Optional[str] = None
    temporario: Optional[bool] = False
    expira_em: Optional[datetime] = None

class BloqueioCreate(BloqueioBase):
    evento_id: int

class Bloqueio(BloqueioBase):
    id: int
    evento_id: int
    bloqueado_por: Optional[int] = None
    bloqueado_em: datetime
    desbloqueado_por: Optional[int] = None
    desbloqueado_em: Optional[datetime] = None
    ativo: bool
    
    class Config:
        from_attributes = True

class GrupoCartaoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    cor: Optional[str] = '#4299e1'
    limite_consumo: Optional[Decimal] = Decimal('0')
    desconto_percentual: Optional[Decimal] = Decimal('0')
    beneficios: Optional[List[str]] = []
    ativo: Optional[bool] = True

class GrupoCartaoCreate(GrupoCartaoBase):
    evento_id: int

class GrupoCartao(GrupoCartaoBase):
    id: int
    evento_id: int
    criado_em: datetime
    
    class Config:
        from_attributes = True

class CartaoEventoBase(BaseModel):
    numero_cartao: str
    cliente_cpf: Optional[str] = None
    status: Optional[str] = 'ativo'
    saldo_credito: Optional[Decimal] = Decimal('0')
    limite_consumo: Optional[Decimal] = Decimal('0')
    configuracoes: Optional[dict] = {}

class CartaoEventoCreate(CartaoEventoBase):
    evento_id: int
    grupo_id: Optional[int] = None

class CartaoEvento(CartaoEventoBase):
    id: int
    uuid: str
    evento_id: int
    grupo_id: Optional[int] = None
    qr_code: Optional[str] = None
    consumo_total: Decimal
    data_emissao: datetime
    data_bloqueio: Optional[datetime] = None
    motivo_bloqueio: Optional[str] = None
    
    class Config:
        from_attributes = True

class FiltrosMapaOperacao(BaseModel):
    mostrar_apenas_ativas: Optional[bool] = True
    tipo_area: Optional[str] = None
    status_mesa: Optional[str] = None
    grupo_cartao: Optional[int] = None
    busca_texto: Optional[str] = None
    busca_tipo: Optional[str] = None

class EstatisticasOperacao(BaseModel):
    total_mesas: int
    mesas_ocupadas: int
    mesas_disponveis: int
    mesas_reservadas: int
    mesas_bloqueadas: int
    comandas_abertas: int
    comandas_bloqueadas: int
    total_participantes: int
    faturamento_total: Decimal
    ticket_medio: Decimal

class ResultadoBusca(BaseModel):
    tipo: str
    id: int
    titulo: str
    subtitulo: Optional[str] = None
    status: str
    dados_extras: Optional[dict] = {}

class ProgramaFidelidadeBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: Optional[str] = 'pontos'
    ativo: Optional[bool] = True
    data_inicio: date
    data_fim: Optional[date] = None
    configuracoes: Optional[dict] = {}
    regras_pontuacao: Optional[dict] = {}
    regras_resgate: Optional[dict] = {}

class ProgramaFidelidadeCreate(ProgramaFidelidadeBase):
    empresa_id: int

class ProgramaFidelidade(ProgramaFidelidadeBase):
    id: int
    empresa_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class NivelFidelidadeBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    cor: Optional[str] = '#4299e1'
    icone: Optional[str] = None
    pontos_minimos: Optional[int] = 0
    pontos_maximos: Optional[int] = None
    multiplicador_pontos: Optional[Decimal] = Decimal('1.00')
    desconto_percentual: Optional[Decimal] = Decimal('0')
    beneficios: Optional[List[str]] = []
    requisitos: Optional[dict] = {}
    ordem: Optional[int] = 0
    ativo: Optional[bool] = True

class NivelFidelidadeCreate(NivelFidelidadeBase):
    programa_id: int

class NivelFidelidade(NivelFidelidadeBase):
    id: int
    programa_id: int
    
    class Config:
        from_attributes = True

class CarteiraFidelidadeBase(BaseModel):
    pontos_atuais: Optional[int] = 0
    pontos_lifetime: Optional[int] = 0
    cashback_disponivel: Optional[Decimal] = Decimal('0')
    status: Optional[str] = 'ativo'
    metadata: Optional[dict] = {}

class CarteiraFidelidadeCreate(CarteiraFidelidadeBase):
    cliente_cpf: str
    programa_id: int
    nivel_atual_id: Optional[int] = None

class CarteiraFidelidade(CarteiraFidelidadeBase):
    id: int
    cliente_cpf: str
    programa_id: int
    nivel_atual_id: Optional[int] = None
    data_ingresso: datetime
    ultima_atividade: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TransacaoFidelidadeBase(BaseModel):
    tipo: str
    origem: Optional[str] = None
    pontos_transacao: int
    valor_monetario: Optional[Decimal] = None
    descricao: Optional[str] = None
    comanda_id: Optional[int] = None
    campanha_id: Optional[int] = None
    data_expiracao: Optional[date] = None
    metadata: Optional[dict] = {}

class TransacaoFidelidadeCreate(TransacaoFidelidadeBase):
    carteira_id: int
    evento_id: Optional[int] = None
    funcionario_id: Optional[int] = None

class TransacaoFidelidade(TransacaoFidelidadeBase):
    id: int
    carteira_id: int
    evento_id: Optional[int] = None
    pontos_antes: int
    pontos_depois: int
    funcionario_id: Optional[int] = None
    criado_em: datetime
    
    class Config:
        from_attributes = True

class SegmentoClienteBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: Optional[str] = 'dinamico'
    criterios: dict
    filtros_sql: Optional[str] = None
    ativo: Optional[bool] = True

class SegmentoClienteCreate(SegmentoClienteBase):
    criado_por: int

class SegmentoCliente(SegmentoClienteBase):
    id: int
    tamanho_estimado: int
    ultima_atualizacao: datetime
    criado_por: int
    criado_em: datetime
    
    class Config:
        from_attributes = True

class CampanhaMarketingBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: str
    status: Optional[str] = 'rascunho'
    objetivo: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    frequencia: Optional[str] = None
    trigger_evento: Optional[str] = None
    configuracoes: Optional[dict] = {}
    budget_maximo: Optional[Decimal] = None

class CampanhaMarketingCreate(CampanhaMarketingBase):
    segmento_id: Optional[int] = None
    template_id: Optional[int] = None
    criado_por: int

class CampanhaMarketing(CampanhaMarketingBase):
    id: int
    segmento_id: Optional[int] = None
    template_id: Optional[int] = None
    metricas: dict
    gasto_atual: Decimal
    criado_por: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TemplateMensagemBase(BaseModel):
    nome: str
    tipo: str
    categoria: Optional[str] = None
    assunto: Optional[str] = None
    conteudo: str
    variaveis: Optional[List[str]] = []
    layout_html: Optional[str] = None
    configuracoes: Optional[dict] = {}
    preview_url: Optional[str] = None
    ativo: Optional[bool] = True

class TemplateMensagemCreate(TemplateMensagemBase):
    criado_por: int

class TemplateMensagem(TemplateMensagemBase):
    id: int
    criado_por: int
    criado_em: datetime
    
    class Config:
        from_attributes = True

class PromocaoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: str
    valor_desconto: Optional[Decimal] = None
    percentual_desconto: Optional[Decimal] = None
    codigo_cupom: Optional[str] = None
    limite_uso: Optional[int] = None
    limite_por_cliente: Optional[int] = 1
    valor_minimo_compra: Optional[Decimal] = Decimal('0')
    publico_alvo: Optional[dict] = {}
    produtos_aplicaveis: Optional[List[int]] = []
    data_inicio: datetime
    data_fim: datetime
    ativa: Optional[bool] = True

class PromocaoCreate(PromocaoBase):
    created_by: int

class Promocao(PromocaoBase):
    id: int
    uso_atual: int
    receita_impacto: Decimal
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class DashboardMarketing(BaseModel):
    total_clientes_fidelidade: int
    pontos_emitidos_mes: int
    pontos_resgatados_mes: int
    campanhas_ativas: int
    taxa_engajamento: Decimal
    roi_fidelidade: Decimal
    promocoes_ativas: int
    cupons_utilizados_mes: int
    receita_promocoes: Decimal
    segmentos_ativos: int
    workflows_executando: int
    conversao_campanhas: Decimal

class AnalysePreditivaCliente(BaseModel):
    score_engajamento: int
    probabilidade_retorno: int
    valor_medio_projetado: Decimal
    proximo_nivel_estimado: Optional[str] = None
    dias_para_proximo_nivel: Optional[int] = None
    recomendacoes: List[str]
    risco_cancelamento: str
    melhor_dia_para_contato: str
    melhor_horario_para_contato: str
    preferencias: dict
    insights: List[str]

class ROIPrograma(BaseModel):
    total_clientes: int
    receita_total: Decimal
    custos_resgates: Decimal
    roi_percentual: Decimal
    periodo_analise: int
    custo_por_cliente: Decimal
    receita_por_cliente: Decimal
    media_pontos_cliente: Decimal
    total_transacoes: int
    ticket_medio: Decimal
