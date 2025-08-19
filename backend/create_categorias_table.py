"""
Script para criar a tabela produtos_categorias diretamente no banco
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal
from app.models import Base, ProdutoCategoria
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def criar_tabela_categorias():
    """Criar tabela produtos_categorias"""
    try:
        # Criar todas as tabelas definidas nos modelos
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tabelas criadas com sucesso!")
        
        # Inserir categorias padrão
        db = SessionLocal()
        try:
            # Verificar se já existem categorias
            existing_count = db.query(ProdutoCategoria).count()
            if existing_count > 0:
                logger.info(f"📦 Já existem {existing_count} categorias no banco")
                return
            
            # Inserir categorias padrão
            categorias_padrao = [
                ProdutoCategoria(nome="Bebidas", descricao="Bebidas alcoólicas e não alcoólicas", cor="#10B981", ativo=True),
                ProdutoCategoria(nome="Comidas", descricao="Pratos principais e petiscos", cor="#F59E0B", ativo=True),
                ProdutoCategoria(nome="Sobremesas", descricao="Doces e sobremesas", cor="#EF4444", ativo=True),
                ProdutoCategoria(nome="Aperitivos", descricao="Petiscos e entradas", cor="#8B5CF6", ativo=True),
                ProdutoCategoria(nome="Drinks", descricao="Cocktails e bebidas especiais", cor="#06B6D4", ativo=True),
            ]
            
            for categoria in categorias_padrao:
                db.add(categoria)
            
            db.commit()
            logger.info("✅ Categorias padrão inseridas com sucesso!")
            
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Erro ao inserir categorias: {e}")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}")

if __name__ == "__main__":
    criar_tabela_categorias()
