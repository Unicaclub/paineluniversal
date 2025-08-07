from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from .models import StatusEvento, TipoLista, StatusTransacao, TipoUsuario
import re

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
    empresa_id: int
    
    @validator('cpf')
    def validar_cpf(cls, v):
        cpf = re.sub(r'\D', '', v)
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

class Usuario(UsuarioBase):
    id: int
    ativo: bool
    empresa_id: int
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
    empresa_id: int

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

class ListaCreate(ListaBase):
    evento_id: int
    promoter_id: Optional[int] = None

class Lista(ListaBase):
    id: int
    vendas_realizadas: int
    ativa: bool
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
