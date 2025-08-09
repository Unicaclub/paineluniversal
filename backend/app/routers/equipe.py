from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from typing import List, Optional
from ..database import get_db
from ..models import Colaborador, Cargo, Usuario, Empresa
from ..schemas import (
    Colaborador as ColaboradorSchema, 
    ColaboradorCreate,
    ColaboradorUpdate,
    Cargo as CargoSchema,
    CargoCreate,
    CargoUpdate
)
from ..auth import obter_usuario_atual, verificar_permissao_admin, validar_cpf_basico

router = APIRouter(prefix="/equipe", tags=["Gestão de Equipe"])

@router.post("/colaboradores", response_model=ColaboradorSchema)
async def criar_colaborador(
    colaborador: ColaboradorCreate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(verificar_permissao_admin)
):
    """Criar novo colaborador"""
    if not validar_cpf_basico(colaborador.cpf):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF inválido"
        )
    
    db_colaborador_email = db.query(Colaborador).filter(Colaborador.email == colaborador.email).first()
    if db_colaborador_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    db_colaborador_cpf = db.query(Colaborador).filter(Colaborador.cpf == colaborador.cpf).first()
    if db_colaborador_cpf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado"
        )
    
    cargo = db.query(Cargo).filter(Cargo.id == colaborador.cargo_id).first()
    if not cargo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cargo não encontrado"
        )
    
    db_colaborador = Colaborador(
        **colaborador.dict(),
        criado_por=usuario_atual.id
    )
    db.add(db_colaborador)
    db.commit()
    db.refresh(db_colaborador)
    
    return db_colaborador

@router.get("/colaboradores", response_model=List[ColaboradorSchema])
async def listar_colaboradores(
    skip: int = 0,
    limit: int = 100,
    cargo_id: Optional[int] = None,
    status: Optional[str] = None,
    nome: Optional[str] = None,
    email: Optional[str] = None,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Listar colaboradores com filtros"""
    query = db.query(Colaborador).options(joinedload(Colaborador.cargo))
    
    if cargo_id:
        query = query.filter(Colaborador.cargo_id == cargo_id)
    
    if status:
        query = query.filter(Colaborador.status == status)
    
    if nome:
        query = query.filter(Colaborador.nome.ilike(f"%{nome}%"))
    
    if email:
        query = query.filter(Colaborador.email.ilike(f"%{email}%"))
    
    colaboradores = query.offset(skip).limit(limit).all()
    return colaboradores

@router.get("/colaboradores/{colaborador_id}", response_model=ColaboradorSchema)
async def obter_colaborador(
    colaborador_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Obter colaborador por ID"""
    colaborador = db.query(Colaborador).options(joinedload(Colaborador.cargo)).filter(Colaborador.id == colaborador_id).first()
    if not colaborador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )
    return colaborador

@router.put("/colaboradores/{colaborador_id}", response_model=ColaboradorSchema)
async def atualizar_colaborador(
    colaborador_id: int,
    colaborador_update: ColaboradorUpdate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(verificar_permissao_admin)
):
    """Atualizar colaborador"""
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )
    
    update_data = colaborador_update.dict(exclude_unset=True)
    
    if "cpf" in update_data and update_data["cpf"] != db_colaborador.cpf:
        if not validar_cpf_basico(update_data["cpf"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF inválido"
            )
        
        existing_cpf = db.query(Colaborador).filter(
            and_(Colaborador.cpf == update_data["cpf"], Colaborador.id != colaborador_id)
        ).first()
        if existing_cpf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF já cadastrado"
            )
    
    if "email" in update_data and update_data["email"] != db_colaborador.email:
        existing_email = db.query(Colaborador).filter(
            and_(Colaborador.email == update_data["email"], Colaborador.id != colaborador_id)
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )
    
    if "cargo_id" in update_data:
        cargo = db.query(Cargo).filter(Cargo.id == update_data["cargo_id"]).first()
        if not cargo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cargo não encontrado"
            )
    
    for field, value in update_data.items():
        setattr(db_colaborador, field, value)
    
    db.commit()
    db.refresh(db_colaborador)
    return db_colaborador

@router.delete("/colaboradores/{colaborador_id}")
async def excluir_colaborador(
    colaborador_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(verificar_permissao_admin)
):
    """Excluir colaborador"""
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )
    
    db.delete(db_colaborador)
    db.commit()
    return {"message": "Colaborador excluído com sucesso"}

@router.post("/cargos", response_model=CargoSchema)
async def criar_cargo(
    cargo: CargoCreate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(verificar_permissao_admin)
):
    """Criar novo cargo"""
    db_cargo_nome = db.query(Cargo).filter(Cargo.nome == cargo.nome).first()
    if db_cargo_nome:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cargo com este nome já existe"
        )
    
    db_cargo = Cargo(**cargo.dict())
    db.add(db_cargo)
    db.commit()
    db.refresh(db_cargo)
    
    return db_cargo

@router.get("/cargos", response_model=List[CargoSchema])
async def listar_cargos(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Listar todos os cargos"""
    cargos = db.query(Cargo).filter(Cargo.ativo == True).all()
    return cargos

@router.get("/cargos/{cargo_id}", response_model=CargoSchema)
async def obter_cargo(
    cargo_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Obter cargo por ID"""
    cargo = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if not cargo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cargo não encontrado"
        )
    return cargo

@router.put("/cargos/{cargo_id}", response_model=CargoSchema)
async def atualizar_cargo(
    cargo_id: int,
    cargo_update: CargoUpdate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(verificar_permissao_admin)
):
    """Atualizar cargo e permissões"""
    db_cargo = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if not db_cargo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cargo não encontrado"
        )
    
    update_data = cargo_update.dict(exclude_unset=True)
    
    if "nome" in update_data and update_data["nome"] != db_cargo.nome:
        existing_nome = db.query(Cargo).filter(
            and_(Cargo.nome == update_data["nome"], Cargo.id != cargo_id)
        ).first()
        if existing_nome:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cargo com este nome já existe"
            )
    
    for field, value in update_data.items():
        setattr(db_cargo, field, value)
    
    db.commit()
    db.refresh(db_cargo)
    return db_cargo

@router.delete("/cargos/{cargo_id}")
async def excluir_cargo(
    cargo_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(verificar_permissao_admin)
):
    """Excluir cargo"""
    db_cargo = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if not db_cargo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cargo não encontrado"
        )
    
    colaboradores_count = db.query(Colaborador).filter(Colaborador.cargo_id == cargo_id).count()
    if colaboradores_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não é possível excluir cargo com {colaboradores_count} colaboradores vinculados"
        )
    
    db.delete(db_cargo)
    db.commit()
    return {"message": "Cargo excluído com sucesso"}

@router.get("/estatisticas")
async def obter_estatisticas_equipe(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Obter estatísticas da equipe"""
    total_colaboradores = db.query(Colaborador).count()
    colaboradores_ativos = db.query(Colaborador).filter(Colaborador.status == "ativo").count()
    total_cargos = db.query(Cargo).filter(Cargo.ativo == True).count()
    
    taxa_atividade = round((colaboradores_ativos / total_colaboradores * 100) if total_colaboradores > 0 else 0, 1)
    
    return {
        "total_colaboradores": total_colaboradores,
        "colaboradores_ativos": colaboradores_ativos,
        "total_cargos": total_cargos,
        "taxa_atividade": taxa_atividade
    }
