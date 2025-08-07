from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Lista, Evento, Usuario
from ..schemas import Lista as ListaSchema, ListaCreate
from ..auth import obter_usuario_atual

router = APIRouter()

@router.post("/", response_model=ListaSchema)
async def criar_lista(
    lista: ListaCreate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Criar nova lista para evento"""
    
    evento = db.query(Evento).filter(Evento.id == lista.evento_id).first()
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
    
    db_lista = Lista(**lista.dict())
    db.add(db_lista)
    db.commit()
    db.refresh(db_lista)
    
    return db_lista

@router.get("/evento/{evento_id}", response_model=List[ListaSchema])
async def listar_listas_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Listar listas de um evento"""
    
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
    
    listas = db.query(Lista).filter(Lista.evento_id == evento_id).all()
    return listas

@router.get("/promoter/{promoter_id}", response_model=List[ListaSchema])
async def listar_listas_promoter(
    promoter_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Listar listas de um promoter"""
    
    if (usuario_atual.tipo.value != "admin" and 
        usuario_atual.id != promoter_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    listas = db.query(Lista).filter(Lista.promoter_id == promoter_id).all()
    return listas

@router.put("/{lista_id}", response_model=ListaSchema)
async def atualizar_lista(
    lista_id: int,
    lista_update: ListaCreate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Atualizar dados da lista"""
    
    lista = db.query(Lista).filter(Lista.id == lista_id).first()
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista não encontrada"
        )
    
    evento = db.query(Evento).filter(Evento.id == lista.evento_id).first()
    if (usuario_atual.tipo.value != "admin" and 
        usuario_atual.empresa_id != evento.empresa_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    for field, value in lista_update.dict(exclude={'evento_id'}).items():
        setattr(lista, field, value)
    
    db.commit()
    db.refresh(lista)
    
    return lista

@router.delete("/{lista_id}")
async def desativar_lista(
    lista_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Desativar lista"""
    
    lista = db.query(Lista).filter(Lista.id == lista_id).first()
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista não encontrada"
        )
    
    evento = db.query(Evento).filter(Evento.id == lista.evento_id).first()
    if (usuario_atual.tipo.value != "admin" and 
        usuario_atual.empresa_id != evento.empresa_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    lista.ativa = False
    db.commit()
    
    return {"mensagem": "Lista desativada com sucesso"}
