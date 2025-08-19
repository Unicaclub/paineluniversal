from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from ..models import ProdutoCategoria

router = APIRouter(prefix="/produtos", tags=["produtos"])

# Schemas simplificados
class CategoriaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    cor: Optional[str] = "#3b82f6"

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

# Endpoints de Categorias
@router.get("/categorias/", response_model=List[CategoriaResponse])
async def listar_categorias(db: Session = Depends(get_db)):
    """Listar todas as categorias"""
    try:
        categorias = db.query(ProdutoCategoria).filter(ProdutoCategoria.ativo == True).all()
        return categorias
    except Exception as e:
        print(f"ERRO ao listar categorias: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.post("/categorias/", response_model=CategoriaResponse)
async def criar_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    """Criar nova categoria"""
    try:
        # Verificar se já existe categoria com o mesmo nome
        categoria_existente = db.query(ProdutoCategoria).filter(
            ProdutoCategoria.nome == categoria.nome,
            ProdutoCategoria.ativo == True
        ).first()
        
        if categoria_existente:
            raise HTTPException(
                status_code=400, 
                detail="Já existe uma categoria com este nome"
            )
        
        nova_categoria = ProdutoCategoria(
            nome=categoria.nome,
            descricao=categoria.descricao,
            cor=categoria.cor or "#3b82f6",
            ativo=True
        )
        db.add(nova_categoria)
        db.commit()
        db.refresh(nova_categoria)
        return nova_categoria
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO ao criar categoria: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.get("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def obter_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Obter categoria por ID"""
    try:
        categoria = db.query(ProdutoCategoria).filter(ProdutoCategoria.id == categoria_id).first()
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoria não encontrada")
        return categoria
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO ao obter categoria {categoria_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.put("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def atualizar_categoria(categoria_id: int, categoria: CategoriaUpdate, db: Session = Depends(get_db)):
    """Atualizar categoria"""
    try:
        categoria_db = db.query(ProdutoCategoria).filter(ProdutoCategoria.id == categoria_id).first()
        if not categoria_db:
            raise HTTPException(status_code=404, detail="Categoria não encontrada")
        
        # Verificar se mudança de nome não conflita com categoria existente
        if categoria.nome and categoria.nome != categoria_db.nome:
            nome_existente = db.query(ProdutoCategoria).filter(
                ProdutoCategoria.nome == categoria.nome,
                ProdutoCategoria.ativo == True,
                ProdutoCategoria.id != categoria_id
            ).first()
            if nome_existente:
                raise HTTPException(
                    status_code=400, 
                    detail="Já existe uma categoria com este nome"
                )
        
        if categoria.nome is not None:
            categoria_db.nome = categoria.nome
        if categoria.descricao is not None:
            categoria_db.descricao = categoria.descricao
        if categoria.cor is not None:
            categoria_db.cor = categoria.cor
        
        categoria_db.atualizado_em = datetime.now()
        
        db.commit()
        db.refresh(categoria_db)
        return categoria_db
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO ao atualizar categoria {categoria_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.delete("/categorias/{categoria_id}")
async def deletar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Deletar categoria (desativação lógica)"""
    try:
        categoria = db.query(ProdutoCategoria).filter(ProdutoCategoria.id == categoria_id).first()
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoria não encontrada")
        
        # Verificar se categoria tem produtos associados
        # Adicionar verificação futura quando houver produtos
        
        # Desativação lógica
        categoria.ativo = False
        categoria.atualizado_em = datetime.now()
        
        db.commit()
        return {"message": "Categoria desativada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO ao deletar categoria {categoria_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
