from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

def add_financial_indexes():
    """Add database indexes for financial performance optimization"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        return
    
    engine = create_engine(database_url)
    
    try:
        with engine.connect() as conn:
            print("🔧 Adding database indexes for financial performance...")
            
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_movimentacoes_evento_tipo_status 
                ON movimentacoes_financeiras(evento_id, tipo, status);
            """))
            print("✅ Created index: idx_movimentacoes_evento_tipo_status")
            
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_movimentacoes_evento_criado_em 
                ON movimentacoes_financeiras(evento_id, criado_em DESC);
            """))
            print("✅ Created index: idx_movimentacoes_evento_criado_em")
            
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_movimentacoes_categoria 
                ON movimentacoes_financeiras(categoria);
            """))
            print("✅ Created index: idx_movimentacoes_categoria")
            
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_transacoes_evento_status 
                ON transacoes(evento_id, status);
            """))
            print("✅ Created index: idx_transacoes_evento_status")
            
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_vendas_pdv_evento_status 
                ON vendas_pdv(evento_id, status);
            """))
            print("✅ Created index: idx_vendas_pdv_evento_status")
            
            conn.commit()
            print("🚀 All database indexes created successfully!")
            
    except Exception as e:
        print(f"❌ Error creating indexes: {e}")
    finally:
        engine.dispose()

if __name__ == "__main__":
    add_financial_indexes()
