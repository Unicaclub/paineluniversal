from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from decimal import Decimal
import logging

from ..database import get_db
from ..models import Produto, CategoriaProduto, TipoProduto, StatusProduto
from ..auth import obter_usuario_atual

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/produtos", tags=["produtos"])

# Schemas para API
class ProdutoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=255)
    descricao: Optional[str] = None
    preco: float = Field(..., gt=0)
    codigo_barras: Optional[str] = Field(None, max_length=50)
    categoria_id: Optional[int] = None
    tipo: str = "BEBIDA"
    estoque_atual: int = 0
    marca: Optional[str] = Field(None, max_length=100)
    fornecedor: Optional[str] = Field(None, max_length=200)
    preco_custo: Optional[float] = None
    margem_lucro: Optional[float] = None
    unidade_medida: str = "UN"
    volume: Optional[float] = None
    teor_alcoolico: Optional[float] = None
    temperatura_ideal: Optional[str] = None
    ncm: Optional[str] = Field(None, max_length=8)
    destaque: bool = False
    promocional: bool = False

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoResponse(ProdutoBase):
    id: int
    status: str
    criado_em: datetime
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

class CategoriaBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100)
    descricao: Optional[str] = None
    cor: str = "#3b82f6"

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id: int
    ativo: bool
    criado_em: datetime
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

# Endpoints de produtos
@router.get("/", response_model=List[ProdutoResponse])
async def listar_produtos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
    # current_user = Depends(obter_usuario_atual)  # Temporariamente removido
):
    """Listar produtos"""
    try:
        produtos = db.query(Produto).offset(skip).limit(limit).all()
        return produtos
    except Exception as e:
        logger.error(f"Erro ao listar produtos: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/", response_model=ProdutoResponse)
async def criar_produto(
    produto: ProdutoCreate,
    db: Session = Depends(get_db)
    # current_user = Depends(obter_usuario_atual)  # Temporariamente removido
):
    """Criar novo produto"""
    try:
        # Verificar se existe pelo menos um evento
        from ..models import Evento
        primeiro_evento = db.query(Evento).first()
        if not primeiro_evento:
            raise HTTPException(status_code=400, detail="Nenhum evento encontrado. Crie um evento primeiro.")
        
        # Verificar se categoria existe (se fornecida)
        if produto.categoria_id:
            categoria = db.query(CategoriaProduto).filter(CategoriaProduto.id == produto.categoria_id).first()
            if not categoria:
                raise HTTPException(status_code=400, detail="Categoria não encontrada")
        
        # Criar produto
        db_produto = Produto(
            nome=produto.nome,
            descricao=produto.descricao,
            preco=Decimal(str(produto.preco)),
            codigo_barras=produto.codigo_barras,
            categoria_id=produto.categoria_id,
            tipo=TipoProduto(produto.tipo),
            estoque_atual=produto.estoque_atual,
            marca=produto.marca,
            fornecedor=produto.fornecedor,
            preco_custo=Decimal(str(produto.preco_custo)) if produto.preco_custo else None,
            margem_lucro=Decimal(str(produto.margem_lucro)) if produto.margem_lucro else None,
            unidade_medida=produto.unidade_medida,
            volume=Decimal(str(produto.volume)) if produto.volume else None,
            teor_alcoolico=Decimal(str(produto.teor_alcoolico)) if produto.teor_alcoolico else None,
            temperatura_ideal=produto.temperatura_ideal,
            ncm=produto.ncm,
            destaque=produto.destaque,
            promocional=produto.promocional,
            status=StatusProduto.ATIVO,
            evento_id=primeiro_evento.id,  # Usar o primeiro evento disponível
            empresa_id=None
        )
        
        db.add(db_produto)
        db.commit()
        db.refresh(db_produto)
        
        logger.info(f"✅ Produto criado: {db_produto.nome} (ID: {db_produto.id})")
        return db_produto
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao criar produto: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar produto: {str(e)}")

# Endpoints de categorias
@router.get("/categorias/", response_model=List[CategoriaResponse])
async def listar_categorias(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
    # current_user = Depends(obter_usuario_atual)  # Temporariamente removido
):
    """Listar categorias"""
    try:
        categorias = db.query(CategoriaProduto).filter(CategoriaProduto.ativo == True).offset(skip).limit(limit).all()
        return categorias
    except Exception as e:
        logger.error(f"Erro ao listar categorias: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/categorias/", response_model=CategoriaResponse)
async def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db)
    # current_user = Depends(obter_usuario_atual)  # Temporariamente removido
):
    """Criar nova categoria"""
    try:
        # Verificar se existe pelo menos um evento
        from ..models import Evento
        primeiro_evento = db.query(Evento).first()
        if not primeiro_evento:
            raise HTTPException(status_code=400, detail="Nenhum evento encontrado. Crie um evento primeiro.")
        
        db_categoria = CategoriaProduto(
            nome=categoria.nome,
            descricao=categoria.descricao,
            cor=categoria.cor,
            evento_id=primeiro_evento.id,  # Usar o primeiro evento disponível
            empresa_id=None
        )
        
        db.add(db_categoria)
        db.commit()
        db.refresh(db_categoria)
        
        logger.info(f"✅ Categoria criada: {db_categoria.nome} (ID: {db_categoria.id})")
        return db_categoria
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao criar categoria: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar categoria: {str(e)}")

@router.get("/health")
async def produtos_health():
    """Health check para produtos"""
    return {
        "status": "produtos_healthy_v2",
        "timestamp": datetime.now(),
        "database": "connected",
        "endpoints": {
            "listar_produtos": "/api/produtos/",
            "criar_produto": "/api/produtos/",
            "listar_categorias": "/api/produtos/categorias/",
            "criar_categoria": "/api/produtos/categorias/"
        }
    }

logger.info("✅ Router produtos v2 com banco de dados configurado")
