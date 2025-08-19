#!/bin/bash

# Script de startup robusto para Railway - Backend
echo "🚀 Iniciando Backend FastAPI no Railway..."

# Definir porta (Railway usa PORT, fallback para 8000)
export PORT=${PORT:-8000}

echo "📊 Configurações:"
echo "PORT: $PORT"
echo "PYTHONPATH: $PYTHONPATH"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..." # Mostra apenas início da URL

# Verificar se o diretório app existe
if [ ! -d "/app/app" ]; then
    echo "❌ Erro: Diretório /app/app não encontrado"
    ls -la /app/
    exit 1
fi

echo "✅ Estrutura do projeto:"
ls -la /app/

# Teste de importação crítica
echo "🔍 Testando importações críticas..."
python -c "
try:
    print('Testando importação do main...')
    from app.main import app
    print('✅ app.main importado com sucesso')
    print(f'App type: {type(app)}')
except Exception as e:
    print(f'❌ Erro crítico na importação: {e}')
    import traceback
    traceback.print_exc()
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Falha no teste de importação. Abortando..."
    exit 1
fi

# Aguardar um pouco para garantir que dependências estão prontas
echo "⏳ Aguardando inicialização..."
sleep 3

echo "🌟 Iniciando servidor FastAPI na porta $PORT..."

# Executar uvicorn com configurações otimizadas para Railway
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port $PORT \
    --access-log \
    --log-level info \
    --timeout-keep-alive 300 \
    --workers 1
