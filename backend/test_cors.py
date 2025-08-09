#!/usr/bin/env python3
"""
Script para testar CORS em produção
Uso: python test_cors.py
"""

import requests
import json

def test_cors():
    """Testa se o CORS está funcionando corretamente"""
    
    # URLs de teste
    backend_url = "https://backend-painel-universal-production.up.railway.app"
    frontend_origin = "https://frontend-painel-universal-production.up.railway.app"
    
    print("Testando CORS em producao...")
    print(f"Backend: {backend_url}")
    print(f"Frontend Origin: {frontend_origin}")
    print("-" * 50)
    
    # Teste 1: Health check simples
    try:
        print("1. Testando health check...")
        response = requests.get(f"{backend_url}/api/health", timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Erro: {e}")
    
    print()
    
    # Teste 2: CORS test endpoint
    try:
        print("2. Testando CORS endpoint...")
        headers = {
            'Origin': frontend_origin,
            'Content-Type': 'application/json'
        }
        response = requests.get(f"{backend_url}/api/cors-test", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        
        # Verificar headers CORS
        cors_headers = {k: v for k, v in response.headers.items() if k.lower().startswith('access-control')}
        if cors_headers:
            print(f"   CORS Headers:")
            for header, value in cors_headers.items():
                print(f"      {header}: {value}")
        else:
            print(f"   Nenhum header CORS encontrado!")
            
    except Exception as e:
        print(f"   Erro: {e}")
    
    print()
    
    # Teste 3: Preflight OPTIONS request
    try:
        print("3. Testando preflight OPTIONS...")
        headers = {
            'Origin': frontend_origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
        response = requests.options(f"{backend_url}/api/auth/login", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        
        # Verificar headers CORS
        cors_headers = {k: v for k, v in response.headers.items() if k.lower().startswith('access-control')}
        if cors_headers:
            print(f"   CORS Headers:")
            for header, value in cors_headers.items():
                print(f"      {header}: {value}")
        else:
            print(f"   Nenhum header CORS encontrado!")
            
    except Exception as e:
        print(f"   Erro: {e}")
    
    print()
    
    # Teste 4: Simular login request
    try:
        print("4. Testando POST request (simulando login)...")
        headers = {
            'Origin': frontend_origin,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        data = {
            "cpf": "test",
            "senha": "test"
        }
        response = requests.post(f"{backend_url}/api/auth/login", 
                               headers=headers, 
                               json=data, 
                               timeout=10)
        print(f"   Status: {response.status_code} (esperado 400/401 por dados invalidos)")
        
        # Verificar headers CORS
        cors_headers = {k: v for k, v in response.headers.items() if k.lower().startswith('access-control')}
        if cors_headers:
            print(f"   CORS Headers:")
            for header, value in cors_headers.items():
                print(f"      {header}: {value}")
        else:
            print(f"   Nenhum header CORS encontrado!")
            
    except Exception as e:
        print(f"   Erro: {e}")

if __name__ == "__main__":
    test_cors()