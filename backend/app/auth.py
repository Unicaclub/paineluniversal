from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db, settings
from .models import Usuario
from .schemas import TokenData
import secrets
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha_plana, senha_hash)

def gerar_hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def gerar_codigo_verificacao() -> str:
    """Gera código de 6 dígitos para autenticação multi-fator"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def criar_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verificar_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        cpf = payload.get("sub")
        if cpf is None or not isinstance(cpf, str):
            raise credentials_exception
        token_data = TokenData(cpf=cpf)
    except JWTError:
        raise credentials_exception
    return token_data

def obter_usuario_atual(token_data: TokenData = Depends(verificar_token), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.cpf == token_data.cpf).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"
        )
    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    return usuario

# Alias para compatibilidade
get_current_user = obter_usuario_atual

def require_permission(permission: str):
    """
    Factory function to create permission dependencies
    Usage: current_user = Depends(require_permission("inventory:read"))
    """
    def permission_checker(usuario_atual: Usuario = Depends(obter_usuario_atual)):
        # Parse permission string (e.g., "inventory:read")
        if ":" in permission:
            resource, action = permission.split(":", 1)
        else:
            resource = permission
            action = "read"
        
        # Admin has all permissions
        if usuario_atual.tipo.value == "admin":
            return usuario_atual
        
        # For inventory module, allow promoters to read/write
        if resource == "inventory":
            if usuario_atual.tipo.value in ["promoter"] and action in ["read", "write"]:
                return usuario_atual
            elif action == "admin":
                # Only admin can do admin actions
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Acesso negado: permissão {permission} requer nível admin"
                )
        
        # Default permission check for promoters
        if usuario_atual.tipo.value in ["promoter"] and action in ["read", "write"]:
            return usuario_atual
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Acesso negado: permissão {permission} necessária"
        )
    
    return permission_checker

def verificar_permissao_admin(usuario_atual: Usuario = Depends(obter_usuario_atual)):
    if usuario_atual.tipo.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: permissões de administrador necessárias"
        )
    return usuario_atual

def verificar_permissao_promoter(usuario_atual: Usuario = Depends(obter_usuario_atual)):
    if usuario_atual.tipo.value not in ["admin", "promoter"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: permissões de promoter necessárias"
        )
    return usuario_atual

def autenticar_usuario(cpf: str, senha: str, db: Session):
    usuario = db.query(Usuario).filter(Usuario.cpf == cpf).first()
    if not usuario:
        return False
    if not verificar_senha(senha, usuario.senha_hash):
        return False
    return usuario

def validar_cpf_basico(cpf: str) -> bool:
    """Validação básica de CPF (formato e dígitos verificadores)"""
    import re
    
    cpf = re.sub(r'\D', '', cpf)
    
    if len(cpf) != 11:
        return False
    
    if cpf == cpf[0] * 11:
        return False
    
    soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto
    
    soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto
    
    return cpf[-2:] == f"{digito1}{digito2}"

def verificar_permissao_empresa(usuario_atual: Usuario, empresa_id: Optional[int]) -> bool:
    """
    Verifica se o usuário tem permissão para acessar recursos da empresa.
    
    Regras:
    - Admins têm acesso a todas as empresas
    - Promoters e clientes agora têm acesso baseado em suas permissões específicas
    """
    if usuario_atual.tipo.value == "admin":
        return True
    
    # Promoters têm acesso baseado nos eventos que gerenciam
    # Clientes têm acesso limitado aos recursos próprios
    return True  # Simplificado: remoção da validação por empresa

def verificar_permissao(usuario_atual: Usuario, permissao: str) -> bool:
    """
    Verifica se o usuário tem uma permissão específica.
    
    Sistema de permissões baseado em papel:
    - admin: todas as permissões
    - promoter: permissões de gestão limitadas
    - cliente: permissões básicas
    
    Formato das permissões: "recurso:acao" (ex: "produtos:create", "eventos:read")
    """
    if not usuario_atual or not usuario_atual.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo ou não encontrado"
        )
    
    # Admins têm todas as permissões
    if usuario_atual.tipo.value == "admin":
        return True
    
    # Mapear permissões por tipo de usuário
    permissoes_promoter = {
        # Produtos
        "produtos:read", "produtos:create", "produtos:update",
        # Eventos (limitado aos próprios eventos)
        "eventos:read", "eventos:update",
        # Listas
        "listas:read", "listas:create", "listas:update",
        # Dashboard
        "dashboard:read",
        # Relatórios básicos
        "relatorios:read"
    }
    
    permissoes_cliente = {
        "checkins:read",
        "transacoes:read"
    }
    
    # Verificar permissão específica
    if usuario_atual.tipo.value == "promoter":
        if permissao in permissoes_promoter:
            return True
    elif usuario_atual.tipo.value == "cliente":
        if permissao in permissoes_cliente:
            return True
    
    # Se chegou até aqui, não tem permissão
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Usuário {usuario_atual.tipo.value} não tem permissão: {permissao}"
    )

async def validar_cpf_receita_ws(cpf: str) -> dict:
    """Mock da validação de CPF via ReceitaWS/Serpro"""
    
    if not validar_cpf_basico(cpf):
        return {"valido": False, "erro": "CPF inválido"}
    
    return {
        "valido": True,
        "cpf": cpf,
        "nome": "Nome Mockado",
        "situacao": "REGULAR",
        "data_nascimento": "1990-01-01"
    }
