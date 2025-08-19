"""
Sistema de inicialização automática do banco de dados
Este arquivo garante que todas as tabelas sejam criadas automaticamente
quando a aplicação iniciar, seja localmente ou no Railway.
"""

import os
import logging
from sqlalchemy import text, create_engine, inspect
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

def init_database():
    """Inicializar banco de dados criando tabelas e dados padrão"""
    try:
        from .database import engine, SessionLocal
        from .models import Base, ProdutoCategoria
        
        # Criar todas as tabelas
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Todas as tabelas foram criadas/verificadas")
        
        # Inserir dados padrão se necessário
        db = SessionLocal()
        try:
            # Verificar se já existem categorias
            categorias_existentes = db.query(ProdutoCategoria).count()
            
            if categorias_existentes == 0:
                logger.info("🌱 Inserindo categorias padrão...")
                
                categorias_padrao = [
                    ProdutoCategoria(
                        nome="Bebidas",
                        descricao="Bebidas alcoólicas e não alcoólicas",
                        cor="#10B981",
                        ativo=True
                    ),
                    ProdutoCategoria(
                        nome="Comidas",
                        descricao="Pratos principais e petiscos",
                        cor="#F59E0B",
                        ativo=True
                    ),
                    ProdutoCategoria(
                        nome="Sobremesas",
                        descricao="Doces e sobremesas",
                        cor="#EF4444",
                        ativo=True
                    ),
                    ProdutoCategoria(
                        nome="Aperitivos",
                        descricao="Petiscos e entradas",
                        cor="#8B5CF6",
                        ativo=True
                    ),
                    ProdutoCategoria(
                        nome="Drinks",
                        descricao="Cocktails e bebidas especiais",
                        cor="#06B6D4",
                        ativo=True
                    ),
                ]
                
                for categoria in categorias_padrao:
                    db.add(categoria)
                
                db.commit()
                logger.info(f"✅ {len(categorias_padrao)} categorias padrão inseridas com sucesso!")
            else:
                logger.info(f"📦 {categorias_existentes} categorias já existem no banco")
                
        except Exception as e:
            logger.error(f"❌ Erro ao inserir dados padrão: {e}")
            db.rollback()
        finally:
            db.close()
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro crítico na inicialização do banco: {e}")
        return False

def create_tables_raw_sql():
    """Criar tabelas usando SQL bruto como fallback"""
    try:
        from .database import engine
        
        # SQL para criar tabela produtos_categorias se não existir
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS produtos_categorias (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT,
            cor VARCHAR(7) DEFAULT '#3B82F6',
            ativo BOOLEAN DEFAULT TRUE,
            evento_id INTEGER,
            empresa_id INTEGER,
            criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP WITH TIME ZONE
        );
        
        -- Criar índices se não existirem
        CREATE INDEX IF NOT EXISTS idx_produtos_categorias_nome ON produtos_categorias(nome);
        CREATE INDEX IF NOT EXISTS idx_produtos_categorias_ativo ON produtos_categorias(ativo);
        """
        
        with engine.connect() as conn:
            conn.execute(text(create_table_sql))
            conn.commit()
            
        logger.info("✅ Tabelas criadas via SQL bruto")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas via SQL: {e}")
        return False

def verify_database_health():
    """Verificar saúde do banco de dados"""
    try:
        from .database import SessionLocal
        
        db = SessionLocal()
        try:
            # Teste simples de conexão
            db.execute(text("SELECT 1"))
            logger.info("✅ Conexão com banco de dados verificada")
            return True
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Erro na verificação do banco: {e}")
        return False

async def startup_database_init():
    """Função de inicialização para ser chamada no startup da aplicação"""
    logger.info("🚀 Iniciando configuração do banco de dados...")
    
    # 1. Verificar conexão
    if not verify_database_health():
        logger.error("❌ Falha na conexão com banco de dados")
        return False
    
    # 2. Tentar inicialização via SQLAlchemy
    if init_database():
        logger.info("✅ Banco inicializado via SQLAlchemy")
        create_default_data()
        return True
    
    # 3. Fallback: tentar via SQL bruto
    if create_tables_raw_sql():
        logger.info("✅ Banco inicializado via SQL bruto")
        create_default_data()
        return True
    
    logger.error("❌ Falha na inicialização do banco de dados")
    return False

def create_default_data():
    """Criar dados padrão se não existirem"""
    try:
        from .database import SessionLocal
        from .models import ProdutoCategoria, Produto, TipoProduto, StatusProduto
        
        db = SessionLocal()
        try:
            # Verificar se já existem categorias
            if db.query(ProdutoCategoria).count() == 0:
                logger.info("📦 Criando categorias padrão...")
                
                categorias_padrao = [
                    {"nome": "Bebidas", "descricao": "Bebidas diversas", "cor": "#3b82f6"},
                    {"nome": "Lanches", "descricao": "Lanches e petiscos", "cor": "#ef4444"},
                    {"nome": "Doces", "descricao": "Doces e sobremesas", "cor": "#f59e0b"},
                    {"nome": "Serviços", "descricao": "Serviços diversos", "cor": "#10b981"},
                ]
                
                for cat_data in categorias_padrao:
                    categoria = ProdutoCategoria(**cat_data)
                    db.add(categoria)
                
                db.commit()
                logger.info("✅ Categorias padrão criadas")
            
            # Verificar se já existem produtos
            if db.query(Produto).count() == 0:
                logger.info("🛍️ Criando produtos de exemplo...")
                
                # Buscar categorias criadas
                categoria_bebidas = db.query(ProdutoCategoria).filter(ProdutoCategoria.nome == "Bebidas").first()
                categoria_lanches = db.query(ProdutoCategoria).filter(ProdutoCategoria.nome == "Lanches").first()
                categoria_doces = db.query(ProdutoCategoria).filter(ProdutoCategoria.nome == "Doces").first()
                
                produtos_exemplo = [
                    {
                        "nome": "Refrigerante Lata",
                        "descricao": "Refrigerante em lata 350ml",
                        "tipo": TipoProduto.PRODUTO,
                        "preco": 5.00,
                        "codigo_barras": "7891000001001",
                        "codigo_interno": "REF001",
                        "estoque_atual": 100,
                        "estoque_minimo": 10,
                        "estoque_maximo": 500,
                        "controla_estoque": True,
                        "categoria_id": categoria_bebidas.id if categoria_bebidas else None,
                        "unidade_medida": "UN",
                        "status": StatusProduto.ATIVO,
                        "evento_id": 1,  # Assumindo que existe um evento com ID 1
                    },
                    {
                        "nome": "Água Mineral",
                        "descricao": "Água mineral 500ml",
                        "tipo": TipoProduto.PRODUTO,
                        "preco": 3.00,
                        "codigo_barras": "7891000001002",
                        "codigo_interno": "AGU001",
                        "estoque_atual": 200,
                        "estoque_minimo": 20,
                        "estoque_maximo": 1000,
                        "controla_estoque": True,
                        "categoria_id": categoria_bebidas.id if categoria_bebidas else None,
                        "unidade_medida": "UN",
                        "status": StatusProduto.ATIVO,
                        "evento_id": 1,
                    },
                    {
                        "nome": "Hambúrguer Simples",
                        "descricao": "Hambúrguer com pão, carne e salada",
                        "tipo": TipoProduto.PRODUTO,
                        "preco": 15.00,
                        "codigo_interno": "HAM001",
                        "estoque_atual": 50,
                        "estoque_minimo": 5,
                        "estoque_maximo": 200,
                        "controla_estoque": True,
                        "categoria_id": categoria_lanches.id if categoria_lanches else None,
                        "unidade_medida": "UN",
                        "status": StatusProduto.ATIVO,
                        "evento_id": 1,
                    },
                    {
                        "nome": "Brigadeiro",
                        "descricao": "Brigadeiro gourmet",
                        "tipo": TipoProduto.PRODUTO,
                        "preco": 2.50,
                        "codigo_interno": "BRI001",
                        "estoque_atual": 80,
                        "estoque_minimo": 10,
                        "estoque_maximo": 300,
                        "controla_estoque": True,
                        "categoria_id": categoria_doces.id if categoria_doces else None,
                        "unidade_medida": "UN",
                        "status": StatusProduto.ATIVO,
                        "evento_id": 1,
                    },
                ]
                
                for prod_data in produtos_exemplo:
                    produto = Produto(**prod_data)
                    db.add(produto)
                
                db.commit()
                logger.info("✅ Produtos de exemplo criados")
                
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Erro ao criar dados padrão: {e}")
        # Não falha a aplicação se não conseguir criar dados de exemplo
