from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Checkin, Transacao, Evento, Usuario
from ..schemas import Checkin as CheckinSchema, CheckinCreate
from ..auth import obter_usuario_atual, validar_cpf_basico

router = APIRouter()

@router.post("/", response_model=CheckinSchema)
async def realizar_checkin(
    checkin: CheckinCreate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Realizar check-in no evento"""
    
    if not validar_cpf_basico(checkin.cpf):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF inválido"
        )
    
    evento = db.query(Evento).filter(Evento.id == checkin.evento_id).first()
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado"
        )
    
    if (usuario_atual.tipo.value != "admin" and 
        usuario_atual.empresa_id != evento.empresa_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    checkin_existente = db.query(Checkin).filter(
        Checkin.cpf == checkin.cpf,
        Checkin.evento_id == checkin.evento_id
    ).first()
    
    if checkin_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in já realizado para este CPF neste evento"
        )
    
    transacao = db.query(Transacao).filter(
        Transacao.cpf_comprador == checkin.cpf,
        Transacao.evento_id == checkin.evento_id,
        Transacao.status == "aprovada"
    ).first()
    
    if not transacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma transação aprovada encontrada para este CPF neste evento"
        )
    
    cpf_limpo = checkin.cpf.replace(".", "").replace("-", "")
    if checkin.validacao_cpf != cpf_limpo[:3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Validação de CPF incorreta"
        )
    
    checkin_data = checkin.dict()
    checkin_data['nome'] = transacao.nome_comprador
    checkin_data['usuario_id'] = usuario_atual.id
    checkin_data['transacao_id'] = transacao.id
    
    db_checkin = Checkin(**checkin_data)
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)
    
    return db_checkin

@router.get("/evento/{evento_id}", response_model=List[CheckinSchema])
async def listar_checkins_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Listar check-ins de um evento"""
    
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado"
        )
    
    if (usuario_atual.tipo.value != "admin" and 
        usuario_atual.empresa_id != evento.empresa_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    checkins = db.query(Checkin).filter(Checkin.evento_id == evento_id).all()
    return checkins

@router.get("/cpf/{cpf}")
async def verificar_checkin_cpf(
    cpf: str,
    evento_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Verificar se CPF já fez check-in no evento"""
    
    if not validar_cpf_basico(cpf):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF inválido"
        )
    
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado"
        )
    
    if (usuario_atual.tipo.value != "admin" and 
        usuario_atual.empresa_id != evento.empresa_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    checkin = db.query(Checkin).filter(
        Checkin.cpf == cpf,
        Checkin.evento_id == evento_id
    ).first()
    
    transacao = db.query(Transacao).filter(
        Transacao.cpf_comprador == cpf,
        Transacao.evento_id == evento_id,
        Transacao.status == "aprovada"
    ).first()
    
    return {
        "cpf": cpf,
        "evento_id": evento_id,
        "tem_transacao": transacao is not None,
        "ja_fez_checkin": checkin is not None,
        "nome": transacao.nome_comprador if transacao else None,
        "checkin_em": checkin.checkin_em if checkin else None
    }
