#!/usr/bin/env python3

"""
Script para aplicar migração em produção PostgreSQL
"""

import os
import psycopg2
from datetime import datetime

# URL do banco de produção
DATABASE_URL = "postgresql://postgres:CeGUGoTyinOaBRILNgPCApbJpcfcVETf@hopper.proxy.rlwy.net:57200/railway"

def apply_production_migration():
    """Aplica migração para tornar empresa_id nullable no PostgreSQL"""
    
    print("🐘 Conectando ao PostgreSQL de produção...")
    
    try:
        # Conectar ao banco
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("✅ Conectado ao banco PostgreSQL")
        
        # Lista de tabelas para migrar
        tables_to_migrate = [
            'eventos',
            'produtos', 
            'comandas',
            'vendas_pdv'
        ]
        
        print(f"🔧 Aplicando migração em {len(tables_to_migrate)} tabelas...")
        
        for table in tables_to_migrate:
            try:
                print(f"   🔄 Migrando {table}.empresa_id...")
                
                # Verificar se a coluna existe antes de alterar
                cur.execute("""
                    SELECT column_name, is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = %s AND column_name = 'empresa_id'
                """, (table,))
                
                result = cur.fetchone()
                
                if result:
                    column_name, is_nullable = result
                    print(f"   📋 {table}.empresa_id encontrada - nullable: {is_nullable}")
                    
                    if is_nullable == 'NO':
                        # Alterar para permitir NULL
                        sql = f"ALTER TABLE {table} ALTER COLUMN empresa_id DROP NOT NULL;"
                        cur.execute(sql)
                        print(f"   ✅ {table}.empresa_id agora é nullable")
                    else:
                        print(f"   ⚠️ {table}.empresa_id já é nullable")
                else:
                    print(f"   ⚠️ {table}.empresa_id não encontrada")
                    
            except Exception as e:
                print(f"   ❌ Erro em {table}: {e}")
                # Continuar com próxima tabela
                continue
        
        # Commit das alterações
        conn.commit()
        print("✅ Migração aplicada com sucesso!")
        
        # Verificar estrutura final
        print("\n📊 Verificando estrutura final...")
        for table in tables_to_migrate:
            try:
                cur.execute("""
                    SELECT column_name, data_type, is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = %s AND column_name = 'empresa_id'
                """, (table,))
                
                result = cur.fetchone()
                if result:
                    col_name, data_type, is_nullable = result
                    status = "✅ NULL" if is_nullable == 'YES' else "❌ NOT NULL"
                    print(f"   {table}.empresa_id: {data_type} - {status}")
                    
            except Exception as e:
                print(f"   ❌ Erro verificando {table}: {e}")
        
    except Exception as e:
        print(f"💥 Erro na migração: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()
            print("🔒 Conexão fechada")
    
    return True

def check_production_tables():
    """Verifica estrutura das tabelas em produção"""
    
    print("🔍 Verificando estrutura das tabelas...")
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Listar todas as tabelas
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        
        tables = cur.fetchall()
        print(f"📋 Tabelas encontradas: {len(tables)}")
        
        for (table_name,) in tables:
            print(f"   - {table_name}")
        
        # Verificar especificamente a tabela eventos
        print("\n🎫 Estrutura da tabela eventos:")
        cur.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'eventos'
            ORDER BY ordinal_position
        """)
        
        columns = cur.fetchall()
        for col_name, data_type, is_nullable, col_default in columns:
            nullable_str = "NULL" if is_nullable == 'YES' else "NOT NULL"
            default_str = f" DEFAULT {col_default}" if col_default else ""
            print(f"   {col_name}: {data_type} {nullable_str}{default_str}")
            
    except Exception as e:
        print(f"💥 Erro na verificação: {e}")
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🚀 Iniciando migração PostgreSQL de produção...")
    print("="*60)
    
    # Primeiro verificar estrutura atual
    check_production_tables()
    
    print("\n" + "="*60)
    print("🔧 Aplicando migração...")
    
    # Aplicar migração
    success = apply_production_migration()
    
    if success:
        print("\n" + "="*60)
        print("✅ Migração concluída! Verificando resultado...")
        check_production_tables()
    else:
        print("\n❌ Migração falhou!")
    
    print("\n🏁 Processo finalizado!")
