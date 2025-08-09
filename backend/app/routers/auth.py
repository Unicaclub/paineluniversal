from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db, settings
from ..models import Usuario, Empresa, TipoUsuario
from ..schemas import Token, LoginRequest, Usuario as UsuarioSchema, UsuarioRegister
from ..auth import autenticar_usuario, criar_access_token, gerar_codigo_verificacao, obter_usuario_atual, gerar_hash_senha, validar_cpf_basico
try:
    from ..services.email_service import email_service
except ImportError:
    # Fallback para quando não há serviço de email disponível
    class DummyEmailService:
        async def send_verification_code(self, email: str, name: str, code: str) -> bool:
            print(f"📧 MODO TESTE - Código {code} para {name} ({email})")
            return True
        async def send_welcome_email(self, email: str, name: str) -> bool:
            print(f"🎉 MODO TESTE - Email de boas-vindas para {name} ({email})")
            return True
    email_service = DummyEmailService()

router = APIRouter()
security = HTTPBearer()

codigos_verificacao = {}


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Autenticação multi-fator:
    1. Primeira etapa: CPF + senha
    2. Segunda etapa: código de verificação (simulado)
    """
    
    try:
        print(f"🔐 Tentativa de login para CPF: {login_data.cpf[:3]}***{login_data.cpf[-3:]}")
        
        usuario = autenticar_usuario(login_data.cpf, login_data.senha, db)
        if not usuario:
            print(f"❌ Usuário não encontrado ou senha incorreta")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="CPF ou senha incorretos"
            )
            
        print(f"✅ Usuário encontrado: {usuario.nome}")
        
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
    
    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    if not login_data.codigo_verificacao:
        codigo = gerar_codigo_verificacao()
        codigos_verificacao[login_data.cpf] = codigo
        
        # Enviar código por email
        email_enviado = await email_service.send_verification_code(
            to_email=usuario.email,
            to_name=usuario.nome,
            verification_code=codigo
        )
        
        # Sempre retorna sucesso em modo teste
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail=f"🧪 MODO TESTE: Código de verificação gerado. Verifique o console do backend para o código: {codigo}"
        )
    
    codigo_armazenado = codigos_verificacao.get(login_data.cpf)
    if not codigo_armazenado or codigo_armazenado != login_data.codigo_verificacao:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código de verificação inválido"
        )
    
    del codigos_verificacao[login_data.cpf]
    
    usuario.ultimo_login = db.query(Usuario).filter(Usuario.id == usuario.id).first().criado_em
    db.commit()
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = criar_access_token(
        data={"sub": usuario.cpf}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": UsuarioSchema.from_orm(usuario)
    }

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
        
        # Enviar email de boas-vindas
        await email_service.send_welcome_email(
            to_email=novo_usuario.email,
            to_name=novo_usuario.nome
        )
        
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

@router.post("/solicitar-codigo")
async def solicitar_codigo_verificacao(cpf: str, db: Session = Depends(get_db)):
    """Solicitar novo código de verificação"""
    usuario = db.query(Usuario).filter(Usuario.cpf == cpf).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    codigo = gerar_codigo_verificacao()
    codigos_verificacao[cpf] = codigo
    
    # Enviar código por email
    email_enviado = await email_service.send_verification_code(
        to_email=usuario.email,
        to_name=usuario.nome,
        verification_code=codigo
    )
    
    # Sempre retorna sucesso em modo teste
    return {
        "mensagem": f"🧪 MODO TESTE: Código gerado. Verifique o console do backend.",
        "codigo_desenvolvimento": codigo  # Mostrado em modo teste
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
