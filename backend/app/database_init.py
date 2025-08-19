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
        return True
    
    # 3. Fallback: tentar via SQL bruto
    if create_tables_raw_sql():
        logger.info("✅ Banco inicializado via SQL bruto")
        return True
    
    logger.error("❌ Falha na inicialização do banco de dados")
    return False
