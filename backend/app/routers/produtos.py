from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import csv
import io
import json

from ..database import get_db
from ..models import ProdutoCategoria, Produto, TipoProduto, StatusProduto
from ..auth import obter_usuario_atual

router = APIRouter(tags=["produtos"])

# Schemas para Categorias
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

# Schemas para Produtos
class ProdutoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: TipoProduto
    preco: float
    codigo_barras: Optional[str] = None
    codigo_interno: Optional[str] = None
    estoque_atual: int = 0
    estoque_minimo: int = 0
    estoque_maximo: int = 1000
    controla_estoque: bool = True
    categoria_id: Optional[int] = None
    marca: Optional[str] = None
    fornecedor: Optional[str] = None
    unidade_medida: str = "UN"

class ProdutoCreate(ProdutoBase):
    evento_id: Optional[int] = 1  # Valor padrão para compatibilidade

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    tipo: Optional[TipoProduto] = None
    preco: Optional[float] = None
    codigo_barras: Optional[str] = None
    codigo_interno: Optional[str] = None
    estoque_atual: Optional[int] = None
    estoque_minimo: Optional[int] = None
    estoque_maximo: Optional[int] = None
    controla_estoque: Optional[bool] = None
    categoria_id: Optional[int] = None
    marca: Optional[str] = None
    fornecedor: Optional[str] = None
    unidade_medida: Optional[str] = None

class ProdutoResponse(ProdutoBase):
    id: int
    status: StatusProduto
    evento_id: int
    empresa_id: Optional[int] = None
    criado_em: Optional[datetime] = None
    atualizado_em: Optional[datetime] = None
    categoria_nome: Optional[str] = None

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

# Endpoint de teste para verificar conectividade
@router.get("/test")
async def test_produtos():
    """Endpoint de teste para produtos"""
    return {
        "message": "API de produtos funcionando!",
        "timestamp": datetime.now().isoformat(),
        "status": "ok"
    }

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

# Endpoints de Produtos
@router.get("/", response_model=List[ProdutoResponse])
async def listar_produtos(
    evento_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    categoria_id: Optional[int] = None,
    busca: Optional[str] = None,
    tipo: Optional[TipoProduto] = None,
    status: Optional[StatusProduto] = None,
    db: Session = Depends(get_db)
):
    """Lista produtos com filtros opcionais"""
    try:
        query = db.query(Produto)
        
        # Filtrar por evento se especificado
        if evento_id:
            query = query.filter(Produto.evento_id == evento_id)
        
        if categoria_id:
            query = query.filter(Produto.categoria_id == categoria_id)
        
        if busca:
            query = query.filter(
                Produto.nome.ilike(f"%{busca}%") |
                Produto.codigo_barras.ilike(f"%{busca}%") |
                Produto.codigo_interno.ilike(f"%{busca}%")
            )
        
        if tipo:
            query = query.filter(Produto.tipo == tipo)
            
        if status:
            query = query.filter(Produto.status == status)
        
        produtos = query.offset(skip).limit(limit).all()
        
        # Adiciona nome da categoria
        produtos_response = []
        for produto in produtos:
            produto_dict = produto.__dict__.copy()
            if produto.categoria_id:
                categoria = db.query(ProdutoCategoria).filter(
                    ProdutoCategoria.id == produto.categoria_id
                ).first()
                produto_dict['categoria_nome'] = categoria.nome if categoria else None
            else:
                produto_dict['categoria_nome'] = None
            produtos_response.append(produto_dict)
        
        return produtos_response
    except Exception as e:
        print(f"ERRO ao listar produtos: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.post("/", response_model=ProdutoResponse)
async def criar_produto(produto: ProdutoCreate, db: Session = Depends(get_db)):
    """Cria um novo produto"""
    try:
        # Verifica se categoria existe
        if produto.categoria_id:
            categoria = db.query(ProdutoCategoria).filter(
                ProdutoCategoria.id == produto.categoria_id,
                ProdutoCategoria.ativo == True
            ).first()
            if not categoria:
                raise HTTPException(status_code=404, detail="Categoria não encontrada")
        
        # Verifica se código de barras é único (se fornecido)
        if produto.codigo_barras:
            produto_existente = db.query(Produto).filter(
                Produto.codigo_barras == produto.codigo_barras
            ).first()
            if produto_existente and produto_existente.evento_id == produto.evento_id:
                raise HTTPException(status_code=400, detail="Código de barras já existe para este evento")
        
        # Verifica se código interno é único (se fornecido)
        if produto.codigo_interno:
            produto_existente = db.query(Produto).filter(
                Produto.codigo_interno == produto.codigo_interno
            ).first()
            if produto_existente and produto_existente.evento_id == produto.evento_id:
                raise HTTPException(status_code=400, detail="Código interno já existe para este evento")
        
        # Criar dados do produto
        produto_data = produto.dict()
        produto_data['status'] = StatusProduto.ATIVO
        
        # Se não tiver evento_id, usar um valor padrão ou atual
        if not produto_data.get('evento_id'):
            produto_data['evento_id'] = 1  # Valor padrão temporário
        
        print(f"💾 Criando produto: {produto_data}")
        
        db_produto = Produto(**produto_data)
        db.add(db_produto)
        db.commit()
        db.refresh(db_produto)
        
        print(f"✅ Produto criado com ID: {db_produto.id}")
        
        # Adiciona nome da categoria na resposta
        produto_dict = db_produto.__dict__.copy()
        if db_produto.categoria_id:
            categoria = db.query(ProdutoCategoria).filter(
                ProdutoCategoria.id == db_produto.categoria_id
            ).first()
            produto_dict['categoria_nome'] = categoria.nome if categoria else None
        else:
            produto_dict['categoria_nome'] = None
        
        return produto_dict
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERRO ao criar produto: {e}")
        print(f"Dados recebidos: {produto}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.get("/{produto_id}", response_model=ProdutoResponse)
async def obter_produto(produto_id: int, db: Session = Depends(get_db)):
    """Obtém um produto específico por ID"""
    try:
        produto = db.query(Produto).filter(Produto.id == produto_id).first()
        
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        # Adiciona nome da categoria
        produto_dict = produto.__dict__.copy()
        if produto.categoria_id:
            categoria = db.query(ProdutoCategoria).filter(
                ProdutoCategoria.id == produto.categoria_id
            ).first()
            produto_dict['categoria_nome'] = categoria.nome if categoria else None
        else:
            produto_dict['categoria_nome'] = None
        
        return produto_dict
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO ao obter produto {produto_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.put("/{produto_id}", response_model=ProdutoResponse)
async def atualizar_produto(produto_id: int, produto_update: ProdutoUpdate, db: Session = Depends(get_db)):
    """Atualiza um produto existente"""
    try:
        produto = db.query(Produto).filter(Produto.id == produto_id).first()
        
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        # Verifica se categoria existe (se fornecida)
        if produto_update.categoria_id:
            categoria = db.query(ProdutoCategoria).filter(
                ProdutoCategoria.id == produto_update.categoria_id,
                ProdutoCategoria.ativo == True
            ).first()
            if not categoria:
                raise HTTPException(status_code=404, detail="Categoria não encontrada")
        
        # Verifica códigos únicos se estão sendo alterados
        if produto_update.codigo_barras and produto_update.codigo_barras != produto.codigo_barras:
            produto_existente = db.query(Produto).filter(
                Produto.codigo_barras == produto_update.codigo_barras,
                Produto.evento_id == produto.evento_id,
                Produto.id != produto_id
            ).first()
            if produto_existente:
                raise HTTPException(status_code=400, detail="Código de barras já existe para este evento")
        
        if produto_update.codigo_interno and produto_update.codigo_interno != produto.codigo_interno:
            produto_existente = db.query(Produto).filter(
                Produto.codigo_interno == produto_update.codigo_interno,
                Produto.evento_id == produto.evento_id,
                Produto.id != produto_id
            ).first()
            if produto_existente:
                raise HTTPException(status_code=400, detail="Código interno já existe para este evento")
        
        update_data = produto_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(produto, field, value)
        
        produto.atualizado_em = datetime.now()
        
        db.commit()
        db.refresh(produto)
        
        # Adiciona nome da categoria na resposta
        produto_dict = produto.__dict__.copy()
        if produto.categoria_id:
            categoria = db.query(ProdutoCategoria).filter(
                ProdutoCategoria.id == produto.categoria_id
            ).first()
            produto_dict['categoria_nome'] = categoria.nome if categoria else None
        else:
            produto_dict['categoria_nome'] = None
        
        return produto_dict
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO ao atualizar produto {produto_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.delete("/{produto_id}")
async def deletar_produto(produto_id: int, db: Session = Depends(get_db)):
    """Deleta um produto (altera status para INATIVO)"""
    try:
        produto = db.query(Produto).filter(Produto.id == produto_id).first()
        
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        produto.status = StatusProduto.INATIVO
        produto.atualizado_em = datetime.now()
        db.commit()
        
        return {"message": "Produto deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO ao deletar produto {produto_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

# Endpoints de Importação/Exportação
@router.post("/importar/{evento_id}")
async def importar_produtos(
    evento_id: int,
    file: UploadFile = File(...),
    sobrescrever: bool = False,
    db: Session = Depends(get_db)
):
    """Importa produtos de um arquivo CSV"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser CSV")
        
        contents = await file.read()
        csv_content = contents.decode('utf-8')
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        produtos_criados = 0
        produtos_atualizados = 0
        erros = []
        
        for linha_num, linha in enumerate(csv_reader, start=2):
            try:
                # Campos obrigatórios
                nome = linha.get('nome', '').strip()
                preco = linha.get('preco', '0').strip()
                tipo = linha.get('tipo', 'PRODUTO').strip().upper()
                
                if not nome:
                    erros.append(f"Linha {linha_num}: Nome é obrigatório")
                    continue
                
                if not preco or preco == '0':
                    erros.append(f"Linha {linha_num}: Preço é obrigatório")
                    continue
                
                try:
                    preco_float = float(preco)
                except ValueError:
                    erros.append(f"Linha {linha_num}: Preço deve ser um número")
                    continue
                
                # Validar tipo
                try:
                    tipo_produto = TipoProduto(tipo)
                except ValueError:
                    tipo_produto = TipoProduto.PRODUTO
                
                # Buscar categoria por nome
                categoria_id = None
                categoria_nome = linha.get('categoria', '').strip()
                if categoria_nome:
                    categoria = db.query(ProdutoCategoria).filter(
                        ProdutoCategoria.nome.ilike(categoria_nome),
                        ProdutoCategoria.ativo == True
                    ).first()
                    if categoria:
                        categoria_id = categoria.id
                
                # Verificar se produto já existe
                codigo_barras = linha.get('codigo_barras', '').strip() or None
                codigo_interno = linha.get('codigo_interno', '').strip() or None
                
                produto_existente = None
                if codigo_barras:
                    produto_existente = db.query(Produto).filter(
                        Produto.codigo_barras == codigo_barras,
                        Produto.evento_id == evento_id
                    ).first()
                elif codigo_interno:
                    produto_existente = db.query(Produto).filter(
                        Produto.codigo_interno == codigo_interno,
                        Produto.evento_id == evento_id
                    ).first()
                
                if produto_existente and not sobrescrever:
                    erros.append(f"Linha {linha_num}: Produto já existe (use sobrescrever=true para atualizar)")
                    continue
                
                # Preparar dados do produto
                produto_data = {
                    'nome': nome,
                    'descricao': linha.get('descricao', '').strip() or None,
                    'tipo': tipo_produto,
                    'preco': preco_float,
                    'codigo_barras': codigo_barras,
                    'codigo_interno': codigo_interno,
                    'estoque_atual': int(linha.get('estoque_atual', '0') or '0'),
                    'estoque_minimo': int(linha.get('estoque_minimo', '0') or '0'),
                    'estoque_maximo': int(linha.get('estoque_maximo', '1000') or '1000'),
                    'controla_estoque': linha.get('controla_estoque', 'true').lower() == 'true',
                    'categoria_id': categoria_id,
                    'marca': linha.get('marca', '').strip() or None,
                    'fornecedor': linha.get('fornecedor', '').strip() or None,
                    'unidade_medida': linha.get('unidade_medida', 'UN').strip() or 'UN',
                    'evento_id': evento_id,
                    'status': StatusProduto.ATIVO
                }
                
                if produto_existente:
                    # Atualizar produto existente
                    for field, value in produto_data.items():
                        if field != 'evento_id':  # Não alterar evento_id
                            setattr(produto_existente, field, value)
                    produto_existente.atualizado_em = datetime.now()
                    produtos_atualizados += 1
                else:
                    # Criar novo produto
                    db_produto = Produto(**produto_data)
                    db.add(db_produto)
                    produtos_criados += 1
                
            except Exception as e:
                erros.append(f"Linha {linha_num}: Erro inesperado - {str(e)}")
        
        db.commit()
        
        return {
            "message": "Importação concluída",
            "produtos_criados": produtos_criados,
            "produtos_atualizados": produtos_atualizados,
            "erros": erros[:10]  # Limita a 10 erros para não sobrecarregar
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO na importação: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")

@router.get("/exportar/{evento_id}")
async def exportar_produtos(evento_id: int, db: Session = Depends(get_db)):
    """Exporta produtos de um evento para CSV"""
    try:
        produtos = db.query(Produto).filter(Produto.evento_id == evento_id).all()
        
        if not produtos:
            raise HTTPException(status_code=404, detail="Nenhum produto encontrado para este evento")
        
        # Criar CSV
        output = io.StringIO()
        fieldnames = [
            'nome', 'descricao', 'tipo', 'preco', 'codigo_barras', 'codigo_interno',
            'estoque_atual', 'estoque_minimo', 'estoque_maximo', 'controla_estoque',
            'categoria', 'marca', 'fornecedor', 'unidade_medida', 'status'
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for produto in produtos:
            categoria_nome = ""
            if produto.categoria_id:
                categoria = db.query(ProdutoCategoria).filter(
                    ProdutoCategoria.id == produto.categoria_id
                ).first()
                categoria_nome = categoria.nome if categoria else ""
            
            writer.writerow({
                'nome': produto.nome,
                'descricao': produto.descricao or '',
                'tipo': produto.tipo.value,
                'preco': produto.preco,
                'codigo_barras': produto.codigo_barras or '',
                'codigo_interno': produto.codigo_interno or '',
                'estoque_atual': produto.estoque_atual,
                'estoque_minimo': produto.estoque_minimo,
                'estoque_maximo': produto.estoque_maximo,
                'controla_estoque': produto.controla_estoque,
                'categoria': categoria_nome,
                'marca': produto.marca or '',
                'fornecedor': produto.fornecedor or '',
                'unidade_medida': produto.unidade_medida,
                'status': produto.status.value
            })
        
        csv_content = output.getvalue()
        output.close()
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=produtos.csv"}
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO na exportação: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao exportar produtos: {str(e)}")
