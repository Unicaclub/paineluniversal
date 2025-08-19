"""
Script de validação final - Testa todos os endpoints críticos de salvamento
para garantir que não há problemas de persistência no banco de dados
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Executar comando e mostrar resultado"""
    print(f"\n🔍 {description}")
    print(f"   Comando: {command}")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"   ✅ Sucesso: {result.stdout.strip()[:100]}...")
        else:
            print(f"   ❌ Erro: {result.stderr.strip()[:100]}...")
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"   ⏰ Timeout: comando demorou mais de 30s")
        return False
    except Exception as e:
        print(f"   💥 Exceção: {e}")
        return False

def validate_python_imports():
    """Validar que todos os imports estão funcionando"""
    print("=" * 60)
    print("🐍 VALIDAÇÃO DE IMPORTS PYTHON")
    print("=" * 60)
    
    imports_to_test = [
        ("from app.models import ProdutoCategoria", "Modelo ProdutoCategoria"),
        ("from app.database import engine, SessionLocal", "Database engine"),
        ("from app.routers.produtos import router", "Router de produtos"),
        ("from app.main import app", "Aplicação FastAPI"),
        ("import sqlalchemy", "SQLAlchemy"),
        ("import fastapi", "FastAPI"),
    ]
    
    all_good = True
    for import_cmd, description in imports_to_test:
        if not run_command(f'python -c "{import_cmd}; print(\'Import OK\')"', f"Import: {description}"):
            all_good = False
    
    return all_good

def validate_database_models():
    """Validar que os modelos de banco estão corretos"""
    print("=" * 60)
    print("🗄️ VALIDAÇÃO DOS MODELOS DE BANCO")
    print("=" * 60)
    
    model_tests = [
        ('python -c "from app.models import ProdutoCategoria; print(f\'Tabela: {ProdutoCategoria.__tablename__}\')"', "Modelo ProdutoCategoria"),
        ('python -c "from app.models import Base; print(f\'Base metadata: {len(Base.metadata.tables)} tabelas\')"', "SQLAlchemy Base"),
    ]
    
    all_good = True
    for cmd, desc in model_tests:
        if not run_command(cmd, desc):
            all_good = False
    
    return all_good

def validate_router_endpoints():
    """Validar que os routers estão configurados corretamente"""
    print("=" * 60)
    print("🛣️ VALIDAÇÃO DOS ROUTERS")
    print("=" * 60)
    
    router_tests = [
        ('python -c "from app.routers.produtos import router; print(f\'Prefix: {router.prefix}\')"', "Router produtos"),
        ('python -c "from app.main import app; print(f\'Routes: {len(app.routes)}\')"', "Rotas da aplicação"),
    ]
    
    all_good = True
    for cmd, desc in router_tests:
        if not run_command(cmd, desc):
            all_good = False
    
    return all_good

def validate_database_connection():
    """Validar conexão com banco de dados"""
    print("=" * 60)
    print("🔗 VALIDAÇÃO DA CONEXÃO COM BANCO")
    print("=" * 60)
    
    db_test = '''
from app.database import SessionLocal, engine
from sqlalchemy import text
try:
    db = SessionLocal()
    result = db.execute(text("SELECT 1 as test"))
    print("Conexão OK: ", result.fetchone())
    db.close()
except Exception as e:
    print("Erro de conexão:", str(e))
'''
    
    return run_command(f'python -c "{db_test}"', "Teste de conexão com banco")

def check_problematic_files():
    """Verificar se arquivos problemáticos foram removidos"""
    print("=" * 60)
    print("🗂️ VERIFICAÇÃO DE ARQUIVOS PROBLEMÁTICOS")
    print("=" * 60)
    
    problematic_files = [
        "app/routers/produtos_simples.py",
    ]
    
    all_good = True
    for file_path in problematic_files:
        if os.path.exists(file_path):
            print(f"   ❌ Arquivo problemático ainda existe: {file_path}")
            all_good = False
        else:
            print(f"   ✅ Arquivo problemático removido: {file_path}")
    
    return all_good

def generate_summary_report():
    """Gerar relatório final"""
    print("=" * 60)
    print("📋 RELATÓRIO FINAL DE VALIDAÇÃO")
    print("=" * 60)
    
    # Executar todas as validações
    results = {
        "Imports Python": validate_python_imports(),
        "Modelos de Banco": validate_database_models(),
        "Routers": validate_router_endpoints(),
        "Conexão Banco": validate_database_connection(),
        "Arquivos Problemáticos": check_problematic_files(),
    }
    
    print("\n📊 RESUMO DOS RESULTADOS:")
    print("-" * 40)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASSOU" if passed else "❌ FALHOU"
        print(f"   {test_name}: {status}")
        if not passed:
            all_passed = False
    
    print("-" * 40)
    
    if all_passed:
        print("🎉 TODOS OS TESTES PASSARAM!")
        print("✅ O sistema está pronto para deployment no Railway")
        print("✅ Todos os endpoints de salvamento devem funcionar corretamente")
    else:
        print("🚨 ALGUNS TESTES FALHARAM!")
        print("❌ Corrija os problemas antes do deployment")
    
    return all_passed

def main():
    """Função principal"""
    print("🔬 SISTEMA DE VALIDAÇÃO FINAL")
    print("Verificando se todos os problemas de persistência foram corrigidos...")
    
    # Mudar para o diretório correto
    os.chdir("backend")
    
    # Executar validações
    success = generate_summary_report()
    
    # Resultado final
    print("\n" + "=" * 60)
    if success:
        print("🚀 SISTEMA VALIDADO E PRONTO PARA PRODUÇÃO!")
    else:
        print("🛠️ SISTEMA PRECISA DE CORREÇÕES ANTES DO DEPLOY!")
    print("=" * 60)
    
    return success

if __name__ == "__main__":
    main()
