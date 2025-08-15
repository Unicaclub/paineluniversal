#!/bin/bash

# Script de startup para Railway - Backend
echo "🚀 Iniciando Backend FastAPI no Railway..."

# Definir porta (Railway usa PORT, fallback para 8000)
export PORT=${PORT:-8000}

echo "📊 Configurações:"
echo "PORT: $PORT"
echo "PYTHONPATH: $PYTHONPATH"
echo "DATABASE_URL: ${DATABASE_URL:0:20}..." # Mostra apenas início da URL

# Verificar se o diretório app existe
if [ ! -d "/app/app" ]; then
    echo "❌ Erro: Diretório /app/app não encontrado"
    ls -la /app/
    exit 1
fi

echo "✅ Estrutura do projeto:"
ls -la /app/

# Aguardar um pouco para garantir que dependências estão prontas
echo "⏳ Aguardando inicialização..."
sleep 2

# Executar migrações se necessário (opcional)
# python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)" || echo "⚠️ Falha nas migrações, continuando..."

echo "🌟 Iniciando servidor FastAPI na porta $PORT..."

# Executar uvicorn com porta dinâmica
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --access-log --log-level info
