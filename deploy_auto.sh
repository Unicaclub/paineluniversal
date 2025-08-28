#!/bin/bash
# Script de deploy automático para Railway
# Executa migrações necessárias

echo "🚀 Iniciando deploy automático..."

# 1. Executar migração de enum
echo "📝 Executando migração de enum..."
python migrate_enum_auto.py

if [ $? -eq 0 ]; then
    echo "✅ Migração de enum concluída"
else
    echo "❌ Erro na migração de enum"
    exit 1
fi

# 2. Verificar saúde do banco
echo "🏥 Verificando saúde do banco..."
python -c "
from backend.app.database import get_db
from backend.app.models import TipoUsuario
print('✅ Conexão com banco OK')
print(f'📋 Enum TipoUsuario: {[(e.name, e.value) for e in TipoUsuario]}')
"

echo "🎉 Deploy automático concluído!"
