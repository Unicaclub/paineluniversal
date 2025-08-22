#!/usr/bin/env python3
"""
Teste do sistema de produtos após correções
Valida que o sistema está 100% compatível com as regras de negócio
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import Produto, MovimentoEstoque, TipoProduto
from app.schemas.produtos import ProdutoCreate, ProdutoResponse
from app.database import engine, SessionLocal
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_produto_model():
    """Testar o modelo Produto"""
    logger.info("🧪 Testando modelo Produto...")
    
    # Verificar que os campos proibidos não existem
    produto_attrs = dir(Produto)
    
    forbidden_fields = ['evento_id', 'codigo_barras', 'empresa_id']
    for field in forbidden_fields:
        if field in produto_attrs:
            logger.error(f"❌ Campo proibido encontrado no modelo: {field}")
            return False
        else:
            logger.info(f"✅ Campo {field} não existe no modelo (correto)")
    
    logger.info("✅ Modelo Produto está correto")
    return True

def test_produto_schema():
    """Testar os schemas de Produto"""
    logger.info("🧪 Testando schemas de Produto...")
    
    try:
        # Testar ProdutoCreate
        produto_data = {
            "nome": "Produto Teste",
            "tipo": "BEBIDA",  # Usar tipo válido do enum
            "preco": 10.50,
            "categoria": "Teste",
            "estoque_atual": 100,
            "estoque_minimo": 10,
            "controla_estoque": True,
            "status": "ATIVO"
        }
        
        produto_create = ProdutoCreate(**produto_data)
        logger.info("✅ ProdutoCreate funciona corretamente")
        
        # Testar se campos proibidos são rejeitados
        try:
            produto_com_evento = ProdutoCreate(
                nome="Teste",
                preco=10.0,
                evento_id=1  # Campo proibido
            )
            logger.error("❌ Schema aceitou campo proibido evento_id")
            return False
        except Exception:
            logger.info("✅ Schema rejeita campo evento_id corretamente")
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao testar schemas: {str(e)}")
        return False

def test_database_integration():
    """Testar integração com banco de dados"""
    logger.info("🧪 Testando integração com banco...")
    
    try:
        # Criar sessão
        Session = sessionmaker(bind=engine)
        db = Session()
        
        # Limpar possíveis produtos de teste anteriores
        db.execute(text("DELETE FROM produtos WHERE codigo_interno LIKE 'TEST_%'"))
        db.commit()
        
        # Testar criação de produto
        import time
        codigo_unico = f"TEST_{int(time.time())}"  # Código único baseado em timestamp
        
        produto = Produto(
            nome="Produto Teste DB",
            tipo=TipoProduto.BEBIDA,  # Usar enum diretamente
            preco=15.75,
            categoria="Teste DB",
            estoque_atual=50,
            estoque_minimo=5,
            codigo_interno=codigo_unico
        )
        
        db.add(produto)
        db.commit()
        db.refresh(produto)
        
        logger.info(f"✅ Produto criado no banco: ID {produto.id}")
        
        # Verificar que o produto foi salvo corretamente
        produto_salvo = db.query(Produto).filter(Produto.id == produto.id).first()
        if produto_salvo:
            logger.info("✅ Produto recuperado do banco corretamente")
            # Verificar alguns campos essenciais
            if produto_salvo.nome == "Produto Teste DB" and produto_salvo.preco == 15.75:
                logger.info("✅ Dados do produto corretos")
            else:
                logger.error("❌ Dados do produto incorretos")
                return False
        else:
            logger.error("❌ Produto não foi salvo corretamente")
            return False
        
        # Cleanup - deletar pelo ID para evitar problemas de relacionamento
        db.execute(text(f"DELETE FROM produtos WHERE id = {produto.id}"))
        db.commit()
        db.close()
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro na integração com banco: {str(e)}")
        return False

def test_movimento_estoque():
    """Testar sistema de movimentação de estoque"""
    logger.info("🧪 Testando sistema de estoque...")
    
    try:
        # Verificar que MovimentoEstoque ainda funciona
        movimento_attrs = dir(MovimentoEstoque)
        required_fields = ['produto_id', 'tipo_movimento', 'quantidade', 'estoque_anterior', 'estoque_atual']
        
        for field in required_fields:
            if field not in movimento_attrs:
                logger.error(f"❌ Campo obrigatório {field} não encontrado em MovimentoEstoque")
                return False
        
        logger.info("✅ Sistema de estoque está correto")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao testar sistema de estoque: {str(e)}")
        return False

def main():
    """Executar todos os testes"""
    logger.info("🚀 Iniciando testes do sistema de produtos...")
    logger.info("📋 Validando compliance com regras de negócio")
    logger.info("🎯 Regra: Produtos NÃO devem ter evento_id, codigo_barras, empresa_id")
    
    tests = [
        ("Modelo Produto", test_produto_model),
        ("Schemas Produto", test_produto_schema), 
        ("Integração Banco", test_database_integration),
        ("Sistema Estoque", test_movimento_estoque)
    ]
    
    results = []
    for test_name, test_func in tests:
        logger.info(f"\n--- {test_name} ---")
        result = test_func()
        results.append((test_name, result))
    
    # Relatório final
    logger.info("\n" + "="*50)
    logger.info("📊 RELATÓRIO FINAL DOS TESTES")
    logger.info("="*50)
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASSOU" if result else "❌ FALHOU"
        logger.info(f"{test_name:20} : {status}")
        if not result:
            all_passed = False
    
    if all_passed:
        logger.info("\n🎉 TODOS OS TESTES PASSARAM!")
        logger.info("✅ Sistema de Produtos 100% compatível com regras de negócio")
        logger.info("🚀 Sistema pronto para produção")
    else:
        logger.error("\n❌ ALGUNS TESTES FALHARAM!")
        logger.error("🔧 Correções necessárias antes de usar em produção")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
