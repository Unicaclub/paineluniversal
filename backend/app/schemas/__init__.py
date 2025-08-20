# Schemas package

# Import direto dos schemas principais, evitando circular import
# Usando import absoluto para evitar conflito com o arquivo schemas.py

try:
    # Tentar importar do módulo principal
    import sys
    import os
    
    # Adicionar o diretório app ao path se necessário
    app_dir = os.path.dirname(os.path.dirname(__file__))
    if app_dir not in sys.path:
        sys.path.insert(0, app_dir)
    
    # Import dos schemas do arquivo schemas.py
    from app.schemas import (
        # Auth schemas
        Token,
        TokenData, 
        LoginRequest,
        
        # Usuario schemas
        UsuarioBase,
        UsuarioCreate,
        UsuarioRegister,
        Usuario,
        
        # Evento schemas
        EventoBase,
        EventoCreate,
        Evento,
        EventoDetalhado,
        EventoFiltros,
        PromoterEventoCreate,
        PromoterEventoResponse,
        
        # Outros schemas necessários
        Empresa,
        EmpresaCreate,
        EmpresaUpdate,
        Lista,
        ListaCreate,
        ListaUpdate,
        ListaDetalhada,
        DashboardListas,
        Convidado,
        ConvidadoCreate,
        ConvidadoUpdate,
        ConvidadoImport,
        Transacao,
        TransacaoCreate,
        TransacaoUpdate,
        Checkin,
        CheckinCreate,
        CheckinUpdate,
        Cupom,
        CupomCreate,
        CupomUpdate,
    )
    
except ImportError as e:
    # Fallback: definir schemas básicos necessários
    from pydantic import BaseModel
    from typing import Optional
    from datetime import datetime
    
    class Token(BaseModel):
        access_token: str
        token_type: str
    
    class TokenData(BaseModel):
        username: Optional[str] = None
    
    class LoginRequest(BaseModel):
        cpf: str
        senha: str
    
    class UsuarioBase(BaseModel):
        nome: str
        email: str
        
    class UsuarioCreate(UsuarioBase):
        password: str
        
    class UsuarioRegister(BaseModel):
        nome: str
        email: str
        password: str
        
    class Usuario(UsuarioBase):
        id: int
        ativo: bool
        
        class Config:
            from_attributes = True
    
    # Schemas de Evento (mínimos para funcionar)
    class EventoBase(BaseModel):
        nome: str
        data_evento: datetime
        
    class EventoCreate(EventoBase):
        pass
        
    class Evento(EventoBase):
        id: int
        
        class Config:
            from_attributes = True
    
    class EventoDetalhado(Evento):
        pass
    
    class EventoFiltros(BaseModel):
        nome: Optional[str] = None
    
    class PromoterEventoCreate(BaseModel):
        evento_id: int
        
    class PromoterEventoResponse(BaseModel):
        id: int
        evento_id: int
        
    # Schemas básicos para outros módulos
    class Empresa(BaseModel):
        id: int
        nome: str
        
    class EmpresaCreate(BaseModel):
        nome: str
        
    class EmpresaUpdate(BaseModel):
        nome: Optional[str] = None
        
    # Lista schemas
    class Lista(BaseModel):
        id: int
        nome: str
        
        class Config:
            from_attributes = True
            
    class ListaCreate(BaseModel):
        nome: str
        
    class ListaUpdate(BaseModel):
        nome: Optional[str] = None
        
    class ListaDetalhada(Lista):
        convidados_count: int = 0
        
    class DashboardListas(BaseModel):
        total_listas: int = 0
        
    # Convidado schemas
    class Convidado(BaseModel):
        id: int
        nome: str
        
        class Config:
            from_attributes = True
            
    class ConvidadoCreate(BaseModel):
        nome: str
        
    class ConvidadoUpdate(BaseModel):
        nome: Optional[str] = None
        
    class ConvidadoImport(BaseModel):
        nome: str
        
    # Transacao schemas
    class Transacao(BaseModel):
        id: int
        valor: float
        
        class Config:
            from_attributes = True
            
    class TransacaoCreate(BaseModel):
        valor: float
        
    class TransacaoUpdate(BaseModel):
        valor: Optional[float] = None
        
    # Checkin schemas
    class Checkin(BaseModel):
        id: int
        data_checkin: datetime
        
        class Config:
            from_attributes = True
            
    class CheckinCreate(BaseModel):
        data_checkin: datetime
        
    class CheckinUpdate(BaseModel):
        data_checkin: Optional[datetime] = None
        
    # Cupom schemas
    class Cupom(BaseModel):
        id: int
        codigo: str
        
        class Config:
            from_attributes = True
            
    class CupomCreate(BaseModel):
        codigo: str
        
    class CupomUpdate(BaseModel):
        codigo: Optional[str] = None
        
    class CupomResponse(BaseModel):
        id: int
        codigo: str
        desconto_percentual: Optional[float] = None
        desconto_valor: Optional[float] = None
        lista_nome: str = ""
        evento_nome: str = ""
        
        class Config:
            from_attributes = True
        
    # Dashboard schemas
    class DashboardResumo(BaseModel):
        total_eventos: int = 0
        total_usuarios: int = 0
        total_checkins: int = 0
        receita_total: float = 0.0
        
    class RankingPromoter(BaseModel):
        id: int
        nome: str
        total_vendas: float = 0.0
        
    class DashboardAvancado(BaseModel):
        resumo: DashboardResumo
        ranking_promoters: list = []
        
    class FiltrosDashboard(BaseModel):
        data_inicio: Optional[datetime] = None
        data_fim: Optional[datetime] = None
        evento_id: Optional[int] = None
        
    class RankingPromoterAvancado(BaseModel):
        id: int
        nome: str
        total_vendas: float = 0.0
        total_clientes: int = 0
        
    class DadosGrafico(BaseModel):
        labels: list = []
        datasets: list = []
        
    class RankingPromoterLista(BaseModel):
        id: int
        nome: str
        total_vendas: float = 0.0
        posicao: int = 1
        
    # Relatórios schemas
    class RelatorioVendas(BaseModel):
        evento_id: int
        nome_evento: str
        total_vendas: int = 0
        receita_total: float = 0.0
        vendas_por_lista: list = []
        vendas_por_promoter: list = []
        
    # Gamificação schemas
    class ConquistaBase(BaseModel):
        nome: str
        descricao: str
        tipo: str = "vendas"
        criterio_valor: int = 1
        badge_nivel: str = "bronze"
        icone: Optional[str] = None
        
    class ConquistaCreate(ConquistaBase):
        pass
        
    class Conquista(ConquistaBase):
        id: int
        ativa: bool = True
        criado_em: Optional[datetime] = None
        
        class Config:
            from_attributes = True
            
    class PromoterConquistaResponse(BaseModel):
        id: int
        conquista_nome: str
        conquista_descricao: str
        badge_nivel: str
        
        class Config:
            from_attributes = True
            
    class MetricaPromoterResponse(BaseModel):
        promoter_id: int
        promoter_nome: str
        evento_id: Optional[int] = None
        evento_nome: Optional[str] = None
        periodo_inicio: Optional[datetime] = None
        periodo_fim: Optional[datetime] = None
        total_vendas: int = 0
        receita_gerada: float = 0.0
        total_convidados: int = 0
        total_presentes: int = 0
        taxa_presenca: float = 0.0
        taxa_conversao: float = 0.0
        crescimento_vendas: float = 0.0
        posicao_vendas: Optional[int] = None
        posicao_presenca: Optional[int] = None
        posicao_geral: Optional[int] = None
        badge_atual: str = "bronze"
        conquistas_recentes: list = []
        
        class Config:
            from_attributes = True
            
    class RankingGamificado(BaseModel):
        promoter_id: int
        nome_promoter: str
        avatar_url: Optional[str] = None
        badge_principal: str = "bronze"
        nivel_experiencia: int = 1
        total_vendas: int = 0
        receita_gerada: float = 0.0
        taxa_presenca: float = 0.0
        taxa_conversao: float = 0.0
        crescimento_mensal: float = 0.0
        posicao_atual: int = 1
        posicao_anterior: Optional[int] = None
        conquistas_total: int = 0
        conquistas_mes: int = 0
        eventos_ativos: int = 0
        streak_vendas: int = 0
        pontuacao_total: int = 0
        
    class DashboardGamificacao(BaseModel):
        ranking_geral: list = []
        conquistas_recentes: list = []
        metricas_periodo: dict = {}
        badges_disponiveis: list = []
        alertas_gamificacao: list = []
        estatisticas_gerais: dict = {}
        
    class FiltrosRanking(BaseModel):
        evento_id: Optional[int] = None
        periodo_inicio: Optional[datetime] = None
        periodo_fim: Optional[datetime] = None
        badge_nivel: Optional[str] = None
        tipo_ranking: Optional[str] = "geral"
        limit: int = 20
        
    # PDV schemas
    class ProdutoBase(BaseModel):
        nome: str
        descricao: Optional[str] = None
        preco: float = 0.0
        codigo_barras: Optional[str] = None
        estoque_atual: int = 0
        
    class ProdutoCreate(ProdutoBase):
        evento_id: int
        
    class Produto(ProdutoBase):
        id: int
        evento_id: int = 0
        
        class Config:
            from_attributes = True
            
    class ComandaBase(BaseModel):
        numero_comanda: str
        cpf_cliente: Optional[str] = None
        
    class ComandaCreate(ComandaBase):
        evento_id: int
        
    class Comanda(ComandaBase):
        id: int
        saldo: float = 0.0
        
        class Config:
            from_attributes = True
            
    class VendaPDVBase(BaseModel):
        valor_total: float = 0.0
        
    class VendaPDVCreate(VendaPDVBase):
        comanda_id: int
        
    class VendaPDV(VendaPDVBase):
        id: int
        
        class Config:
            from_attributes = True
            
    class RecargaComandaBase(BaseModel):
        valor: float = 0.0
        
    class RecargaComandaCreate(RecargaComandaBase):
        comanda_id: int
        
    class RecargaComanda(RecargaComandaBase):
        id: int
        
        class Config:
            from_attributes = True
            
    class CaixaPDVBase(BaseModel):
        valor_inicial: float = 0.0
        
    class CaixaPDVCreate(CaixaPDVBase):
        evento_id: int
        
    class CaixaPDV(CaixaPDVBase):
        id: int
        
        class Config:
            from_attributes = True
            
    class RelatorioVendasPDV(BaseModel):
        total_vendas: float = 0.0
        total_produtos: int = 0
        
    class DashboardPDV(BaseModel):
        vendas_hoje: int = 0
        valor_vendas_hoje: float = 0.0
        produtos_em_falta: int = 0
        comandas_ativas: int = 0
        caixas_abertos: int = 0
        vendas_por_hora: list = []
        produtos_mais_vendidos: list = []
        alertas: list = []

# Re-export para compatibilidade
__all__ = [
    "Token",
    "TokenData", 
    "LoginRequest",
    "UsuarioBase",
    "UsuarioCreate", 
    "UsuarioRegister",
    "Usuario",
    "EventoBase",
    "EventoCreate",
    "Evento", 
    "EventoDetalhado",
    "EventoFiltros",
    "PromoterEventoCreate",
    "PromoterEventoResponse",
    "Empresa",
    "EmpresaCreate",
    "EmpresaUpdate",
    "Lista",
    "ListaCreate",
    "ListaUpdate",
    "ListaDetalhada",
    "DashboardListas",
    "Convidado",
    "ConvidadoCreate",
    "ConvidadoUpdate",
    "ConvidadoImport",
    "Transacao",
    "TransacaoCreate",
    "TransacaoUpdate",
    "Checkin",
    "CheckinCreate",
    "CheckinUpdate",
    "Cupom",
    "CupomCreate",
    "CupomUpdate",
    "CupomResponse",
    "DashboardResumo",
    "RankingPromoter",
    "DashboardAvancado",
    "FiltrosDashboard",
    "RankingPromoterAvancado",
    "DadosGrafico",
    "RankingPromoterLista",
    "RelatorioVendas",
    "ProdutoBase",
    "ProdutoCreate", 
    "Produto",
    "ComandaBase",
    "ComandaCreate",
    "Comanda",
    "VendaPDVBase",
    "VendaPDVCreate",
    "VendaPDV",
    "RecargaComandaBase",
    "RecargaComandaCreate",
    "RecargaComanda",
    "CaixaPDVBase",
    "CaixaPDVCreate",
    "CaixaPDV",
    "RelatorioVendasPDV",
    "DashboardPDV",
    "ConquistaBase",
    "ConquistaCreate",
    "Conquista",
    "PromoterConquistaResponse",
    "MetricaPromoterResponse",
    "RankingGamificado",
    "DashboardGamificacao",
    "FiltrosRanking",
]
