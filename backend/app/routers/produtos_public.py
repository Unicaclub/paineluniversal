from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import logging

from ..database import get_db
from ..models import CategoriaProduto, Produto
from ..schemas.produtos import (
    ProdutoCreate, ProdutoUpdate, ProdutoResponse, ProdutoList,
    CategoriaCreate, CategoriaResponse, CategoriaList
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/produtos-public", tags=["produtos-public"])

# ============================
# ENDPOINTS PÚBLICOS PARA TESTE (SEM AUTENTICAÇÃO)
# ============================

@router.get("/", response_model=List[ProdutoResponse])
async def listar_produtos_publico(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    db: Session = Depends(get_db)
):
    """Listar produtos sem autenticação para teste"""
    try:
        logger.info("🔍 Listando produtos (modo público)")
        
        # Query simples sem filtros de usuário
        produtos = db.query(Produto).options(
            joinedload(Produto.categoria_produto)
        ).offset(skip).limit(limit).all()
        
        logger.info(f"✅ Encontrados {len(produtos)} produtos")
        return produtos
        
    except Exception as e:
        logger.error(f"❌ Erro ao listar produtos: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/", response_model=ProdutoResponse)
async def criar_produto_publico(
    produto: ProdutoCreate,
    db: Session = Depends(get_db)
):
    """Criar produto sem autenticação para teste"""
    try:
        logger.info(f"➕ Criando produto (modo público): {produto.nome}")
        
        # Criar produto básico
        produto_data = produto.dict()
        
        # Valores padrão para campos obrigatórios
        produto_data.update({
            "empresa_id": 1,  # ID padrão para teste
            "evento_id": None,
            "tipo": "PRODUTO",
            "status": "ATIVO",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        db_produto = Produto(**produto_data)
        
        db.add(db_produto)
        db.commit()
        db.refresh(db_produto)
        
        logger.info(f"✅ Produto criado: {db_produto.nome} (ID: {db_produto.id})")
        return db_produto
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao criar produto: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/categorias/", response_model=List[CategoriaResponse])
async def listar_categorias_publico(
    db: Session = Depends(get_db)
):
    """Listar categorias sem autenticação para teste"""
    try:
        logger.info("🔍 Listando categorias (modo público)")
        
        categorias = db.query(CategoriaProduto).all()
        
        logger.info(f"✅ Encontradas {len(categorias)} categorias")
        return categorias
        
    except Exception as e:
        logger.error(f"❌ Erro ao listar categorias: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/categorias/", response_model=CategoriaResponse)
async def criar_categoria_publico(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db)
):
    """Criar categoria sem autenticação para teste"""
    try:
        logger.info(f"➕ Criando categoria (modo público): {categoria.nome}")
        
        categoria_data = categoria.dict()
        categoria_data.update({
            "empresa_id": 1,  # ID padrão para teste
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        db_categoria = CategoriaProduto(**categoria_data)
        
        db.add(db_categoria)
        db.commit()
        db.refresh(db_categoria)
        
        logger.info(f"✅ Categoria criada: {db_categoria.nome} (ID: {db_categoria.id})")
        return db_categoria
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao criar categoria: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

# Endpoint de teste de conectividade
@router.get("/health")
async def health_check():
    """Endpoint para verificar se o sistema está funcionando"""
    return {
        "status": "ok",
        "message": "Sistema de produtos funcionando",
        "timestamp": datetime.utcnow().isoformat()
    }
