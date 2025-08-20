# 🛒 ROUTER DE PRODUTOS - VERSÃO DEBUG SIMPLIFICADA
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Produto, CategoriaProduto, TipoProduto, StatusProduto
from ..auth import obter_usuario_atual
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Schemas simples para debug
from pydantic import BaseModel
from decimal import Decimal

class ProdutoSimple(BaseModel):
    id: int
    nome: str
    preco: float
    tipo: str
    
    class Config:
        from_attributes = True

class ProdutoCreate(BaseModel):
    nome: str
    descricao: str = ""
    preco: float
    tipo: str  # Vai ser convertido para enum
    evento_id: int
    categoria_id: int = None

# 🧪 ENDPOINT DE TESTE - Verificar se banco está acessível
@router.get("/produtos/test", response_model=dict)
async def test_produtos_db(db: Session = Depends(get_db)):
    """Teste simples de conexão com banco"""
    try:
        # Tentar contar produtos
        count = db.query(Produto).count()
        return {
            "status": "success",
            "message": "Banco acessível",
            "produtos_count": count,
            "tabela_existe": True
        }
    except Exception as e:
        logger.error(f"Erro no teste de banco: {e}")
        return {
            "status": "error", 
            "message": str(e),
            "tabela_existe": False
        }

# 📋 LISTAR PRODUTOS - Versão simplificada
@router.get("/produtos/", response_model=List[ProdutoSimple])
async def listar_produtos(db: Session = Depends(get_db)):
    """Listar todos os produtos - versão simplificada"""
    try:
        logger.info("Iniciando consulta de produtos")
        produtos = db.query(Produto).limit(10).all()  # Limitar para evitar sobrecarga
        logger.info(f"Produtos encontrados: {len(produtos)}")
        
        # Converter manualmente para evitar problemas de serialização
        resultado = []
        for produto in produtos:
            try:
                produto_dict = {
                    "id": produto.id,
                    "nome": produto.nome,
                    "preco": float(produto.preco) if produto.preco else 0.0,
                    "tipo": produto.tipo.value if hasattr(produto.tipo, 'value') else str(produto.tipo)
                }
                resultado.append(produto_dict)
            except Exception as e:
                logger.error(f"Erro ao serializar produto {produto.id}: {e}")
                continue
                
        return resultado
        
    except Exception as e:
        logger.error(f"Erro ao listar produtos: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

# ➕ CRIAR PRODUTO - Versão simplificada  
@router.post("/produtos/", response_model=ProdutoSimple)
async def criar_produto(
    produto_data: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Criar novo produto - versão simplificada"""
    try:
        logger.info(f"Criando produto: {produto_data.nome}")
        
        # Converter string para enum
        try:
            tipo_enum = TipoProduto(produto_data.tipo.upper())
        except ValueError:
            tipo_enum = TipoProduto.FISICO  # Default
        
        # Criar produto com campos mínimos
        novo_produto = Produto(
            nome=produto_data.nome,
            descricao=produto_data.descricao,
            preco=produto_data.preco,
            tipo=tipo_enum,
            evento_id=produto_data.evento_id,
            categoria_id=produto_data.categoria_id,
            status=StatusProduto.ATIVO,
            # Campos obrigatórios com defaults
            marca="",
            fornecedor="",
            unidade_medida="UN"
        )
        
        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)
        
        logger.info(f"Produto criado com sucesso: ID {novo_produto.id}")
        
        return {
            "id": novo_produto.id,
            "nome": novo_produto.nome,
            "preco": float(novo_produto.preco),
            "tipo": novo_produto.tipo.value
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar produto: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar produto: {str(e)}")

# 📂 ENDPOINTS DE CATEGORIAS (mantidos)
from ..schemas import CategoriaCreate, CategoriaResponse

@router.get("/categorias/", response_model=List[CategoriaResponse])
async def listar_categorias(db: Session = Depends(get_db)):
    """Listar todas as categorias"""
    categorias = db.query(CategoriaProduto).all()
    return categorias

@router.post("/categorias/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
async def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Criar nova categoria"""
    nova_categoria = CategoriaProduto(**categoria.dict())
    db.add(nova_categoria)
    db.commit()
    db.refresh(nova_categoria)
    return nova_categoria
