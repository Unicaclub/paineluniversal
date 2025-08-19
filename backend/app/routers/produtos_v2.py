from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/produtos", tags=["produtos"])

# Schemas básicos inline
class ProdutoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco: float = 0.0

class ProdutoCreate(ProdutoBase):
    categoria_id: Optional[int] = None

class ProdutoResponse(ProdutoBase):
    id: int
    ativo: bool = True
    criado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

class CategoriaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(CategoriaBase):
    id: int
    ativo: bool = True
    criado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

# Endpoints básicos para teste
@router.get("/")
async def listar_produtos():
    """Listar produtos - endpoint básico"""
    return {
        "message": "Endpoint de produtos funcionando!",
        "total": 0,
        "produtos": []
    }

@router.get("/categorias/")
async def listar_categorias():
    """Listar categorias - endpoint básico"""
    return {
        "message": "Endpoint de categorias funcionando!",
        "total": 0,
        "categorias": []
    }

@router.post("/")
async def criar_produto(produto: ProdutoCreate):
    """Criar produto - endpoint básico"""
    return {
        "message": "Produto criado com sucesso!",
        "produto": {
            "id": 1,
            "nome": produto.nome,
            "descricao": produto.descricao,
            "preco": produto.preco,
            "ativo": True,
            "criado_em": datetime.now()
        }
    }

@router.post("/categorias/")
async def criar_categoria(categoria: CategoriaCreate):
    """Criar categoria - endpoint básico"""
    return {
        "message": "Categoria criada com sucesso!",
        "categoria": {
            "id": 1,
            "nome": categoria.nome,
            "descricao": categoria.descricao,
            "ativo": True,
            "criado_em": datetime.now()
        }
    }

@router.get("/health")
async def produtos_health():
    """Health check para produtos"""
    return {
        "status": "produtos_healthy",
        "timestamp": datetime.now(),
        "endpoints": {
            "listar_produtos": "/api/produtos/",
            "listar_categorias": "/api/produtos/categorias/",
            "criar_produto": "/api/produtos/",
            "criar_categoria": "/api/produtos/categorias/"
        }
    }

logger.info("✅ Router produtos simples configurado")
