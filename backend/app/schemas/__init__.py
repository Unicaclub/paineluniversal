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
        email: str
        password: str
    
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
]
