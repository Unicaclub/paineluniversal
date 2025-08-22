"""
Script para aplicar migração de limpeza da tabela produtos
Remove campos desnecessários: evento_id, codigo_barras, empresa_id
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.database import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def aplicar_migracao_produtos_cleanup():
    """Aplicar migração de limpeza na tabela produtos"""
    try:
        # Conectar ao banco
        database_url = settings.database_url
        engine = create_engine(database_url)
        
        # Ler arquivo SQL correto baseado no tipo de banco
        if "sqlite" in database_url.lower():
            sql_file = os.path.join(os.path.dirname(__file__), 'produtos_cleanup_migration_sqlite.sql')
        else:
            sql_file = os.path.join(os.path.dirname(__file__), 'produtos_cleanup_migration.sql')
        
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Dividir comandos SQL
        commands = [cmd.strip() for cmd in sql_content.split(';') if cmd.strip()]
        
        # Executar migração
        with engine.connect() as conn:
            logger.info("Aplicando migração de limpeza da tabela produtos...")
            
            for i, command in enumerate(commands, 1):
                try:
                    logger.info(f"Executando comando {i}/{len(commands)}: {command[:50]}...")
                    result = conn.execute(text(command))
                    conn.commit()
                    logger.info(f"✅ Comando {i} executado com sucesso")
                except Exception as cmd_error:
                    if "no such column" in str(cmd_error).lower() or "does not exist" in str(cmd_error).lower():
                        logger.warning(f"⚠️  Comando {i} ignorado (coluna já removida): {str(cmd_error)}")
                    else:
                        logger.error(f"❌ Erro no comando {i}: {str(cmd_error)}")
                        raise
                
            logger.info("✅ Migração de limpeza aplicada com sucesso!")
            
    except Exception as e:
        logger.error(f"❌ Erro ao aplicar migração: {str(e)}")
        raise

if __name__ == "__main__":
    aplicar_migracao_produtos_cleanup()
