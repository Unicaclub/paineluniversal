from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal

router = APIRouter(prefix="/produtos", tags=["produtos"])

# Schemas simplificados para produtos
class ProdutoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=200)
    descricao: Optional[str] = None
    preco: Decimal = Field(..., ge=0)
    categoria_id: Optional[int] = None
    codigo_barras: Optional[str] = None
    estoque_atual: int = Field(0, ge=0)
    ativo: bool = True

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    preco: Optional[Decimal] = None
    categoria_id: Optional[int] = None
    codigo_barras: Optional[str] = None
    estoque_atual: Optional[int] = None
    ativo: Optional[bool] = None

class ProdutoResponse(ProdutoBase):
    id: int
    criado_em: Optional[datetime] = None
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schemas de categorias (mantido como estava)
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

# Mock data para desenvolvimento
mock_categorias = [
    {
        "id": 1,
        "nome": "Bebidas",
        "descricao": "Bebidas alcoólicas e não alcoólicas",
        "cor": "#10B981",
        "ativo": True,
        "criado_em": datetime.now(),
        "atualizado_em": datetime.now()
    },
    {
        "id": 2,
        "nome": "Comidas",
        "descricao": "Pratos principais e petiscos",
        "cor": "#F59E0B",
        "ativo": True,
        "criado_em": datetime.now(),
        "atualizado_em": datetime.now()
    }
]

mock_produtos = [
    {
        "id": 1,
        "nome": "Cerveja Long Neck",
        "descricao": "Cerveja premium 355ml",
        "preco": Decimal("8.50"),
        "categoria_id": 1,
        "codigo_barras": "7891234567890",
        "estoque_atual": 100,
        "ativo": True,
        "criado_em": datetime.now(),
        "atualizado_em": datetime.now()
    },
    {
        "id": 2,
        "nome": "Hambúrguer Artesanal",
        "descricao": "Hambúrguer com carne 180g",
        "preco": Decimal("25.90"),
        "categoria_id": 2,
        "codigo_barras": "7891234567891",
        "estoque_atual": 50,
        "ativo": True,
        "criado_em": datetime.now(),
        "atualizado_em": datetime.now()
    }
]

# ===============================
# ENDPOINTS DE PRODUTOS
# ===============================

@router.get("/", response_model=List[ProdutoResponse])
async def listar_produtos():
    """Listar todos os produtos"""
    return mock_produtos

@router.post("/", response_model=ProdutoResponse)
async def criar_produto(produto: ProdutoCreate):
    """Criar novo produto"""
    print(f"🆕 Criando produto: {produto.nome}")
    
    # Verificar se código de barras já existe
    if produto.codigo_barras:
        for p in mock_produtos:
            if p.get("codigo_barras") == produto.codigo_barras:
                raise HTTPException(
                    status_code=400,
                    detail="Código de barras já existe"
                )
    
    novo_produto = {
        "id": len(mock_produtos) + 1,
        "nome": produto.nome,
        "descricao": produto.descricao,
        "preco": produto.preco,
        "categoria_id": produto.categoria_id,
        "codigo_barras": produto.codigo_barras,
        "estoque_atual": produto.estoque_atual,
        "ativo": produto.ativo,
        "criado_em": datetime.now(),
        "atualizado_em": datetime.now()
    }
    
    mock_produtos.append(novo_produto)
    print(f"✅ Produto criado com sucesso: {novo_produto}")
    return novo_produto

@router.get("/{produto_id}", response_model=ProdutoResponse)
async def obter_produto(produto_id: int):
    """Obter produto por ID"""
    produto = next((p for p in mock_produtos if p["id"] == produto_id), None)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@router.put("/{produto_id}", response_model=ProdutoResponse)
async def atualizar_produto(produto_id: int, produto: ProdutoUpdate):
    """Atualizar produto"""
    for i, p in enumerate(mock_produtos):
        if p["id"] == produto_id:
            # Atualizar campos fornecidos
            if produto.nome is not None:
                mock_produtos[i]["nome"] = produto.nome
            if produto.descricao is not None:
                mock_produtos[i]["descricao"] = produto.descricao
            if produto.preco is not None:
                mock_produtos[i]["preco"] = produto.preco
            if produto.categoria_id is not None:
                mock_produtos[i]["categoria_id"] = produto.categoria_id
            if produto.codigo_barras is not None:
                mock_produtos[i]["codigo_barras"] = produto.codigo_barras
            if produto.estoque_atual is not None:
                mock_produtos[i]["estoque_atual"] = produto.estoque_atual
            if produto.ativo is not None:
                mock_produtos[i]["ativo"] = produto.ativo
            
            mock_produtos[i]["atualizado_em"] = datetime.now()
            print(f"✅ Produto atualizado: {mock_produtos[i]}")
            return mock_produtos[i]
    
    raise HTTPException(status_code=404, detail="Produto não encontrado")

@router.delete("/{produto_id}")
async def deletar_produto(produto_id: int):
    """Deletar produto"""
    for i, p in enumerate(mock_produtos):
        if p["id"] == produto_id:
            del mock_produtos[i]
            print(f"🗑️ Produto deletado: ID {produto_id}")
            return {"message": "Produto deletado com sucesso"}
    raise HTTPException(status_code=404, detail="Produto não encontrado")

# ===============================
# ENDPOINTS DE CATEGORIAS
# ===============================

@router.get("/categorias/", response_model=List[CategoriaResponse])
async def listar_categorias():
    """Listar todas as categorias"""
    return mock_categorias

@router.post("/categorias/", response_model=CategoriaResponse)
async def criar_categoria(categoria: CategoriaCreate):
    """Criar nova categoria"""
    nova_categoria = {
        "id": len(mock_categorias) + 1,
        "nome": categoria.nome,
        "descricao": categoria.descricao,
        "cor": categoria.cor,
        "ativo": True,
        "criado_em": datetime.now(),
        "atualizado_em": datetime.now()
    }
    mock_categorias.append(nova_categoria)
    return nova_categoria

@router.get("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def obter_categoria(categoria_id: int):
    """Obter categoria por ID"""
    categoria = next((c for c in mock_categorias if c["id"] == categoria_id), None)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return categoria

@router.put("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def atualizar_categoria(categoria_id: int, categoria: CategoriaUpdate):
    """Atualizar categoria"""
    for i, c in enumerate(mock_categorias):
        if c["id"] == categoria_id:
            if categoria.nome:
                mock_categorias[i]["nome"] = categoria.nome
            if categoria.descricao:
                mock_categorias[i]["descricao"] = categoria.descricao
            if categoria.cor:
                mock_categorias[i]["cor"] = categoria.cor
            mock_categorias[i]["atualizado_em"] = datetime.now()
            return mock_categorias[i]
    raise HTTPException(status_code=404, detail="Categoria não encontrada")

@router.delete("/categorias/{categoria_id}")
async def deletar_categoria(categoria_id: int):
    """Deletar categoria"""
    for i, c in enumerate(mock_categorias):
        if c["id"] == categoria_id:
            del mock_categorias[i]
            return {"message": "Categoria deletada com sucesso"}
    raise HTTPException(status_code=404, detail="Categoria não encontrada")
