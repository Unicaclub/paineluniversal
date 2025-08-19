from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import logging
from io import StringIO, BytesIO
import csv
import json
import pandas as pd

from ..database import get_db
from ..models import Produto, ProdutoCategoria
from ..auth import obter_usuario_atual

router = APIRouter()
logger = logging.getLogger(__name__)

# ==================== INVENTORY POSITION ENDPOINTS ====================

@router.get("/inventory/position")
async def get_stock_position(
    product_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    location_id: Optional[int] = Query(None),
    q: Optional[str] = Query(None),
    with_zero_stock: Optional[bool] = Query(False),
    only_negative: Optional[bool] = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get stock positions with filters
    """
    try:
        # Por enquanto retornar dados mock até implementar estoque real
        mock_positions = [
            {
                "id": 1,
                "product": {
                    "id": 1,
                    "name": "Coca-Cola 350ml",
                    "code": "COCA350",
                    "barcode": "7894900011517",
                    "category": {"id": 1, "name": "Bebidas"},
                    "unit": {"id": 1, "name": "Unidade", "symbol": "UN"}
                },
                "location": {"id": 1, "name": "Estoque Principal", "code": "EST001"},
                "on_hand": 150,
                "reserved": 25,
                "available": 125,
                "cost_avg": 2.50,
                "value_total": 375.00,
                "last_movement_at": "2024-01-15T10:30:00"
            },
            {
                "id": 2,
                "product": {
                    "id": 2,
                    "name": "Guaraná Antarctica 350ml",
                    "code": "GUAR350",
                    "barcode": "7891991010344",
                    "category": {"id": 1, "name": "Bebidas"},
                    "unit": {"id": 1, "name": "Unidade", "symbol": "UN"}
                },
                "location": {"id": 1, "name": "Estoque Principal", "code": "EST001"},
                "on_hand": 200,
                "reserved": 50,
                "available": 150,
                "cost_avg": 2.30,
                "value_total": 460.00,
                "last_movement_at": "2024-01-15T09:15:00"
            }
        ]
        
        # Aplicar filtros básicos
        filtered_positions = mock_positions
        
        if q:
            filtered_positions = [
                pos for pos in filtered_positions
                if q.lower() in pos["product"]["name"].lower() or
                   q.lower() in pos["product"].get("code", "").lower()
            ]
        
        if category_id:
            filtered_positions = [
                pos for pos in filtered_positions
                if pos["product"]["category"]["id"] == category_id
            ]
            
        if product_id:
            filtered_positions = [
                pos for pos in filtered_positions
                if pos["product"]["id"] == product_id
            ]
        
        # Paginação simples
        total = len(filtered_positions)
        start = (page - 1) * page_size
        end = start + page_size
        items = filtered_positions[start:end]
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar posições de estoque: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

# ==================== STOCK MOVEMENTS ENDPOINTS ====================

@router.get("/inventory/movements")
async def get_stock_movements(
    product_id: Optional[int] = Query(None),
    location_id: Optional[int] = Query(None),
    movement_type: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    document_ref: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get stock movements with filters
    """
    try:
        # Dados mock de movimentações
        mock_movements = [
            {
                "id": 1,
                "type": "IN",
                "reference": "COMP001",
                "date": "2024-01-15T14:30:00",
                "location": {"id": 1, "name": "Estoque Principal"},
                "reason": {"id": 1, "name": "Compra", "type": "IN"},
                "notes": "Compra de bebidas para evento",
                "status": "CONFIRMED",
                "created_at": "2024-01-15T14:30:00",
                "lines": [
                    {
                        "id": 1,
                        "product": {
                            "id": 1,
                            "name": "Coca-Cola 350ml",
                            "code": "COCA350",
                            "unit": {"id": 1, "symbol": "UN"}
                        },
                        "quantity": 100,
                        "cost_unit": 2.50,
                        "cost_total": 250.00,
                        "notes": ""
                    }
                ]
            },
            {
                "id": 2,
                "type": "OUT",
                "reference": "VEND001",
                "date": "2024-01-15T16:45:00",
                "location": {"id": 1, "name": "Estoque Principal"},
                "reason": {"id": 2, "name": "Venda", "type": "OUT"},
                "notes": "Venda no evento Rock in Rio",
                "status": "CONFIRMED",
                "created_at": "2024-01-15T16:45:00",
                "lines": [
                    {
                        "id": 2,
                        "product": {
                            "id": 1,
                            "name": "Coca-Cola 350ml",
                            "code": "COCA350",
                            "unit": {"id": 1, "symbol": "UN"}
                        },
                        "quantity": 25,
                        "cost_unit": 2.50,
                        "cost_total": 62.50,
                        "notes": "PDV 001"
                    }
                ]
            }
        ]
        
        # Aplicar filtros
        filtered_movements = mock_movements
        
        if movement_type:
            filtered_movements = [
                mov for mov in filtered_movements
                if mov["type"] == movement_type
            ]
            
        if product_id:
            filtered_movements = [
                mov for mov in filtered_movements
                if any(line["product"]["id"] == product_id for line in mov.get("lines", []))
            ]
        
        # Paginação
        total = len(filtered_movements)
        start = (page - 1) * page_size
        end = start + page_size
        items = filtered_movements[start:end]
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar movimentações: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/inventory/movements")
async def create_stock_movement(
    movement_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Create a new stock movement
    """
    try:
        # Por enquanto apenas simular a criação
        logger.info(f"Criando movimentação de estoque: {movement_data}")
        
        # Retornar movimento criado (mock)
        new_movement = {
            "id": 999,
            "type": movement_data.get("movement_type", "IN"),
            "reference": f"MOV{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "date": datetime.now().isoformat(),
            "location": {"id": 1, "name": "Estoque Principal"},
            "reason": {"id": 1, "name": "Ajuste Manual", "type": movement_data.get("movement_type", "IN")},
            "notes": movement_data.get("notes", ""),
            "status": "CONFIRMED",
            "created_at": datetime.now().isoformat(),
            "lines": movement_data.get("lines", [])
        }
        
        return new_movement
        
    except Exception as e:
        logger.error(f"Erro ao criar movimentação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/inventory/movements/{movement_id}")
async def get_stock_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get a specific stock movement by ID
    """
    try:
        # Retornar movimento mock
        movement = {
            "id": movement_id,
            "type": "IN",
            "reference": f"MOV{movement_id:06d}",
            "date": "2024-01-15T14:30:00",
            "location": {"id": 1, "name": "Estoque Principal"},
            "reason": {"id": 1, "name": "Compra", "type": "IN"},
            "notes": f"Movimento ID {movement_id}",
            "status": "CONFIRMED",
            "created_at": "2024-01-15T14:30:00",
            "lines": []
        }
        
        return movement
        
    except Exception as e:
        logger.error(f"Erro ao buscar movimentação {movement_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimentação não encontrada"
        )

# ==================== AUTOCOMPLETE ENDPOINTS ====================

@router.get("/inventory/autocomplete/categories")
async def get_categories_autocomplete(
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get categories for autocomplete
    """
    try:
        query = db.query(ProdutoCategoria).filter(ProdutoCategoria.ativo == True)
        
        if q:
            query = query.filter(ProdutoCategoria.nome.ilike(f"%{q}%"))
        
        categories = query.order_by(ProdutoCategoria.nome).limit(20).all()
        
        return [
            {
                "id": cat.id,
                "name": cat.nome,
                "description": cat.descricao,
                "is_active": cat.ativo
            }
            for cat in categories
        ]
        
    except Exception as e:
        logger.error(f"Erro ao buscar categorias: {e}")
        # Retornar dados mock em caso de erro
        return [
            {"id": 1, "name": "Bebidas", "description": "Bebidas em geral", "is_active": True},
            {"id": 2, "name": "Comidas", "description": "Comidas em geral", "is_active": True},
            {"id": 3, "name": "Acessórios", "description": "Acessórios diversos", "is_active": True}
        ]

@router.get("/inventory/autocomplete/units")
async def get_units_autocomplete(
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get units for autocomplete
    """
    try:
        # Retornar unidades mock
        units = [
            {"id": 1, "name": "Unidade", "symbol": "UN", "factor_to_base": 1.0, "is_active": True},
            {"id": 2, "name": "Litro", "symbol": "L", "factor_to_base": 1.0, "is_active": True},
            {"id": 3, "name": "Quilograma", "symbol": "KG", "factor_to_base": 1.0, "is_active": True},
            {"id": 4, "name": "Metro", "symbol": "M", "factor_to_base": 1.0, "is_active": True},
            {"id": 5, "name": "Caixa", "symbol": "CX", "factor_to_base": 12.0, "is_active": True}
        ]
        
        if q:
            units = [unit for unit in units if q.lower() in unit["name"].lower() or q.lower() in unit["symbol"].lower()]
        
        return units
        
    except Exception as e:
        logger.error(f"Erro ao buscar unidades: {e}")
        return []

@router.get("/inventory/autocomplete/products")
async def get_products_autocomplete(
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get products for autocomplete
    """
    try:
        query = db.query(Produto).filter(Produto.ativo == True)
        
        if q:
            query = query.filter(
                or_(
                    Produto.nome.ilike(f"%{q}%"),
                    Produto.codigo.ilike(f"%{q}%"),
                    Produto.codigo_barras.ilike(f"%{q}%")
                )
            )
        
        products = query.order_by(Produto.nome).limit(20).all()
        
        return [
            {
                "id": prod.id,
                "name": prod.nome,
                "code": prod.codigo,
                "description": prod.descricao,
                "barcode": prod.codigo_barras,
                "category": {
                    "id": prod.categoria.id,
                    "name": prod.categoria.nome
                } if prod.categoria else None,
                "unit": {"id": 1, "name": "Unidade", "symbol": "UN"},  # Mock unit
                "is_active": prod.ativo
            }
            for prod in products
        ]
        
    except Exception as e:
        logger.error(f"Erro ao buscar produtos: {e}")
        # Retornar produtos mock em caso de erro
        return [
            {
                "id": 1,
                "name": "Coca-Cola 350ml",
                "code": "COCA350",
                "description": "Refrigerante de cola",
                "barcode": "7894900011517",
                "category": {"id": 1, "name": "Bebidas"},
                "unit": {"id": 1, "name": "Unidade", "symbol": "UN"},
                "is_active": True
            }
        ]

@router.get("/inventory/autocomplete/locations")
async def get_locations_autocomplete(
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get locations for autocomplete
    """
    try:
        # Retornar locais mock
        locations = [
            {"id": 1, "name": "Estoque Principal", "code": "EST001", "description": "Estoque principal da empresa", "is_active": True},
            {"id": 2, "name": "Estoque Secundário", "code": "EST002", "description": "Estoque secundário", "is_active": True},
            {"id": 3, "name": "PDV 001", "code": "PDV001", "description": "Ponto de venda 1", "is_active": True},
            {"id": 4, "name": "PDV 002", "code": "PDV002", "description": "Ponto de venda 2", "is_active": True}
        ]
        
        if q:
            locations = [
                loc for loc in locations 
                if q.lower() in loc["name"].lower() or q.lower() in loc.get("code", "").lower()
            ]
        
        return locations
        
    except Exception as e:
        logger.error(f"Erro ao buscar locais: {e}")
        return []

@router.get("/inventory/autocomplete/reasons")
async def get_movement_reasons_autocomplete(
    direction: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get movement reasons for autocomplete
    """
    try:
        # Retornar motivos mock
        all_reasons = [
            {"id": 1, "name": "Compra", "description": "Entrada por compra", "type": "IN", "is_active": True},
            {"id": 2, "name": "Ajuste Positivo", "description": "Ajuste de entrada", "type": "IN", "is_active": True},
            {"id": 3, "name": "Devolução", "description": "Devolução de cliente", "type": "IN", "is_active": True},
            {"id": 4, "name": "Venda", "description": "Saída por venda", "type": "OUT", "is_active": True},
            {"id": 5, "name": "Ajuste Negativo", "description": "Ajuste de saída", "type": "OUT", "is_active": True},
            {"id": 6, "name": "Quebra", "description": "Perda por quebra", "type": "OUT", "is_active": True},
            {"id": 7, "name": "Transferência", "description": "Transferência entre locais", "type": "BOTH", "is_active": True}
        ]
        
        # Filtrar por direção se especificada
        if direction:
            if direction == "in":
                reasons = [r for r in all_reasons if r["type"] in ["IN", "BOTH"]]
            elif direction == "out":
                reasons = [r for r in all_reasons if r["type"] in ["OUT", "BOTH"]]
            else:
                reasons = all_reasons
        else:
            reasons = all_reasons
        
        return reasons
        
    except Exception as e:
        logger.error(f"Erro ao buscar motivos: {e}")
        return []

# ==================== MANAGEMENT ENDPOINTS ====================

@router.get("/inventory/products")
async def get_all_products(
    category_id: Optional[int] = Query(None),
    q: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get all products with filters for management
    """
    try:
        query = db.query(Produto)
        
        # Aplicar filtros
        if category_id:
            query = query.filter(Produto.categoria_id == category_id)
        
        if q:
            query = query.filter(
                or_(
                    Produto.nome.ilike(f"%{q}%"),
                    Produto.codigo.ilike(f"%{q}%"),
                    Produto.codigo_barras.ilike(f"%{q}%")
                )
            )
        
        if is_active is not None:
            query = query.filter(Produto.ativo == is_active)
        
        # Contar total
        total = query.count()
        
        # Aplicar paginação
        products = query.offset((page - 1) * page_size).limit(page_size).all()
        
        # Formatar resposta
        items = []
        for prod in products:
            items.append({
                "id": prod.id,
                "name": prod.nome,
                "code": prod.codigo,
                "description": prod.descricao,
                "barcode": prod.codigo_barras,
                "category": {
                    "id": prod.categoria.id,
                    "name": prod.categoria.nome
                } if prod.categoria else None,
                "unit": {"id": 1, "name": "Unidade", "symbol": "UN"},  # Mock unit
                "is_active": prod.ativo
            })
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
        
    except Exception as e:
        logger.error(f"Erro ao listar produtos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/inventory/products")
async def create_product(
    product_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Create a new product
    """
    try:
        # Validar categoria se fornecida
        categoria = None
        if product_data.get("category_id"):
            categoria = db.query(ProdutoCategoria).filter(
                ProdutoCategoria.id == product_data["category_id"]
            ).first()
            if not categoria:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria não encontrada"
                )
        
        # Criar produto
        novo_produto = Produto(
            nome=product_data["name"],
            codigo=product_data.get("code"),
            descricao=product_data.get("description"),
            codigo_barras=product_data.get("barcode"),
            categoria_id=product_data.get("category_id"),
            ativo=True
        )
        
        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)
        
        return {
            "id": novo_produto.id,
            "name": novo_produto.nome,
            "code": novo_produto.codigo,
            "description": novo_produto.descricao,
            "barcode": novo_produto.codigo_barras,
            "category": {
                "id": categoria.id,
                "name": categoria.nome
            } if categoria else None,
            "unit": {"id": 1, "name": "Unidade", "symbol": "UN"},  # Mock unit
            "is_active": novo_produto.ativo
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar produto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/inventory/categories")
async def create_category(
    category_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Create a new category
    """
    try:
        nova_categoria = ProdutoCategoria(
            nome=category_data["name"],
            descricao=category_data.get("description"),
            ativo=True
        )
        
        db.add(nova_categoria)
        db.commit()
        db.refresh(nova_categoria)
        
        return {
            "id": nova_categoria.id,
            "name": nova_categoria.nome,
            "description": nova_categoria.descricao,
            "is_active": nova_categoria.ativo
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar categoria: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/inventory/locations")
async def create_location(
    location_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Create a new location
    """
    try:
        # Por enquanto simular criação
        new_location = {
            "id": 999,
            "name": location_data["name"],
            "code": location_data.get("code"),
            "description": location_data.get("description"),
            "is_active": True
        }
        
        logger.info(f"Local criado (simulado): {new_location}")
        return new_location
        
    except Exception as e:
        logger.error(f"Erro ao criar local: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/inventory/reasons")
async def create_movement_reason(
    reason_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Create a new movement reason
    """
    try:
        # Por enquanto simular criação
        new_reason = {
            "id": 999,
            "name": reason_data["name"],
            "description": reason_data.get("description"),
            "type": reason_data["direction"],
            "is_active": True
        }
        
        logger.info(f"Motivo criado (simulado): {new_reason}")
        return new_reason
        
    except Exception as e:
        logger.error(f"Erro ao criar motivo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

# ==================== IMPORT/EXPORT ENDPOINTS ====================

@router.get("/estoque/import/options")
async def get_import_options(
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get import options and configuration
    """
    try:
        return {
            "formatos_suportados": ["csv", "xlsx", "json"],
            "campos_disponiveis": [
                {
                    "nome": "nome",
                    "tipo": "string",
                    "obrigatorio": True,
                    "descricao": "Nome do produto",
                    "aliases": ["name", "produto", "product"],
                    "validacoes": ["min_length:1", "max_length:255"]
                },
                {
                    "nome": "codigo",
                    "tipo": "string",
                    "obrigatorio": False,
                    "descricao": "Código do produto",
                    "aliases": ["code", "cod", "sku"],
                    "validacoes": ["max_length:50"]
                },
                {
                    "nome": "codigo_barras",
                    "tipo": "string",
                    "obrigatorio": False,
                    "descricao": "Código de barras",
                    "aliases": ["barcode", "ean", "gtin"],
                    "validacoes": ["numeric", "max_length:20"]
                },
                {
                    "nome": "categoria",
                    "tipo": "string",
                    "obrigatorio": False,
                    "descricao": "Nome da categoria",
                    "aliases": ["category", "tipo"],
                    "validacoes": ["max_length:100"]
                },
                {
                    "nome": "descricao",
                    "tipo": "text",
                    "obrigatorio": False,
                    "descricao": "Descrição do produto",
                    "aliases": ["description", "desc"],
                    "validacoes": ["max_length:500"]
                }
            ],
            "templates_disponiveis": [
                {
                    "id": 1,
                    "nome": "Produtos Básico",
                    "descricao": "Template básico para importação de produtos",
                    "formato": "csv",
                    "mapeamento_padrao": {
                        "nome": "nome",
                        "codigo": "codigo",
                        "categoria": "categoria",
                        "descricao": "descricao"
                    },
                    "campos_obrigatorios": ["nome"],
                    "ativo": True,
                    "criado_em": "2024-01-01T00:00:00"
                }
            ],
            "categorias_existentes": [cat.nome for cat in db.query(ProdutoCategoria).filter(ProdutoCategoria.ativo == True).all()],
            "fornecedores_existentes": []
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar opções de importação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/estoque/upload")
async def upload_import_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Upload file for import processing
    """
    try:
        # Validar tipo de arquivo
        allowed_types = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/json"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de arquivo não suportado: {file.content_type}"
            )
        
        # Ler conteúdo do arquivo
        content = await file.read()
        
        # Simular processamento
        operacao_id = 12345
        
        logger.info(f"Arquivo {file.filename} carregado com sucesso. Operação ID: {operacao_id}")
        
        return {
            "operacao_id": operacao_id,
            "arquivo": file.filename,
            "tamanho": len(content),
            "tipo": file.content_type,
            "status": "UPLOADED",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao fazer upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/estoque/validate/{operacao_id}")
async def validate_import_data(
    operacao_id: int,
    mapeamento: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Validate import data before processing
    """
    try:
        # Simular validação
        validation_result = {
            "operacao_id": operacao_id,
            "valido": True,
            "total_registros": 250,
            "registros_validos": 247,
            "registros_invalidos": 3,
            "erros": [
                {"linha": 45, "campo": "nome", "erro": "Nome é obrigatório"},
                {"linha": 78, "campo": "categoria", "erro": "Categoria 'Bebida' não existe"},
                {"linha": 123, "campo": "codigo_barras", "erro": "Código de barras inválido"}
            ],
            "avisos": [
                {"linha": 67, "campo": "codigo", "aviso": "Código duplicado, será ignorado"}
            ],
            "mapeamento_aplicado": mapeamento,
            "timestamp": datetime.now().isoformat()
        }
        
        return validation_result
        
    except Exception as e:
        logger.error(f"Erro na validação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/estoque/import/{operacao_id}")
async def execute_import(
    operacao_id: int,
    mapeamento: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Execute the import process
    """
    try:
        # Simular execução da importação
        import_result = {
            "operacao_id": operacao_id,
            "status": "CONCLUIDA",
            "total_registros": 250,
            "registros_importados": 247,
            "registros_ignorados": 3,
            "inicio_processamento": datetime.now().isoformat(),
            "fim_processamento": (datetime.now() + timedelta(seconds=30)).isoformat(),
            "tempo_processamento": "30 segundos",
            "log_importacao": [
                "Iniciando importação...",
                "Processando linha 1-50...",
                "Processando linha 51-100...",
                "Processando linha 101-150...",
                "Processando linha 151-200...",
                "Processando linha 201-250...",
                "Importação concluída com sucesso!"
            ]
        }
        
        return import_result
        
    except Exception as e:
        logger.error(f"Erro na importação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/estoque/import/{operacao_id}/status")
async def get_import_status(
    operacao_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get import operation status
    """
    try:
        # Simular status
        status_info = {
            "operacao_id": operacao_id,
            "status": "PROCESSANDO",
            "progresso": 65,
            "total_registros": 250,
            "registros_processados": 162,
            "tempo_decorrido": "45 segundos",
            "tempo_estimado_restante": "25 segundos",
            "ultima_atualizacao": datetime.now().isoformat()
        }
        
        return status_info
        
    except Exception as e:
        logger.error(f"Erro ao consultar status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/estoque/export/formats")
async def get_export_formats(
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get available export formats
    """
    try:
        return {
            "formats": [
                {
                    "format": "csv",
                    "name": "CSV",
                    "description": "Arquivo CSV separado por vírgulas",
                    "icon": "file-text",
                    "extensions": [".csv"]
                },
                {
                    "format": "xlsx",
                    "name": "Excel",
                    "description": "Arquivo Excel (.xlsx)",
                    "icon": "file-spreadsheet",
                    "extensions": [".xlsx"]
                },
                {
                    "format": "json",
                    "name": "JSON",
                    "description": "Arquivo JSON",
                    "icon": "code",
                    "extensions": [".json"]
                }
            ],
            "types": [
                {
                    "type": "products",
                    "name": "Produtos",
                    "description": "Exportar lista de produtos"
                },
                {
                    "type": "stock",
                    "name": "Estoque",
                    "description": "Exportar posições de estoque"
                },
                {
                    "type": "movements",
                    "name": "Movimentações",
                    "description": "Exportar histórico de movimentações"
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar formatos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/estoque/export/preview")
async def preview_export(
    config: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Preview export data
    """
    try:
        # Simular preview
        preview_data = {
            "total_registros": 1247,
            "preview_registros": [
                {
                    "nome": "Coca-Cola 350ml",
                    "codigo": "COCA350",
                    "categoria": "Bebidas",
                    "estoque_atual": 150,
                    "valor_unitario": 2.50
                },
                {
                    "nome": "Guaraná Antarctica 350ml",
                    "codigo": "GUAR350",
                    "categoria": "Bebidas",
                    "estoque_atual": 200,
                    "valor_unitario": 2.30
                }
            ],
            "colunas": ["nome", "codigo", "categoria", "estoque_atual", "valor_unitario"],
            "tamanho_estimado": "2.5 MB",
            "tempo_estimado": "15 segundos"
        }
        
        return preview_data
        
    except Exception as e:
        logger.error(f"Erro no preview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/estoque/export")
async def export_data(
    config: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Export data to file
    """
    try:
        # Simular exportação (retornar dados binários simulados)
        export_format = config.get("format", "csv")
        
        if export_format == "csv":
            # Gerar CSV simulado
            csv_data = "nome,codigo,categoria,estoque_atual,valor_unitario\n"
            csv_data += "Coca-Cola 350ml,COCA350,Bebidas,150,2.50\n"
            csv_data += "Guaraná Antarctica 350ml,GUAR350,Bebidas,200,2.30\n"
            
            return Response(
                content=csv_data.encode('utf-8'),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=produtos_export.csv"}
            )
        
        elif export_format == "json":
            # Gerar JSON simulado
            json_data = {
                "produtos": [
                    {
                        "nome": "Coca-Cola 350ml",
                        "codigo": "COCA350",
                        "categoria": "Bebidas",
                        "estoque_atual": 150,
                        "valor_unitario": 2.50
                    },
                    {
                        "nome": "Guaraná Antarctica 350ml",
                        "codigo": "GUAR350",
                        "categoria": "Bebidas",
                        "estoque_atual": 200,
                        "valor_unitario": 2.30
                    }
                ]
            }
            
            return Response(
                content=json.dumps(json_data, ensure_ascii=False, indent=2).encode('utf-8'),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=produtos_export.json"}
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato não suportado: {export_format}"
            )
        
    except Exception as e:
        logger.error(f"Erro na exportação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/estoque/templates")
async def get_import_templates(
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get available import templates
    """
    try:
        templates = [
            {
                "id": 1,
                "nome": "Produtos Básico",
                "descricao": "Template básico para importação de produtos",
                "formato": "csv",
                "mapeamento_padrao": {
                    "nome": "nome",
                    "codigo": "codigo",
                    "categoria": "categoria",
                    "descricao": "descricao"
                },
                "campos_obrigatorios": ["nome"],
                "ativo": True,
                "criado_em": "2024-01-01T00:00:00"
            },
            {
                "id": 2,
                "nome": "Produtos Completo",
                "descricao": "Template completo com todos os campos",
                "formato": "xlsx",
                "mapeamento_padrao": {
                    "nome": "nome",
                    "codigo": "codigo",
                    "codigo_barras": "codigo_barras",
                    "categoria": "categoria",
                    "descricao": "descricao",
                    "preco": "preco",
                    "custo": "custo"
                },
                "campos_obrigatorios": ["nome"],
                "ativo": True,
                "criado_em": "2024-01-01T00:00:00"
            }
        ]
        
        return templates
        
    except Exception as e:
        logger.error(f"Erro ao buscar templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/estoque/templates")
async def create_import_template(
    template_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Create a new import template
    """
    try:
        # Simular criação de template
        new_template = {
            "id": 999,
            "nome": template_data["nome"],
            "descricao": template_data.get("descricao"),
            "formato": template_data["formato"],
            "mapeamento_padrao": template_data["mapeamento_padrao"],
            "campos_obrigatorios": template_data.get("campos_obrigatorios", []),
            "ativo": True,
            "criado_em": datetime.now().isoformat()
        }
        
        logger.info(f"Template criado (simulado): {new_template}")
        return new_template
        
    except Exception as e:
        logger.error(f"Erro ao criar template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/estoque/templates/{format}/download")
async def download_template(
    format: str,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Download import template file
    """
    try:
        if format == "csv":
            # Gerar template CSV
            csv_template = "nome,codigo,codigo_barras,categoria,descricao\n"
            csv_template += "Exemplo Produto,PROD001,1234567890123,Categoria Exemplo,Descrição do produto exemplo\n"
            
            return Response(
                content=csv_template.encode('utf-8'),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=template_produtos.csv"}
            )
        
        elif format == "json":
            # Gerar template JSON
            json_template = {
                "produtos": [
                    {
                        "nome": "Exemplo Produto",
                        "codigo": "PROD001",
                        "codigo_barras": "1234567890123",
                        "categoria": "Categoria Exemplo",
                        "descricao": "Descrição do produto exemplo"
                    }
                ]
            }
            
            return Response(
                content=json.dumps(json_template, ensure_ascii=False, indent=2).encode('utf-8'),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=template_produtos.json"}
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato de template não suportado: {format}"
            )
        
    except Exception as e:
        logger.error(f"Erro ao baixar template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/estoque/jobs")
async def get_import_export_jobs(
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get import/export jobs history
    """
    try:
        # Dados mock de jobs
        all_jobs = [
            {
                "id": 1,
                "tipo": "IMPORTACAO",
                "arquivo": "produtos_bebidas.xlsx",
                "status": "CONCLUIDA",
                "total_registros": 245,
                "registros_sucesso": 242,
                "registros_erro": 3,
                "criado_em": datetime.now().isoformat(),
                "fim_processamento": datetime.now().isoformat()
            },
            {
                "id": 2,
                "tipo": "EXPORTACAO",
                "arquivo": "relatorio_estoque.csv",
                "status": "PROCESSANDO",
                "total_registros": 1247,
                "registros_sucesso": 890,
                "registros_erro": 0,
                "criado_em": (datetime.now() - timedelta(minutes=30)).isoformat(),
                "inicio_processamento": (datetime.now() - timedelta(minutes=25)).isoformat()
            },
            {
                "id": 3,
                "tipo": "IMPORTACAO",
                "arquivo": "produtos_comidas.csv",
                "status": "ERRO",
                "total_registros": 89,
                "registros_sucesso": 45,
                "registros_erro": 44,
                "criado_em": (datetime.now() - timedelta(hours=2)).isoformat(),
                "fim_processamento": (datetime.now() - timedelta(hours=1, minutes=30)).isoformat()
            }
        ]
        
        # Filtrar por status se especificado
        if status_filter:
            jobs = [job for job in all_jobs if job["status"] == status_filter]
        else:
            jobs = all_jobs
        
        # Aplicar limite
        jobs = jobs[:limit]
        
        return jobs
        
    except Exception as e:
        logger.error(f"Erro ao buscar jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.delete("/estoque/jobs/{job_id}")
async def cancel_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Cancel a running job
    """
    try:
        # Simular cancelamento
        logger.info(f"Cancelando job {job_id}")
        
        return {
            "message": f"Job {job_id} cancelado com sucesso",
            "job_id": job_id,
            "status": "CANCELADO",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao cancelar job: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

# ==================== REPORTS ENDPOINTS ====================

@router.get("/estoque/reports/giro")
async def get_relatorio_giro(
    periodo: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get inventory turnover report
    """
    try:
        # Dados mock de relatório de giro
        relatorio = {
            "periodo_dias": periodo,
            "data_inicio": (datetime.now() - timedelta(days=periodo)).isoformat(),
            "data_fim": datetime.now().isoformat(),
            "produtos": [
                {
                    "id": 1,
                    "nome": "Coca-Cola 350ml",
                    "categoria": "Bebidas",
                    "estoque_inicial": 200,
                    "entradas": 500,
                    "saidas": 450,
                    "estoque_final": 250,
                    "giro": 2.25,
                    "classificacao": "Alto"
                },
                {
                    "id": 2,
                    "nome": "Guaraná Antarctica 350ml",
                    "categoria": "Bebidas",
                    "estoque_inicial": 150,
                    "entradas": 300,
                    "saidas": 280,
                    "estoque_final": 170,
                    "giro": 1.75,
                    "classificacao": "Médio"
                }
            ],
            "resumo": {
                "total_produtos": 2,
                "giro_medio": 2.0,
                "produtos_alto_giro": 1,
                "produtos_medio_giro": 1,
                "produtos_baixo_giro": 0
            }
        }
        
        return relatorio
        
    except Exception as e:
        logger.error(f"Erro no relatório de giro: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/estoque/reports/abc")
async def get_relatorio_abc(
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get ABC analysis report
    """
    try:
        # Dados mock de análise ABC
        relatorio = {
            "data_analise": datetime.now().isoformat(),
            "criterio": "valor_vendas",
            "produtos": [
                {
                    "id": 1,
                    "nome": "Coca-Cola 350ml",
                    "categoria": "Bebidas",
                    "valor_vendas": 15000.00,
                    "percentual_vendas": 45.0,
                    "percentual_acumulado": 45.0,
                    "classificacao": "A"
                },
                {
                    "id": 2,
                    "nome": "Guaraná Antarctica 350ml", 
                    "categoria": "Bebidas",
                    "valor_vendas": 8000.00,
                    "percentual_vendas": 24.0,
                    "percentual_acumulado": 69.0,
                    "classificacao": "A"
                }
            ],
            "resumo": {
                "classe_a": {"produtos": 2, "percentual_valor": 69.0},
                "classe_b": {"produtos": 0, "percentual_valor": 0.0},
                "classe_c": {"produtos": 0, "percentual_valor": 0.0},
                "total_produtos": 2,
                "valor_total_vendas": 23000.00
            }
        }
        
        return relatorio
        
    except Exception as e:
        logger.error(f"Erro no relatório ABC: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/estoque/reports/perdas")
async def get_relatorio_perdas(
    periodo: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(obter_usuario_atual)
):
    """
    Get loss/waste report
    """
    try:
        # Dados mock de relatório de perdas
        relatorio = {
            "periodo_dias": periodo,
            "data_inicio": (datetime.now() - timedelta(days=periodo)).isoformat(),
            "data_fim": datetime.now().isoformat(),
            "perdas": [
                {
                    "id": 1,
                    "data": (datetime.now() - timedelta(days=5)).isoformat(),
                    "produto": "Coca-Cola 350ml",
                    "categoria": "Bebidas",
                    "quantidade": 12,
                    "valor_unitario": 2.50,
                    "valor_total": 30.00,
                    "motivo": "Quebra",
                    "responsavel": "João Silva"
                },
                {
                    "id": 2,
                    "data": (datetime.now() - timedelta(days=10)).isoformat(),
                    "produto": "Guaraná Antarctica 350ml",
                    "categoria": "Bebidas",
                    "quantidade": 8,
                    "valor_unitario": 2.30,
                    "valor_total": 18.40,
                    "motivo": "Vencimento",
                    "responsavel": "Maria Santos"
                }
            ],
            "resumo": {
                "total_perdas": 20,
                "valor_total_perdas": 48.40,
                "perda_por_quebra": 30.00,
                "perda_por_vencimento": 18.40,
                "percentual_sobre_vendas": 0.5
            }
        }
        
        return relatorio
        
    except Exception as e:
        logger.error(f"Erro no relatório de perdas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )
