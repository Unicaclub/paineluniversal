from app.database import engine
from sqlalchemy import text, inspect

# Verificar tabelas existentes
inspector = inspect(engine)
print("Tabelas existentes:", inspector.get_table_names())

# Verificar estrutura da produtos_temp se existir
with engine.connect() as conn:
    try:
        result = conn.execute(text("SELECT sql FROM sqlite_master WHERE name='produtos_temp'"))
        schema = result.fetchone()
        if schema:
            print("\nEstrutura da produtos_temp:")
            print(schema[0])
        
        # Verificar se produtos existe
        result = conn.execute(text("SELECT sql FROM sqlite_master WHERE name='produtos'"))
        schema = result.fetchone()
        if schema:
            print("\nEstrutura da produtos:")
            print(schema[0])
        else:
            print("\nTabela produtos não existe")
            
    except Exception as e:
        print(f"Erro: {e}")
