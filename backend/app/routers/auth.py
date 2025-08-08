from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db, settings
from ..models import Usuario, Empresa, TipoUsuario
from ..schemas import Token, LoginRequest, Usuario as UsuarioSchema, UsuarioRegister
from ..auth import autenticar_usuario, criar_access_token, gerar_codigo_verificacao, obter_usuario_atual, gerar_hash_senha, validar_cpf_basico

router = APIRouter()
security = HTTPBearer()

codigos_verificacao = {}

@router.post("/register", response_model=UsuarioSchema)
async def registrar_usuario(usuario_data: UsuarioRegister, db: Session = Depends(get_db)):
    """Registro público de usuários"""
    
    # Validar CPF
    if not validar_cpf_basico(usuario_data.cpf):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF inválido"
        )
    
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
        # Buscar primeira empresa disponível ou criar uma padrão
        empresa = db.query(Empresa).first()
        if not empresa:
            # Se não houver empresa, criar uma padrão
            empresa = Empresa(
                nome="Empresa Padrão",
                cnpj="00000000000100",
                email="contato@empresa.com",
                telefone="(11) 0000-0000",
                endereco="Endereço padrão",
                ativa=True
            )
            db.add(empresa)
            db.commit()
            db.refresh(empresa)
        
        # Criar usuário
        senha_hash = gerar_hash_senha(usuario_data.senha)
        novo_usuario = Usuario(
            cpf=usuario_data.cpf,
            nome=usuario_data.nome,
            email=usuario_data.email,
            telefone=usuario_data.telefone,
            senha_hash=senha_hash,
            tipo=usuario_data.tipo,
            ativo=True,
            empresa_id=empresa.id
        )
        
        db.add(novo_usuario)
        db.commit()
        db.refresh(novo_usuario)
        
        return novo_usuario
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao registrar usuário: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Autenticação multi-fator:
    1. Primeira etapa: CPF + senha
    2. Segunda etapa: código de verificação (simulado)
    """
    
    usuario = autenticar_usuario(login_data.cpf, login_data.senha, db)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CPF ou senha incorretos"
        )
    
    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    if not login_data.codigo_verificacao:
        codigo = gerar_codigo_verificacao()
        codigos_verificacao[login_data.cpf] = codigo
        
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail=f"Código de verificação enviado. Use: {codigo}"
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
    
    # Buscar uma empresa padrão (primeira empresa ativa)
    empresa_padrao = db.query(Empresa).filter(Empresa.ativa == True).first()
    if not empresa_padrao:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Nenhuma empresa disponível para cadastro. Entre em contato com o administrador."
        )
    
    try:
        # Criar usuário
        senha_hash = gerar_hash_senha(usuario_data.senha)
        
        novo_usuario = Usuario(
            cpf=usuario_data.cpf,
            nome=usuario_data.nome,
            email=usuario_data.email,
            telefone=usuario_data.telefone or "",
            senha_hash=senha_hash,
            tipo=usuario_data.tipo,
            ativo=True,  # Usuários registrados publicamente ficam ativos por padrão
            empresa_id=empresa_padrao.id
        )
        
        db.add(novo_usuario)
        db.commit()
        db.refresh(novo_usuario)
        
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
    
    return {
        "mensagem": "Código de verificação enviado",
        "codigo_desenvolvimento": codigo  # Remover em produção
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
            ativo=True,
            empresa_id=empresa.id
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
            ativo=True,
            empresa_id=empresa.id
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
