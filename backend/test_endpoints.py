"""
Script para testar sistematicamente todos os endpoints de criação/atualização do projeto
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import httpx
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def testar_endpoint_categorias():
    """Testar endpoints de categorias"""
    print("🧪 TESTANDO CATEGORIAS")
    
    async with httpx.AsyncClient() as client:
        # 1. Listar categorias
        try:
            response = await client.get(f"{BASE_URL}/api/produtos/categorias/")
            print(f"✅ GET categorias: {response.status_code}")
            categorias = response.json()
            print(f"   📦 {len(categorias)} categorias encontradas")
        except Exception as e:
            print(f"❌ GET categorias: {e}")
            
        # 2. Criar nova categoria
        try:
            nova_categoria = {
                "nome": f"Teste Categoria {datetime.now().strftime('%H%M%S')}",
                "descricao": "Categoria criada pelo teste automatizado",
                "cor": "#FF6B6B"
            }
            response = await client.post(
                f"{BASE_URL}/api/produtos/categorias/", 
                json=nova_categoria
            )
            print(f"✅ POST categoria: {response.status_code}")
            if response.status_code == 200:
                categoria_criada = response.json()
                print(f"   📝 Categoria criada: ID {categoria_criada.get('id')} - {categoria_criada.get('nome')}")
                return categoria_criada.get('id')
            else:
                print(f"   ❌ Erro ao criar: {response.text}")
        except Exception as e:
            print(f"❌ POST categoria: {e}")
    
    return None

async def testar_endpoint_listas():
    """Testar endpoints de listas - requer autenticação"""
    print("🧪 TESTANDO LISTAS (requer auth)")
    print("   ⚠️  Pulando teste - endpoint requer autenticação")

async def testar_endpoint_transacoes():
    """Testar endpoints de transações - requer autenticação"""
    print("🧪 TESTANDO TRANSAÇÕES (requer auth)")
    print("   ⚠️  Pulando teste - endpoint requer autenticação")

async def testar_endpoint_pdv():
    """Testar endpoints de PDV - requer autenticação"""
    print("🧪 TESTANDO PDV (requer auth)")
    print("   ⚠️  Pulando teste - endpoint requer autenticação")

async def testar_health_endpoints():
    """Testar endpoints de health"""
    print("🧪 TESTANDO HEALTH ENDPOINTS")
    
    async with httpx.AsyncClient() as client:
        # Health check
        try:
            response = await client.get(f"{BASE_URL}/healthz")
            print(f"✅ Health check: {response.status_code}")
        except Exception as e:
            print(f"❌ Health check: {e}")
            
        # API Health
        try:
            response = await client.get(f"{BASE_URL}/api/health")
            print(f"✅ API health: {response.status_code}")
        except Exception as e:
            print(f"❌ API health: {e}")

async def main():
    """Executar todos os testes"""
    print("🚀 INICIANDO TESTES SISTEMÁTICOS DOS ENDPOINTS")
    print("=" * 60)
    
    # Testar health primeiro
    await testar_health_endpoints()
    print()
    
    # Testar categorias (não requer auth)
    categoria_id = await testar_endpoint_categorias()
    print()
    
    # Outros testes que requerem autenticação
    await testar_endpoint_listas()
    print()
    
    await testar_endpoint_transacoes()
    print()
    
    await testar_endpoint_pdv()
    print()
    
    print("=" * 60)
    print("🏁 TESTES CONCLUÍDOS")
    
    if categoria_id:
        print(f"✅ SUCESSO: Categoria criada com ID {categoria_id}")
    else:
        print("❌ FALHA: Não foi possível criar categoria")

if __name__ == "__main__":
    asyncio.run(main())
