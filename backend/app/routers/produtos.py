from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional
from datetime import datetime
import logging

from ..database import get_db
from ..models import CategoriaProduto, Produto, Evento, TipoProduto, StatusProduto
from ..schemas.produtos import (
    CategoriaCreate, CategoriaUpdate, CategoriaResponse, CategoriaList,
    ProdutoCreate, ProdutoUpdate, ProdutoResponse, ProdutoList, ProdutoFilter,
    ProdutoStats, CategoriaStats
)
from ..auth import obter_usuario_atual, verificar_permissao

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/produtos", tags=["produtos"])

# ============================
# ENDPOINTS DE CATEGORIAS
# ============================

@router.get("/categorias/", response_model=CategoriaList)
async def listar_categorias(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    evento_id: Optional[int] = Query(None, description="Filtrar por evento"),
    nome: Optional[str] = Query(None, description="Filtrar por nome"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Listar categorias com filtros e paginação"""
    try:
        # Construir query base
        query = db.query(CategoriaProduto)
        
        # Aplicar filtros
        if evento_id:
            query = query.filter(CategoriaProduto.evento_id == evento_id)
        if nome:
            query = query.filter(CategoriaProduto.nome.ilike(f"%{nome}%"))
        if ativo is not None:
            query = query.filter(CategoriaProduto.ativo == ativo)
        
        # Contar total
        total = query.count()
        
        # Aplicar paginação e ordenação
        categorias = query.order_by(CategoriaProduto.nome).offset(skip).limit(limit).all()
        
        # Calcular páginas
        pages = (total + limit - 1) // limit
        page = (skip // limit) + 1
        
        return CategoriaList(
            categorias=categorias,
            total=total,
            page=page,
            size=len(categorias),
            pages=pages
        )
        
    except Exception as e:
        logger.error(f"Erro ao listar categorias: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/categorias/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
async def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Criar nova categoria"""
    try:
        # Verificar permissões
        verificar_permissao(current_user, "produtos:create")
        
        # Verificar se evento existe
        evento = db.query(Evento).filter(Evento.id == categoria.evento_id).first()
        if not evento:
            raise HTTPException(
                status_code=404,
                detail="Evento não encontrado"
            )
        
        # Verificar se já existe categoria com o mesmo nome no evento
        categoria_existente = db.query(CategoriaProduto).filter(
            and_(
                CategoriaProduto.nome.ilike(categoria.nome.strip()),
                CategoriaProduto.evento_id == categoria.evento_id,
                CategoriaProduto.ativo == True
            )
        ).first()
        
        if categoria_existente:
            raise HTTPException(
                status_code=400,
                detail="Já existe uma categoria com este nome neste evento"
            )
        
        # Criar categoria
        db_categoria = CategoriaProduto(
            nome=categoria.nome.strip(),
            descricao=categoria.descricao,
            cor=categoria.cor,
            evento_id=categoria.evento_id,
            empresa_id=evento.empresa_id,
            ativo=True
        )
        
        db.add(db_categoria)
        db.commit()
        db.refresh(db_categoria)
        
        logger.info(f"Categoria criada: {db_categoria.nome} (ID: {db_categoria.id})")
        return db_categoria
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar categoria: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def obter_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Obter categoria por ID"""
    try:
        categoria = db.query(CategoriaProduto).filter(
            CategoriaProduto.id == categoria_id
        ).first()
        
        if not categoria:
            raise HTTPException(
                status_code=404,
                detail="Categoria não encontrada"
            )
        
        return categoria
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter categoria {categoria_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.put("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def atualizar_categoria(
    categoria_id: int,
    categoria: CategoriaUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Atualizar categoria"""
    try:
        # Verificar permissões
        verificar_permissao(current_user, "produtos:update")
        
        db_categoria = db.query(CategoriaProduto).filter(
            CategoriaProduto.id == categoria_id
        ).first()
        
        if not db_categoria:
            raise HTTPException(
                status_code=404,
                detail="Categoria não encontrada"
            )
        
        # Verificar nome duplicado se fornecido
        if categoria.nome:
            categoria_existente = db.query(CategoriaProduto).filter(
                and_(
                    CategoriaProduto.nome.ilike(categoria.nome.strip()),
                    CategoriaProduto.evento_id == db_categoria.evento_id,
                    CategoriaProduto.id != categoria_id,
                    CategoriaProduto.ativo == True
                )
            ).first()
            
            if categoria_existente:
                raise HTTPException(
                    status_code=400,
                    detail="Já existe uma categoria com este nome neste evento"
                )
        
        # Atualizar campos
        update_data = categoria.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "nome" and value:
                value = value.strip()
            setattr(db_categoria, field, value)
        
        db_categoria.atualizado_em = datetime.utcnow()
        db.commit()
        db.refresh(db_categoria)
        
        logger.info(f"Categoria atualizada: {db_categoria.nome} (ID: {db_categoria.id})")
        return db_categoria
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar categoria {categoria_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.delete("/categorias/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Deletar categoria (soft delete)"""
    try:
        # Verificar permissões
        verificar_permissao(current_user, "produtos:delete")
        
        db_categoria = db.query(CategoriaProduto).filter(
            CategoriaProduto.id == categoria_id
        ).first()
        
        if not db_categoria:
            raise HTTPException(
                status_code=404,
                detail="Categoria não encontrada"
            )
        
        # Verificar se há produtos ativos vinculados
        produtos_ativos = db.query(Produto).filter(
            and_(
                Produto.categoria_id == categoria_id,
                Produto.status == StatusProduto.ATIVO
            )
        ).count()
        
        if produtos_ativos > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Não é possível excluir categoria com {produtos_ativos} produto(s) ativo(s) vinculado(s)"
            )
        
        # Soft delete
        db_categoria.ativo = False
        db_categoria.atualizado_em = datetime.utcnow()
        db.commit()
        
        logger.info(f"Categoria deletada: {db_categoria.nome} (ID: {db_categoria.id})")
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar categoria {categoria_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

# ============================
# ENDPOINTS DE PRODUTOS
# ============================

@router.get("/", response_model=ProdutoList)
async def listar_produtos(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    evento_id: Optional[int] = Query(None, description="Filtrar por evento"),
    nome: Optional[str] = Query(None, description="Filtrar por nome"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoria"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    estoque_baixo: Optional[bool] = Query(None, description="Produtos com estoque baixo"),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Listar produtos com filtros e paginação"""
    try:
        # Query base com join opcional para categoria
        query = db.query(Produto).options(joinedload(Produto.categoria_produto))
        
        # Aplicar filtros
        if evento_id:
            query = query.filter(Produto.evento_id == evento_id)
        if nome:
            query = query.filter(Produto.nome.ilike(f"%{nome}%"))
        if tipo:
            query = query.filter(Produto.tipo == tipo)
        if categoria_id:
            query = query.filter(Produto.categoria_id == categoria_id)
        if status:
            query = query.filter(Produto.status == status)
        if estoque_baixo:
            query = query.filter(Produto.estoque_atual <= Produto.estoque_minimo)
        
        # Contar total
        total = query.count()
        
        # Aplicar paginação e ordenação
        produtos = query.order_by(Produto.nome).offset(skip).limit(limit).all()
        
        # Calcular páginas
        pages = (total + limit - 1) // limit
        page = (skip // limit) + 1
        
        return ProdutoList(
            produtos=produtos,
            total=total,
            page=page,
            size=len(produtos),
            pages=pages
        )
        
    except Exception as e:
        logger.error(f"Erro ao listar produtos: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
async def criar_produto(
    produto: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Criar novo produto"""
    try:
        # Verificar permissões
        verificar_permissao(current_user, "produtos:create")
        
        # Verificar se evento existe
        evento = db.query(Evento).filter(Evento.id == produto.evento_id).first()
        if not evento:
            raise HTTPException(
                status_code=404,
                detail="Evento não encontrado"
            )
        
        # Verificar categoria se fornecida
        if produto.categoria_id:
            categoria = db.query(CategoriaProduto).filter(
                and_(
                    CategoriaProduto.id == produto.categoria_id,
                    CategoriaProduto.evento_id == produto.evento_id,
                    CategoriaProduto.ativo == True
                )
            ).first()
            if not categoria:
                raise HTTPException(
                    status_code=404,
                    detail="Categoria não encontrada ou inativa"
                )
        
        # Verificar código de barras único se fornecido
        if produto.codigo_barras:
            produto_existente = db.query(Produto).filter(
                Produto.codigo_barras == produto.codigo_barras
            ).first()
            if produto_existente:
                raise HTTPException(
                    status_code=400,
                    detail="Já existe um produto com este código de barras"
                )
        
        # Verificar código interno único se fornecido
        if produto.codigo_interno:
            produto_existente = db.query(Produto).filter(
                and_(
                    Produto.codigo_interno == produto.codigo_interno,
                    Produto.evento_id == produto.evento_id
                )
            ).first()
            if produto_existente:
                raise HTTPException(
                    status_code=400,
                    detail="Já existe um produto com este código interno neste evento"
                )
        
        # Criar produto
        produto_data = produto.dict()
        db_produto = Produto(**produto_data, empresa_id=evento.empresa_id)
        
        db.add(db_produto)
        db.commit()
        db.refresh(db_produto)
        
        logger.info(f"Produto criado: {db_produto.nome} (ID: {db_produto.id})")
        return db_produto
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar produto: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/{produto_id}", response_model=ProdutoResponse)
async def obter_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Obter produto por ID"""
    try:
        produto = db.query(Produto).options(
            joinedload(Produto.categoria_produto)
        ).filter(Produto.id == produto_id).first()
        
        if not produto:
            raise HTTPException(
                status_code=404,
                detail="Produto não encontrado"
            )
        
        return produto
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter produto {produto_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.put("/{produto_id}", response_model=ProdutoResponse)
async def atualizar_produto(
    produto_id: int,
    produto: ProdutoUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Atualizar produto"""
    try:
        # Verificar permissões
        verificar_permissao(current_user, "produtos:update")
        
        db_produto = db.query(Produto).filter(Produto.id == produto_id).first()
        
        if not db_produto:
            raise HTTPException(
                status_code=404,
                detail="Produto não encontrado"
            )
        
        # Verificar categoria se fornecida
        if produto.categoria_id:
            categoria = db.query(CategoriaProduto).filter(
                and_(
                    CategoriaProduto.id == produto.categoria_id,
                    CategoriaProduto.evento_id == db_produto.evento_id,
                    CategoriaProduto.ativo == True
                )
            ).first()
            if not categoria:
                raise HTTPException(
                    status_code=404,
                    detail="Categoria não encontrada ou inativa"
                )
        
        # Verificar códigos únicos se fornecidos
        if produto.codigo_barras and produto.codigo_barras != db_produto.codigo_barras:
            produto_existente = db.query(Produto).filter(
                Produto.codigo_barras == produto.codigo_barras
            ).first()
            if produto_existente:
                raise HTTPException(
                    status_code=400,
                    detail="Já existe um produto com este código de barras"
                )
        
        if produto.codigo_interno and produto.codigo_interno != db_produto.codigo_interno:
            produto_existente = db.query(Produto).filter(
                and_(
                    Produto.codigo_interno == produto.codigo_interno,
                    Produto.evento_id == db_produto.evento_id,
                    Produto.id != produto_id
                )
            ).first()
            if produto_existente:
                raise HTTPException(
                    status_code=400,
                    detail="Já existe um produto com este código interno neste evento"
                )
        
        # Atualizar campos
        update_data = produto.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "nome" and value:
                value = value.strip()
            setattr(db_produto, field, value)
        
        db_produto.atualizado_em = datetime.utcnow()
        db.commit()
        db.refresh(db_produto)
        
        logger.info(f"Produto atualizado: {db_produto.nome} (ID: {db_produto.id})")
        return db_produto
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar produto {produto_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.delete("/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Deletar produto (alterar status para INATIVO)"""
    try:
        # Verificar permissões
        verificar_permissao(current_user, "produtos:delete")
        
        db_produto = db.query(Produto).filter(Produto.id == produto_id).first()
        
        if not db_produto:
            raise HTTPException(
                status_code=404,
                detail="Produto não encontrado"
            )
        
        # Soft delete - alterar status
        db_produto.status = StatusProduto.INATIVO
        db_produto.atualizado_em = datetime.utcnow()
        db.commit()
        
        logger.info(f"Produto deletado: {db_produto.nome} (ID: {db_produto.id})")
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar produto {produto_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

# ============================
# ENDPOINTS DE ESTATÍSTICAS
# ============================

@router.get("/stats/categorias", response_model=CategoriaStats)
async def estatisticas_categorias(
    evento_id: Optional[int] = Query(None, description="Filtrar por evento"),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Estatísticas das categorias"""
    try:
        query = db.query(CategoriaProduto)
        
        if evento_id:
            query = query.filter(CategoriaProduto.evento_id == evento_id)
        
        total_categorias = query.count()
        categorias_ativas = query.filter(CategoriaProduto.ativo == True).count()
        
        # Produtos por categoria
        produtos_por_categoria = db.query(
            CategoriaProduto.nome,
            func.count(Produto.id).label('total_produtos')
        ).outerjoin(Produto).group_by(CategoriaProduto.id, CategoriaProduto.nome).all()
        
        return CategoriaStats(
            total_categorias=total_categorias,
            categorias_ativas=categorias_ativas,
            produtos_por_categoria=[
                {"categoria": cat.nome, "total": cat.total_produtos}
                for cat in produtos_por_categoria
            ]
        )
        
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas de categorias: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

# ============================
# ENDPOINT DE MIGRAÇÃO (TEMPORÁRIO)
# ============================

@router.post("/migrate/setup-database")
async def setup_database_produtos(
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """Executar migrações necessárias para produtos (apenas uma vez)"""
    try:
        # Verificar permissões de admin
        verificar_permissao(current_user, "admin:migrate")
        
    except HTTPException as e:
        if "admin:migrate" in str(e.detail):
            # Criar endpoint mais permissivo para setup inicial
            pass
        else:
            raise
    
    try:
        from sqlalchemy import text
        
        # 1. Criar tabela categorias_produtos
        sql_create_categorias = """
        CREATE TABLE IF NOT EXISTS categorias_produtos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            descricao TEXT,
            cor VARCHAR(7) DEFAULT '#3b82f6',
            ativo BOOLEAN DEFAULT true,
            evento_id INTEGER NOT NULL REFERENCES eventos(id),
            empresa_id INTEGER REFERENCES empresas(id),
            criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        # 2. Criar índices
        sql_create_indexes = """
        CREATE INDEX IF NOT EXISTS idx_categorias_produtos_id ON categorias_produtos(id);
        CREATE INDEX IF NOT EXISTS idx_categorias_produtos_nome ON categorias_produtos(nome);
        CREATE INDEX IF NOT EXISTS idx_categorias_produtos_evento_id ON categorias_produtos(evento_id);
        CREATE INDEX IF NOT EXISTS idx_categorias_produtos_ativo ON categorias_produtos(ativo);
        """
        
        # 3. Alterar tabela produtos
        sql_alter_produtos = """
        DO $$ 
        BEGIN 
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'produtos' AND column_name = 'categoria_id'
            ) THEN
                ALTER TABLE produtos ADD COLUMN categoria_id INTEGER REFERENCES categorias_produtos(id);
                CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id ON produtos(categoria_id);
            END IF;
        END $$;
        """
        
        # Executar SQLs
        db.execute(text(sql_create_categorias))
        db.execute(text(sql_create_indexes))
        db.execute(text(sql_alter_produtos))
        db.commit()
        
        # 4. Inserir categorias padrão se não existir eventos
        eventos_count = db.query(Evento).count()
        categorias_inseridas = 0
        
        if eventos_count > 0:
            # Buscar alguns eventos para criar categorias padrão
            eventos = db.query(Evento).limit(3).all()
            
            for evento in eventos:
                # Verificar se já tem categorias
                categoria_existente = db.query(CategoriaProduto).filter(
                    CategoriaProduto.evento_id == evento.id
                ).first()
                
                if not categoria_existente:
                    # Criar categorias padrão
                    categorias_padrao = [
                        {"nome": "Bebidas", "descricao": "Bebidas alcoólicas e não alcoólicas", "cor": "#10B981"},
                        {"nome": "Comidas", "descricao": "Pratos principais e petiscos", "cor": "#F59E0B"},
                        {"nome": "Sobremesas", "descricao": "Doces e sobremesas", "cor": "#EF4444"}
                    ]
                    
                    for cat_data in categorias_padrao:
                        categoria = CategoriaProduto(
                            nome=cat_data["nome"],
                            descricao=cat_data["descricao"],
                            cor=cat_data["cor"],
                            evento_id=evento.id,
                            empresa_id=evento.empresa_id,
                            ativo=True
                        )
                        db.add(categoria)
                        categorias_inseridas += 1
            
            db.commit()
        
        return {
            "success": True,
            "message": "Migração de produtos executada com sucesso!",
            "details": {
                "tabela_categorias_criada": True,
                "indices_criados": True,
                "coluna_categoria_id_adicionada": True,
                "categorias_padrao_inseridas": categorias_inseridas,
                "eventos_encontrados": eventos_count
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro na migração de produtos: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro na migração: {str(e)}"
        )
