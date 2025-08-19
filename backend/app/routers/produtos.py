from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import csv
import io
import json
import sys

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

# Endpoint simplificado para criar produtos sem validações complexas
@router.post("/simple")
async def criar_produto_simples(
    nome: str,
    preco: float,
    tipo: str = "PRODUTO",
    db: Session = Depends(get_db)
):
    """Endpoint simplificado para criar produtos"""
    try:
        print(f"🚀 Criando produto simples: {nome}, preço: {preco}")
        
        # Criar produto com dados mínimos
        novo_produto = Produto(
            nome=nome,
            preco=preco,
            tipo=TipoProduto.PRODUTO,
            evento_id=1,  # Valor padrão
            status=StatusProduto.ATIVO,
            estoque_atual=0,
            estoque_minimo=0,
            estoque_maximo=1000,
            controla_estoque=True,
            unidade_medida="UN"
        )
        
        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)
        
        print(f"✅ Produto criado com ID: {novo_produto.id}")
        
        return {
            "id": novo_produto.id,
            "nome": novo_produto.nome,
            "preco": float(novo_produto.preco),
            "tipo": novo_produto.tipo.value,
            "status": novo_produto.status.value,
            "message": "Produto criado com sucesso!"
        }
        
    except Exception as e:
        print(f"❌ ERRO ao criar produto simples: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

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
async def criar_produto(produto_data: dict, db: Session = Depends(get_db)):
    """Cria um novo produto - Endpoint flexível que aceita qualquer estrutura"""
    try:
        print(f"💾 Dados recebidos: {produto_data}")
        
        # Extrair campos obrigatórios
        nome = produto_data.get('nome')
        preco = produto_data.get('preco') or produto_data.get('valor', 0)
        
        if not nome:
            raise HTTPException(status_code=400, detail="Nome é obrigatório")
        
        if not preco or preco <= 0:
            raise HTTPException(status_code=400, detail="Preço deve ser maior que zero")
        
        # Determinar tipo do produto
        tipo_str = produto_data.get('tipo', 'PRODUTO').upper()
        try:
            tipo_produto = TipoProduto(tipo_str)
        except ValueError:
            tipo_produto = TipoProduto.PRODUTO
        
        # Determinar evento_id
        evento_id = produto_data.get('evento_id', 1)
        
        # Verifica se categoria existe
        categoria_id = produto_data.get('categoria_id')
        if categoria_id:
            categoria = db.query(ProdutoCategoria).filter(
                ProdutoCategoria.id == categoria_id,
                ProdutoCategoria.ativo == True
            ).first()
            if not categoria:
                print(f"⚠️ Categoria {categoria_id} não encontrada, criando produto sem categoria")
                categoria_id = None
        
        # Verificar códigos únicos
        codigo_barras = produto_data.get('codigo_barras')
        codigo_interno = produto_data.get('codigo_interno') or produto_data.get('codigo')
        
        if codigo_barras:
            existente = db.query(Produto).filter(
                Produto.codigo_barras == codigo_barras,
                Produto.evento_id == evento_id
            ).first()
            if existente:
                raise HTTPException(status_code=400, detail="Código de barras já existe")
        
        if codigo_interno:
            existente = db.query(Produto).filter(
                Produto.codigo_interno == codigo_interno,
                Produto.evento_id == evento_id
            ).first()
            if existente:
                raise HTTPException(status_code=400, detail="Código interno já existe")
        
        # Criar produto
        novo_produto = Produto(
            nome=nome,
            descricao=produto_data.get('descricao'),
            tipo=tipo_produto,
            preco=float(preco),
            codigo_barras=codigo_barras,
            codigo_interno=codigo_interno,
            estoque_atual=int(produto_data.get('estoque_atual', 0)),
            estoque_minimo=int(produto_data.get('estoque_minimo', 0)),
            estoque_maximo=int(produto_data.get('estoque_maximo', 1000)),
            controla_estoque=bool(produto_data.get('controla_estoque', True)),
            categoria_id=categoria_id,
            marca=produto_data.get('marca'),
            fornecedor=produto_data.get('fornecedor'),
            unidade_medida=produto_data.get('unidade_medida', 'UN'),
            evento_id=evento_id,
            status=StatusProduto.ATIVO,
            destaque=bool(produto_data.get('destaque', False)),
            promocional=bool(produto_data.get('promocional', False))
        )
        
        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)
        
        print(f"✅ Produto criado com ID: {novo_produto.id}")
        
        # Preparar resposta
        resposta = {
            "id": novo_produto.id,
            "nome": novo_produto.nome,
            "descricao": novo_produto.descricao,
            "tipo": novo_produto.tipo,
            "preco": float(novo_produto.preco),
            "codigo_barras": novo_produto.codigo_barras,
            "codigo_interno": novo_produto.codigo_interno,
            "estoque_atual": novo_produto.estoque_atual,
            "estoque_minimo": novo_produto.estoque_minimo,
            "estoque_maximo": novo_produto.estoque_maximo,
            "controla_estoque": novo_produto.controla_estoque,
            "categoria_id": novo_produto.categoria_id,
            "marca": novo_produto.marca,
            "fornecedor": novo_produto.fornecedor,
            "unidade_medida": novo_produto.unidade_medida,
            "status": novo_produto.status,
            "evento_id": novo_produto.evento_id,
            "empresa_id": novo_produto.empresa_id,
            "criado_em": novo_produto.criado_em,
            "atualizado_em": novo_produto.atualizado_em,
            "categoria_nome": None
        }
        
        # Adicionar nome da categoria se existir
        if novo_produto.categoria_id:
            categoria = db.query(ProdutoCategoria).filter(
                ProdutoCategoria.id == novo_produto.categoria_id
            ).first()
            if categoria:
                resposta["categoria_nome"] = categoria.nome
        
        return resposta
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERRO ao criar produto: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
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
@router.post("/importar")
async def importar_produtos_simples(
    file: UploadFile = File(...),
    evento_id: int = 1,
    sobrescrever: bool = False,
    db: Session = Depends(get_db)
):
    """Importa produtos de um arquivo CSV - Versão simplificada"""
    try:
        print(f"📁 Iniciando importação do arquivo: {file.filename}")
        
        if not file.filename.lower().endswith('.csv'):
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
                nome = linha.get('nome', '').strip()
                preco_str = linha.get('preco', '0').strip()
                
                if not nome:
                    erros.append(f"Linha {linha_num}: Nome é obrigatório")
                    continue
                
                try:
                    preco = float(preco_str.replace(',', '.'))
                except (ValueError, AttributeError):
                    erros.append(f"Linha {linha_num}: Preço inválido")
                    continue
                
                if preco <= 0:
                    erros.append(f"Linha {linha_num}: Preço deve ser maior que zero")
                    continue
                
                # Criar produto simples
                novo_produto = Produto(
                    nome=nome,
                    preco=preco,
                    tipo=TipoProduto.PRODUTO,
                    evento_id=evento_id,
                    status=StatusProduto.ATIVO,
                    descricao=linha.get('descricao', '').strip() or None,
                    codigo_barras=linha.get('codigo_barras', '').strip() or None,
                    codigo_interno=linha.get('codigo_interno', '').strip() or None,
                    estoque_atual=int(linha.get('estoque_atual', '0') or '0'),
                    estoque_minimo=int(linha.get('estoque_minimo', '0') or '0'),
                    estoque_maximo=int(linha.get('estoque_maximo', '1000') or '1000'),
                    controla_estoque=True,
                    unidade_medida=linha.get('unidade_medida', 'UN').strip() or 'UN'
                )
                
                db.add(novo_produto)
                produtos_criados += 1
                
                if produtos_criados % 50 == 0:  # Commit a cada 50 produtos
                    db.commit()
                    print(f"📦 {produtos_criados} produtos processados...")
                
            except Exception as linha_erro:
                erros.append(f"Linha {linha_num}: {str(linha_erro)}")
                if len(erros) > 100:  # Limitar erros para não sobrecarregar
                    break
        
        # Commit final
        db.commit()
        
        resultado = {
            "message": "Importação concluída",
            "produtos_criados": produtos_criados,
            "produtos_atualizados": produtos_atualizados,
            "total_erros": len(erros),
            "erros": erros[:20]  # Primeiros 20 erros
        }
        
        print(f"✅ Importação finalizada: {resultado}")
        return resultado
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERRO na importação: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")

@router.get("/exportar")
async def exportar_produtos_simples(
    evento_id: int = None,
    db: Session = Depends(get_db)
):
    """Exporta produtos para CSV - Versão simplificada"""
    try:
        print(f"📤 Iniciando exportação de produtos...")
        
        # Buscar produtos
        query = db.query(Produto)
        if evento_id:
            query = query.filter(Produto.evento_id == evento_id)
        
        produtos = query.all()
        
        if not produtos:
            raise HTTPException(status_code=404, detail="Nenhum produto encontrado")
        
        # Criar CSV
        output = io.StringIO()
        fieldnames = [
            'id', 'nome', 'descricao', 'tipo', 'preco', 'codigo_barras', 'codigo_interno',
            'estoque_atual', 'estoque_minimo', 'estoque_maximo', 'unidade_medida', 'status'
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for produto in produtos:
            writer.writerow({
                'id': produto.id,
                'nome': produto.nome,
                'descricao': produto.descricao or '',
                'tipo': produto.tipo.value,
                'preco': float(produto.preco),
                'codigo_barras': produto.codigo_barras or '',
                'codigo_interno': produto.codigo_interno or '',
                'estoque_atual': produto.estoque_atual,
                'estoque_minimo': produto.estoque_minimo,
                'estoque_maximo': produto.estoque_maximo,
                'unidade_medida': produto.unidade_medida,
                'status': produto.status.value
            })
        
        csv_content = output.getvalue()
        output.close()
        
        filename = f"produtos_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        print(f"✅ Exportação concluída: {len(produtos)} produtos")
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERRO na exportação: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao exportar produtos: {str(e)}")
