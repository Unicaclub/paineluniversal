from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from ..database import get_db
from ..models import Produto, CategoriaProduto, TipoProduto, StatusProduto
from ..auth import obter_usuario_atual

router = APIRouter(prefix="/produtos", tags=["produtos"])

# Schemas para produtos
class ProdutoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=255)
    descricao: Optional[str] = None
    tipo: str = Field(..., description="Tipo do produto: BEBIDA, COMIDA, INGRESSO, FICHA, COMBO, VOUCHER")
    preco: float = Field(..., ge=0)
    categoria_id: Optional[int] = None
    codigo_barras: Optional[str] = None
    estoque_atual: int = Field(0, ge=0)
    evento_id: int = Field(..., description="ID do evento obrigatório")

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    preco: Optional[float] = None
    categoria_id: Optional[int] = None
    codigo_barras: Optional[str] = None
    estoque_atual: Optional[int] = None

class ProdutoResponse(BaseModel):
    id: int
    nome: str
    descricao: Optional[str] = None
    tipo: str
    preco: float
    evento_id: int
    categoria_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# Schemas de categorias
class CategoriaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    cor: Optional[str] = "#3b82f6"
    evento_id: int

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    cor: Optional[str] = None

class CategoriaResponse(CategoriaBase):
    id: int
    ativo: bool = True
    criado_em: Optional[datetime] = None
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

# ===============================
# ENDPOINTS DE PRODUTOS
# ===============================

@router.get("/", response_model=List[ProdutoResponse])
async def listar_produtos(
    evento_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Listar produtos"""
    try:
        # Usar query mais simples sem relacionamentos para debug
        query = db.query(Produto).options(
            # Não carregar relacionamentos que podem estar causando problemas
        )
        
        if evento_id:
            query = query.filter(Produto.evento_id == evento_id)
        
        produtos = query.all()
        print(f"📋 Encontrados {len(produtos)} produtos")
        
        # Verificar se há produtos para debug
        for produto in produtos:
            print(f"📦 Produto: {produto.nome} (ID: {produto.id}, Tipo: {produto.tipo})")
        
        return produtos
        
    except Exception as e:
        print(f"❌ Erro ao listar produtos: {e}")
        print(f"🔍 Tipo do erro: {type(e)}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar produtos: {str(e)}")

@router.post("/", response_model=ProdutoResponse)
async def criar_produto(
    produto: ProdutoCreate,
    db: Session = Depends(get_db)
):
    """Criar novo produto"""
    try:
        print(f"🆕 Criando produto: {produto.nome}")
        print(f"📊 Dados recebidos: {produto.model_dump()}")
        
        # Verificar se tipo é válido
        try:
            tipo_produto = TipoProduto(produto.tipo.upper())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo inválido. Use: {[t.value for t in TipoProduto]}"
            )
        
        # Verificar se código de barras já existe
        if produto.codigo_barras:
            produto_existente = db.query(Produto).filter(
                Produto.codigo_barras == produto.codigo_barras
            ).first()
            if produto_existente:
                raise HTTPException(
                    status_code=400,
                    detail="Código de barras já existe"
                )
        
        # Criar produto
        novo_produto = Produto(
            nome=produto.nome,
            descricao=produto.descricao,
            tipo=tipo_produto,
            preco=produto.preco,
            categoria_id=produto.categoria_id,
            codigo_barras=produto.codigo_barras,
            estoque_atual=produto.estoque_atual,
            evento_id=produto.evento_id,
            status=StatusProduto.ATIVO
        )
        
        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)
        
        print(f"✅ Produto criado com sucesso: ID {novo_produto.id}")
        return novo_produto
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar produto: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar produto: {str(e)}"
        )

@router.get("/{produto_id}", response_model=ProdutoResponse)
async def obter_produto(produto_id: int, db: Session = Depends(get_db)):
    """Obter produto por ID"""
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@router.put("/{produto_id}", response_model=ProdutoResponse)
async def atualizar_produto(
    produto_id: int, 
    produto: ProdutoUpdate, 
    db: Session = Depends(get_db)
):
    """Atualizar produto"""
    try:
        produto_db = db.query(Produto).filter(Produto.id == produto_id).first()
        if not produto_db:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        # Atualizar campos fornecidos
        if produto.nome is not None:
            produto_db.nome = produto.nome
        if produto.descricao is not None:
            produto_db.descricao = produto.descricao
        if produto.tipo is not None:
            produto_db.tipo = TipoProduto(produto.tipo.upper())
        if produto.preco is not None:
            produto_db.preco = produto.preco
        if produto.categoria_id is not None:
            produto_db.categoria_id = produto.categoria_id
        if produto.codigo_barras is not None:
            produto_db.codigo_barras = produto.codigo_barras
        if produto.estoque_atual is not None:
            produto_db.estoque_atual = produto.estoque_atual
        
        db.commit()
        db.refresh(produto_db)
        
        print(f"✅ Produto atualizado: ID {produto_id}")
        return produto_db
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao atualizar produto: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar produto: {str(e)}")

@router.delete("/{produto_id}")
async def deletar_produto(produto_id: int, db: Session = Depends(get_db)):
    """Deletar produto"""
    try:
        produto = db.query(Produto).filter(Produto.id == produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        db.delete(produto)
        db.commit()
        
        print(f"🗑️ Produto deletado: ID {produto_id}")
        return {"message": "Produto deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao deletar produto: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao deletar produto: {str(e)}")

# ===============================
# ENDPOINTS DE CATEGORIAS
# ===============================

@router.get("/categorias/", response_model=List[CategoriaResponse])
async def listar_categorias(
    evento_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Listar categorias"""
    try:
        query = db.query(CategoriaProduto).filter(CategoriaProduto.ativo == True)
        if evento_id:
            query = query.filter(CategoriaProduto.evento_id == evento_id)
        
        categorias = query.all()
        return categorias
    except Exception as e:
        print(f"❌ Erro ao listar categorias: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar categorias: {str(e)}")

@router.post("/categorias/", response_model=CategoriaResponse)
async def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db)
):
    """Criar nova categoria"""
    try:
        nova_categoria = CategoriaProduto(
            nome=categoria.nome,
            descricao=categoria.descricao,
            cor=categoria.cor,
            evento_id=categoria.evento_id,
            ativo=True
        )
        
        db.add(nova_categoria)
        db.commit()
        db.refresh(nova_categoria)
        
        return nova_categoria
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar categoria: {str(e)}")

@router.get("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def obter_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Obter categoria por ID"""
    categoria = db.query(CategoriaProduto).filter(CategoriaProduto.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return categoria

@router.put("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def atualizar_categoria(
    categoria_id: int, 
    categoria: CategoriaUpdate, 
    db: Session = Depends(get_db)
):
    """Atualizar categoria"""
    try:
        categoria_db = db.query(CategoriaProduto).filter(CategoriaProduto.id == categoria_id).first()
        if not categoria_db:
            raise HTTPException(status_code=404, detail="Categoria não encontrada")
        
        if categoria.nome:
            categoria_db.nome = categoria.nome
        if categoria.descricao:
            categoria_db.descricao = categoria.descricao
        if categoria.cor:
            categoria_db.cor = categoria.cor
        
        db.commit()
        db.refresh(categoria_db)
        return categoria_db
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar categoria: {str(e)}")

@router.delete("/categorias/{categoria_id}")
async def deletar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Deletar categoria"""
    try:
        categoria = db.query(CategoriaProduto).filter(CategoriaProduto.id == categoria_id).first()
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoria não encontrada")
        
        categoria.ativo = False  # Soft delete
        db.commit()
        
        return {"message": "Categoria deletada com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar categoria: {str(e)}")
