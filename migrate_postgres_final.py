#!/usr/bin/env python3
"""
Migração PostgreSQL com URL atualizada
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime
import sys

def migrate_postgres_updated_url():
    """
    Remove evento_id da tabela produtos usando URL atualizada
    """
    print("🚀 MIGRAÇÃO POSTGRESQL COM URL ATUALIZADA")
    print("=" * 50)
    
    # URLs possíveis do Railway (testando ambas)
    urls = [
        "postgresql://postgres:CeGUGoTyinOaBRILNgPCApbJpcfcVETf@hopper.proxy.rlwy.net:57200/railway",
        "postgresql://postgres:JpkrvsDWYnGKGsQMbTojhbEOjPUzxCCS@junction.proxy.rlwy.net:33986/railway"
    ]
    
    connection = None
    cursor = None
    
    for i, db_url in enumerate(urls, 1):
        try:
            print(f"🔌 Tentando conexão {i}/2...")
            connection = psycopg2.connect(db_url, connect_timeout=30)
            connection.autocommit = False
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            print(f"✅ Conectado com sucesso na URL {i}!")
            break
        except Exception as e:
            print(f"❌ Falha na URL {i}: {e}")
            if i == len(urls):
                print("💀 Todas as URLs falharam")
                return False
    
    try:
        # 1. Verificar se a coluna evento_id existe
        print("\n🔍 Verificando estrutura atual...")
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'produtos' 
                AND column_name = 'evento_id'
            )
        """)
        
        column_exists = cursor.fetchone()[0]
        
        if not column_exists:
            print("✅ Coluna evento_id já foi removida do PostgreSQL!")
            return True
            
        print("⚠️ Coluna evento_id encontrada. Iniciando migração...")
        
        # Verificar quantos produtos existem
        cursor.execute("SELECT COUNT(*) FROM produtos")
        count_produtos = cursor.fetchone()[0]
        print(f"📊 Total de produtos a migrar: {count_produtos}")
        
        # 2. Fazer backup
        print("\n📦 Fazendo backup dos produtos...")
        backup_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_table = f"produtos_backup_{backup_timestamp}"
        
        cursor.execute(f"CREATE TABLE {backup_table} AS SELECT * FROM produtos")
        print(f"✅ Backup criado: {backup_table}")
        
        # 3. Remover a coluna evento_id
        print("\n🔄 Removendo coluna evento_id...")
        cursor.execute("ALTER TABLE produtos DROP COLUMN IF EXISTS evento_id")
        print("✅ Coluna evento_id removida")
        
        # 4. Recriar índices
        print("📈 Recriando índices...")
        indices = [
            "CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria)",
            "CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos(tipo)",
            "CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status)",
            "CREATE INDEX IF NOT EXISTS idx_produtos_empresa_id ON produtos(empresa_id)"
        ]
        
        for index_sql in indices:
            cursor.execute(index_sql)
        
        # 5. Validação
        print("\n🧪 Validando migração...")
        
        # Verificar se evento_id foi removido
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'produtos' 
                AND column_name = 'evento_id'
            )
        """)
        
        still_exists = cursor.fetchone()[0]
        if still_exists:
            raise Exception("ERRO: evento_id ainda existe após migração!")
        
        # Verificar contagem
        cursor.execute("SELECT COUNT(*) FROM produtos")
        final_count = cursor.fetchone()[0]
        if final_count != count_produtos:
            raise Exception(f"ERRO: Contagem incorreta: {final_count} != {count_produtos}")
        
        # Verificar se tabela está funcionando
        cursor.execute("SELECT id, nome, tipo FROM produtos LIMIT 1")
        sample = cursor.fetchone()
        if sample:
            print(f"✅ Tabela funcionando: ID {sample['id']}, Nome: {sample['nome']}")
        
        # Commit das mudanças
        connection.commit()
        
        print("\n🎉 MIGRAÇÃO POSTGRESQL CONCLUÍDA COM SUCESSO!")
        print(f"✅ Coluna evento_id removida da tabela produtos")
        print(f"📊 {final_count} produtos preservados")
        print(f"💾 Backup disponível: {backup_table}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO na migração: {e}")
        try:
            connection.rollback()
            print("🔄 Rollback executado")
        except:
            print("⚠️ Problema no rollback")
        return False
        
    finally:
        try:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
            print("🔌 Conexão fechada")
        except:
            pass

if __name__ == "__main__":
    print("🚀 Iniciando migração PostgreSQL com URL atualizada...")
    success = migrate_postgres_updated_url()
    
    if success:
        print("\n🎉 SUCESSO! PostgreSQL de produção atualizado")
    else:
        print("\n❌ FALHA na migração")
        sys.exit(1)
