from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db, settings
from ..models import Usuario, Empresa, TipoUsuario
from ..schemas import Token, LoginRequest, Usuario as UsuarioSchema, UsuarioRegister
from ..auth import autenticar_usuario, criar_access_token, obter_usuario_atual, gerar_hash_senha, validar_cpf_basico

router = APIRouter()
security = HTTPBearer()

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Autenticação simplificada:
    - CPF + senha diretamente
    - Sem código de verificação
    """
    
    try:
        print(f"🔐 Tentativa de login para CPF: {login_data.cpf[:3]}***{login_data.cpf[-3:]}")
        
        # Verificar se os dados foram recebidos corretamente
        if not login_data.cpf or not login_data.senha:
            print(f"❌ Dados incompletos: CPF={bool(login_data.cpf)}, Senha={bool(login_data.senha)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF e senha são obrigatórios"
            )
        
        # Autenticar usuário
        usuario = autenticar_usuario(login_data.cpf, login_data.senha, db)
        if not usuario:
            print(f"❌ Usuário não encontrado ou senha incorreta")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="CPF ou senha incorretos"
            )
            
        print(f"✅ Usuário encontrado: {usuario.nome}")
        
        # Verificar se usuário está ativo
        if not usuario.ativo:
            print(f"❌ Usuário inativo: {usuario.cpf}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inativo"
            )
        
        # Criar token de acesso diretamente
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = criar_access_token(
            data={"sub": usuario.cpf}, expires_delta=access_token_expires
        )
        
        # Atualizar último login
        from datetime import datetime
        usuario.ultimo_login = datetime.now()
        db.commit()
        
        print(f"✅ Login realizado com sucesso para {usuario.nome}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "usuario": UsuarioSchema.from_orm(usuario)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Erro interno no login: {str(e)}")
        print(f"Tipo do erro: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno do servidor: {str(e)}"
        )

@router.post("/register", response_model=UsuarioSchema)
async def registrar_usuario(usuario_data: UsuarioRegister, db: Session = Depends(get_db)):
    """Registro público de usuários"""
    
    # Verificar se CPF já existe
    usuario_existente = db.query(Usuario).filter(Usuario.cpf == usuario_data.cpf).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado"
        )
    
    # Verificar se email já existe
    email_existente = db.query(Usuario).filter(Usuario.email == usuario_data.email).first()
    if email_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    try:
        # Criar usuário sem empresa obrigatória
        senha_hash = gerar_hash_senha(usuario_data.senha)
        
        novo_usuario = Usuario(
            cpf=usuario_data.cpf,
            nome=usuario_data.nome,
            email=usuario_data.email,
            telefone=usuario_data.telefone or "",
            senha_hash=senha_hash,
            tipo=usuario_data.tipo,
            ativo=True  # Usuários registrados publicamente ficam ativos por padrão
        )
        
        db.add(novo_usuario)
        db.commit()
        db.refresh(novo_usuario)
        
        print(f"✅ Novo usuário registrado: {novo_usuario.nome}")
        
        return novo_usuario
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}"
        )

@router.get("/me", response_model=UsuarioSchema)
async def obter_perfil(usuario_atual: Usuario = Depends(obter_usuario_atual)):
    """Obter dados do usuário logado"""
    return usuario_atual

@router.post("/logout")
async def logout(usuario_atual: Usuario = Depends(obter_usuario_atual)):
    """Logout do usuário (invalidar token)"""
    return {"mensagem": "Logout realizado com sucesso"}

@router.post("/forgot-password")
async def forgot_password(cpf: str, db: Session = Depends(get_db)):
    """
    Esqueci a senha - Simplificado
    Retorna mensagem genérica por segurança
    """
    
    # Validar CPF básico
    if not validar_cpf_basico(cpf):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF inválido"
        )
    
    # Sempre retorna sucesso por questões de segurança
    # (não revela se o CPF existe ou não)
    return {
        "mensagem": "Se o CPF estiver cadastrado, as instruções de recuperação foram enviadas.",
        "instrucoes": "Entre em contato com o administrador do sistema para recuperar sua senha."
    }

@router.post("/setup-inicial")
async def setup_inicial(db: Session = Depends(get_db)):
    """Setup inicial do sistema - Criar empresa e admin padrão (apenas se não houver usuários)"""
    
    # Verificar se já existem usuários no sistema
    usuario_existente = db.query(Usuario).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sistema já foi inicializado. Já existem usuários cadastrados."
        )
    
    try:
        # Criar empresa padrão
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
        
        # Criar usuário admin
        senha_hash = gerar_hash_senha("admin123")
        admin = Usuario(
            cpf="00000000000",
            nome="Administrador Sistema",
            email="admin@paineluniversal.com",
            telefone="(11) 99999-0000",
            senha_hash=senha_hash,
            tipo=TipoUsuario.ADMIN,
            ativo=True
        )
        db.add(admin)
        
        # Criar usuário promoter
        senha_hash_promoter = gerar_hash_senha("promoter123")
        promoter = Usuario(
            cpf="11111111111",
            nome="Promoter Demo",
            email="promoter@paineluniversal.com",
            telefone="(11) 99999-1111",
            senha_hash=senha_hash_promoter,
            tipo=TipoUsuario.PROMOTER,
            ativo=True
        )
        db.add(promoter)
        
        db.commit()
        
        print("✅ Setup inicial concluído com sucesso")
        
        return {
            "mensagem": "Setup inicial realizado com sucesso!",
            "empresa": {
                "id": empresa.id,
                "nome": empresa.nome,
                "cnpj": empresa.cnpj
            },
            "credenciais": {
                "admin": {
                    "cpf": "00000000000",
                    "senha": "admin123"
                },
                "promoter": {
                    "cpf": "11111111111", 
                    "senha": "promoter123"
                }
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao realizar setup inicial: {str(e)}"
        )