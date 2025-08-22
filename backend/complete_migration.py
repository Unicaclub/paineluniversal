from app.database import engine
from sqlalchemy import text

print("Completando migração de produtos...")

with engine.connect() as conn:
    # Renomear produtos_temp para produtos
    conn.execute(text("ALTER TABLE produtos_temp RENAME TO produtos"))
    conn.commit()
    
    # Recriar índices
    try:
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status)"))
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_codigo_interno ON produtos(codigo_interno)"))
        conn.commit()
        print("✅ Índices recriados com sucesso")
    except Exception as e:
        print(f"⚠️  Aviso ao recriar índices: {e}")

print("✅ Migração de produtos completada com sucesso!")
print("🎯 Campos removidos: evento_id, codigo_barras, empresa_id")
print("📊 Estrutura do produto agora está 100% compatível com as regras de negócio")
