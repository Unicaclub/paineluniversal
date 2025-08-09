#!/usr/bin/env python3
"""
Script para criar dados iniciais do sistema - Admin e Empresa padrão
"""
import os
import sys
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Adiciona o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import engine
    from app.models import Base, Empresa, Usuario, TipoUsuario
    
    # Configuração de senha
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    print("🗄️ Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    
    # Criar sessão
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar se já existe empresa
        empresa_existente = db.query(Empresa).filter(Empresa.cnpj == "00000000000100").first()
        
        if not empresa_existente:
            print("🏢 Criando empresa padrão...")
            empresa = Empresa(
                nome="Painel Universal - Empresa Demo",
                cnpj="00000000000100",
                email="contato@paineluniversal.com",
                telefone="(11) 99999-9999",
                endereco="Endereço da empresa demo",
                ativa=True
            )
            db.add(empresa)
            db.commit()
            db.refresh(empresa)
            print(f"✅ Empresa criada: {empresa.nome} (ID: {empresa.id})")
        else:
            empresa = empresa_existente
            print(f"ℹ️ Empresa já existe: {empresa.nome} (ID: {empresa.id})")
        
        # Verificar se já existe usuário admin
        admin_existente = db.query(Usuario).filter(Usuario.cpf == "00000000000").first()
        
        if not admin_existente:
            print("👤 Criando usuário admin...")
            senha_hash = pwd_context.hash("admin123")
            
            admin = Usuario(
                cpf="00000000000",
                nome="Administrador Sistema",
                email="admin@paineluniversal.com",
                telefone="(11) 99999-0000",
                senha_hash=senha_hash,
                tipo=TipoUsuario.ADMIN,
                ativo=True,
                empresa_id=empresa.id
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"✅ Admin criado: {admin.nome}")
            print(f"📋 CPF: {admin.cpf}")
            print(f"🔑 Senha: admin123")
        else:
            print(f"ℹ️ Admin já existe: {admin_existente.nome}")
            print(f"📋 CPF: {admin_existente.cpf}")
        
        # Criar promoter de exemplo
        promoter_existente = db.query(Usuario).filter(Usuario.cpf == "11111111111").first()
        
        if not promoter_existente:
            print("👤 Criando promoter de exemplo...")
            senha_hash = pwd_context.hash("promoter123")
            
            promoter = Usuario(
                cpf="11111111111",
                nome="Promoter Demo",
                email="promoter@paineluniversal.com",
                telefone="(11) 99999-1111",
                senha_hash=senha_hash,
                tipo=TipoUsuario.PROMOTER,
                ativo=True,
                empresa_id=empresa.id
            )
            db.add(promoter)
            db.commit()
            db.refresh(promoter)
            print(f"✅ Promoter criado: {promoter.nome}")
            print(f"📋 CPF: {promoter.cpf}")
            print(f"🔑 Senha: promoter123")
        else:
            print(f"ℹ️ Promoter já existe: {promoter_existente.nome}")
        
        print("\n🎉 Dados iniciais criados com sucesso!")
        print("\n📋 Credenciais para login:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("👤 ADMIN:")
        print("   CPF: 00000000000 (ou 000.000.000-00)")
        print("   Senha: admin123")
        print()
        print("👤 PROMOTER:")
        print("   CPF: 11111111111 (ou 111.111.111-11)")
        print("   Senha: promoter123")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        
    except Exception as e:
        print(f"❌ Erro ao criar dados: {e}")
        db.rollback()
        
    finally:
        db.close()
        
except Exception as e:
    print(f"❌ Erro de conexão: {e}")
    sys.exit(1)
