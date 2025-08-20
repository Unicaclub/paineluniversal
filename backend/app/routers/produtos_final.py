# 🛒 ROUTER DE PRODUTOS - VERSÃO PRODUÇÃO
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from ..database import get_db
from ..models import Produto, CategoriaProduto, TipoProduto, StatusProduto, Evento
from ..auth import obter_usuario_atual
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# =====================
# SCHEMAS PYDANTIC
# =====================
from pydantic import BaseModel

class ProdutoBase(BaseModel):
    nome: str
    descricao: Optional[str] = ""
    preco: float
    tipo: str
    categoria_id: Optional[int] = None

class ProdutoCreate(BaseModel):
    """Schema para criação de produto - SEM evento_id"""
    nome: str
    descricao: Optional[str] = ""
    preco: float
    tipo: str = "FISICO"
    categoria_id: Optional[int] = None

class ProdutoResponse(BaseModel):
    """Schema para resposta de produto - campos essenciais"""
    id: int
    nome: str
    descricao: Optional[str] = ""
    preco: float
    tipo: str
    categoria_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class CategoriaBase(BaseModel):
    nome: str
    descricao: Optional[str] = ""
    cor: Optional[str] = "#3b82f6"
    evento_id: int

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(BaseModel):
    id: int
    nome: str
    descricao: Optional[str] = ""
    cor: Optional[str] = "#3b82f6"
    evento_id: int
    ativo: bool = True
    
    class Config:
        from_attributes = True

# =====================
# ENDPOINTS DE PRODUTOS
# =====================

@router.get("/produtos/", response_model=List[ProdutoResponse])
async def listar_produtos(
    evento_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Listar todos os produtos do sistema
    """
    try:
        logger.info("🔍 Listando produtos...")
        
        query = db.query(Produto)
        if evento_id:
            query = query.filter(Produto.evento_id == evento_id)
        
        produtos = query.all()
        logger.info(f"📦 Encontrados {len(produtos)} produtos")
        
        # Converter para resposta manualmente para garantir compatibilidade
        resultado = []
        for produto in produtos:
            try:
                produto_dict = {
                    "id": produto.id,
                    "nome": produto.nome,
                    "descricao": produto.descricao or "",
                    "preco": float(produto.preco) if produto.preco else 0.0,
                    "tipo": produto.tipo.value if hasattr(produto.tipo, 'value') else str(produto.tipo),
                    "evento_id": produto.evento_id,
                    "categoria_id": produto.categoria_id
                }
                resultado.append(produto_dict)
            except Exception as e:
                logger.error(f"❌ Erro ao serializar produto {produto.id}: {e}")
                continue
        
        return resultado
        
    except Exception as e:
        logger.error(f"❌ Erro ao listar produtos: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Erro interno do servidor: {str(e)}"
        )

@router.get("/produtos/{produto_id}", response_model=ProdutoResponse)
async def buscar_produto(produto_id: int, db: Session = Depends(get_db)):
    """
    Buscar produto específico por ID
    """
    try:
        produto = db.query(Produto).filter(Produto.id == produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        return {
            "id": produto.id,
            "nome": produto.nome,
            "descricao": produto.descricao or "",
            "preco": float(produto.preco) if produto.preco else 0.0,
            "tipo": produto.tipo.value if hasattr(produto.tipo, 'value') else str(produto.tipo),
            "evento_id": produto.evento_id,
            "categoria_id": produto.categoria_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao buscar produto {produto_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/produtos/", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
async def criar_produto(
    produto_data: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Criar novo produto no banco de dados
    """
    try:
        logger.info(f"🆕 Criando produto: {produto_data.nome}")
        logger.info(f"📊 Dados recebidos: {produto_data.model_dump()}")
        
        # Validar e converter tipo
        try:
            if produto_data.tipo.upper() in ["FISICO", "FÍSICO"]:
                tipo_enum = TipoProduto.FISICO
            elif produto_data.tipo.upper() == "DIGITAL":
                tipo_enum = TipoProduto.DIGITAL
            elif produto_data.tipo.upper() in ["SERVICO", "SERVIÇO"]:
                tipo_enum = TipoProduto.SERVICO
            else:
                tipo_enum = TipoProduto.FISICO  # Default
        except Exception:
            tipo_enum = TipoProduto.FISICO
        
        # Criar o produto com campos obrigatórios (SEM evento_id)
        novo_produto = Produto(
            nome=produto_data.nome,
            descricao=produto_data.descricao or "",
            preco=Decimal(str(produto_data.preco)),
            tipo=tipo_enum,
            categoria_id=produto_data.categoria_id,
            status=StatusProduto.ATIVO,
            # Campos com valores padrão para evitar erros de NULL
            marca="",
            fornecedor="",
            unidade_medida="UN",
            estoque_atual=0,
            estoque_minimo=0
        )
        
        # Salvar no banco
        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)
        
        logger.info(f"✅ Produto criado com sucesso! ID: {novo_produto.id}")
        
        # Retornar resposta
        return {
            "id": novo_produto.id,
            "nome": novo_produto.nome,
            "descricao": novo_produto.descricao,
            "preco": float(novo_produto.preco),
            "tipo": novo_produto.tipo.value,
            "evento_id": novo_produto.evento_id,
            "categoria_id": novo_produto.categoria_id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao criar produto: {e}")
        logger.error(f"🔍 Tipo do erro: {type(e)}")
        import traceback
        logger.error(f"📋 Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao criar produto: {str(e)}"
        )

@router.put("/produtos/{produto_id}", response_model=ProdutoResponse)
async def atualizar_produto(
    produto_id: int,
    produto_data: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Atualizar produto existente
    """
    try:
        produto = db.query(Produto).filter(Produto.id == produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        # Atualizar campos
        produto.nome = produto_data.nome
        produto.descricao = produto_data.descricao or ""
        produto.preco = Decimal(str(produto_data.preco))
        produto.evento_id = produto_data.evento_id
        produto.categoria_id = produto_data.categoria_id
        
        # Converter tipo
        try:
            if produto_data.tipo.upper() in ["FISICO", "FÍSICO"]:
                produto.tipo = TipoProduto.FISICO
            elif produto_data.tipo.upper() == "DIGITAL":
                produto.tipo = TipoProduto.DIGITAL
            elif produto_data.tipo.upper() in ["SERVICO", "SERVIÇO"]:
                produto.tipo = TipoProduto.SERVICO
        except Exception:
            pass  # Manter tipo atual se conversão falhar
        
        db.commit()
        db.refresh(produto)
        
        return {
            "id": produto.id,
            "nome": produto.nome,
            "descricao": produto.descricao,
            "preco": float(produto.preco),
            "tipo": produto.tipo.value,
            "evento_id": produto.evento_id,
            "categoria_id": produto.categoria_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao atualizar produto: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.delete("/produtos/{produto_id}")
async def deletar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Deletar produto
    """
    try:
        produto = db.query(Produto).filter(Produto.id == produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        db.delete(produto)
        db.commit()
        
        return {"message": "Produto deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao deletar produto: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# =====================
# ENDPOINTS DE CATEGORIAS
# =====================

@router.get("/categorias/", response_model=List[CategoriaResponse])
async def listar_categorias(
    evento_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Listar todas as categorias
    """
    try:
        query = db.query(CategoriaProduto)
        if evento_id:
            query = query.filter(CategoriaProduto.evento_id == evento_id)
        
        categorias = query.all()
        return categorias
        
    except Exception as e:
        logger.error(f"❌ Erro ao listar categorias: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.post("/categorias/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
async def criar_categoria(
    categoria_data: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Criar nova categoria
    """
    try:
        nova_categoria = CategoriaProduto(
            nome=categoria_data.nome,
            descricao=categoria_data.descricao or "",
            cor=categoria_data.cor or "#3b82f6",
            evento_id=categoria_data.evento_id,
            ativo=True
        )
        
        db.add(nova_categoria)
        db.commit()
        db.refresh(nova_categoria)
        
        return nova_categoria
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao criar categoria: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
