from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal
from ..database import get_db
from ..models import Evento, Transacao, Checkin, Usuario, Lista, PromoterEvento
from ..schemas import DashboardResumo, RankingPromoter
from ..auth import obter_usuario_atual

router = APIRouter()

@router.get("/resumo", response_model=DashboardResumo)
async def obter_resumo_dashboard(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Obter resumo do dashboard"""
    
    if usuario_atual.tipo.value == "admin":
        eventos_query = db.query(Evento)
        transacoes_query = db.query(Transacao)
        checkins_query = db.query(Checkin)
    else:
        eventos_query = db.query(Evento).filter(Evento.empresa_id == usuario_atual.empresa_id)
        transacoes_query = db.query(Transacao).join(Evento).filter(Evento.empresa_id == usuario_atual.empresa_id)
        checkins_query = db.query(Checkin).join(Evento).filter(Evento.empresa_id == usuario_atual.empresa_id)
    
    total_eventos = eventos_query.count()
    total_vendas = transacoes_query.filter(Transacao.status == "aprovada").count()
    total_checkins = checkins_query.count()
    
    receita_total = transacoes_query.filter(Transacao.status == "aprovada").with_entities(
        func.sum(Transacao.valor)
    ).scalar() or Decimal('0.00')
    
    hoje = date.today()
    eventos_hoje = eventos_query.filter(func.date(Evento.data_evento) == hoje).count()
    vendas_hoje = transacoes_query.filter(
        func.date(Transacao.criado_em) == hoje,
        Transacao.status == "aprovada"
    ).count()
    
    return DashboardResumo(
        total_eventos=total_eventos,
        total_vendas=total_vendas,
        total_checkins=total_checkins,
        receita_total=receita_total,
        eventos_hoje=eventos_hoje,
        vendas_hoje=vendas_hoje
    )

@router.get("/ranking-promoters", response_model=List[RankingPromoter])
async def obter_ranking_promoters(
    evento_id: Optional[int] = None,
    limit: int = 10,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Obter ranking de promoters por vendas"""
    
    query = db.query(
        Usuario.id.label('promoter_id'),
        Usuario.nome.label('nome_promoter'),
        func.count(Transacao.id).label('total_vendas'),
        func.sum(Transacao.valor).label('receita_gerada')
    ).join(
        Lista, Lista.promoter_id == Usuario.id
    ).join(
        Transacao, Transacao.lista_id == Lista.id
    ).filter(
        Transacao.status == "aprovada",
        Usuario.tipo == "promoter"
    )
    
    if usuario_atual.tipo.value != "admin":
        query = query.join(Evento, Evento.id == Transacao.evento_id).filter(
            Evento.empresa_id == usuario_atual.empresa_id
        )
    
    if evento_id:
        query = query.filter(Transacao.evento_id == evento_id)
    
    ranking_data = query.group_by(
        Usuario.id, Usuario.nome
    ).order_by(
        desc('total_vendas')
    ).limit(limit).all()
    
    ranking = []
    for i, row in enumerate(ranking_data, 1):
        ranking.append(RankingPromoter(
            promoter_id=row.promoter_id,
            nome_promoter=row.nome_promoter,
            total_vendas=row.total_vendas,
            receita_gerada=row.receita_gerada or Decimal('0.00'),
            posicao=i
        ))
    
    return ranking

@router.get("/vendas-tempo-real")
async def obter_vendas_tempo_real(
    evento_id: Optional[int] = None,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Obter dados de vendas em tempo real"""
    
    query = db.query(Transacao)
    
    if usuario_atual.tipo.value != "admin":
        query = query.join(Evento).filter(Evento.empresa_id == usuario_atual.empresa_id)
    
    if evento_id:
        query = query.filter(Transacao.evento_id == evento_id)
    
    vendas_por_hora = query.filter(
        Transacao.criado_em >= datetime.now() - timedelta(hours=24),
        Transacao.status == "aprovada"
    ).with_entities(
        func.extract('hour', Transacao.criado_em).label('hora'),
        func.count(Transacao.id).label('vendas'),
        func.sum(Transacao.valor).label('receita')
    ).group_by('hora').order_by('hora').all()
    
    vendas_por_lista = query.join(Lista).filter(
        Transacao.status == "aprovada"
    ).with_entities(
        Lista.tipo.label('tipo_lista'),
        func.count(Transacao.id).label('vendas'),
        func.sum(Transacao.valor).label('receita')
    ).group_by(Lista.tipo).all()
    
    return {
        "vendas_por_hora": [
            {
                "hora": int(row.hora),
                "vendas": row.vendas,
                "receita": float(row.receita or 0)
            }
            for row in vendas_por_hora
        ],
        "vendas_por_lista": [
            {
                "tipo": row.tipo_lista.value,
                "vendas": row.vendas,
                "receita": float(row.receita or 0)
            }
            for row in vendas_por_lista
        ]
    }

@router.get("/aniversariantes")
async def obter_aniversariantes(
    evento_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Obter lista de aniversariantes do evento"""
    
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
    
    
    return {
        "evento_id": evento_id,
        "data_evento": evento.data_evento,
        "aniversariantes": [],
        "total": 0,
        "observacao": "Funcionalidade requer integração com API de validação de CPF"
    }
