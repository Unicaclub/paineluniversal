from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from ..database import get_db
from ..models import Evento, Transacao, Checkin, Usuario, Lista
from ..schemas import RelatorioVendas
from ..auth import obter_usuario_atual, verificar_permissao_admin
import csv
import io
import json
from decimal import Decimal

router = APIRouter()

@router.get("/vendas/{evento_id}", response_model=RelatorioVendas)
async def gerar_relatorio_vendas(
    evento_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Gerar relatório de vendas de um evento"""
    
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
    
    transacoes = db.query(Transacao).filter(
        Transacao.evento_id == evento_id,
        Transacao.status == "aprovada"
    ).all()
    
    total_vendas = len(transacoes)
    receita_total = sum(t.valor for t in transacoes)
    
    vendas_por_lista = {}
    for transacao in transacoes:
        lista = db.query(Lista).filter(Lista.id == transacao.lista_id).first()
        if lista:
            tipo_lista = lista.tipo.value
            if tipo_lista not in vendas_por_lista:
                vendas_por_lista[tipo_lista] = {"vendas": 0, "receita": Decimal('0.00')}
            vendas_por_lista[tipo_lista]["vendas"] += 1
            vendas_por_lista[tipo_lista]["receita"] += transacao.valor
    
    vendas_por_promoter = {}
    for transacao in transacoes:
        lista = db.query(Lista).filter(Lista.id == transacao.lista_id).first()
        if lista and lista.promoter_id:
            promoter = db.query(Usuario).filter(Usuario.id == lista.promoter_id).first()
            if promoter:
                nome_promoter = promoter.nome
                if nome_promoter not in vendas_por_promoter:
                    vendas_por_promoter[nome_promoter] = {"vendas": 0, "receita": Decimal('0.00')}
                vendas_por_promoter[nome_promoter]["vendas"] += 1
                vendas_por_promoter[nome_promoter]["receita"] += transacao.valor
    
    return RelatorioVendas(
        evento_id=evento_id,
        nome_evento=evento.nome,
        total_vendas=total_vendas,
        receita_total=receita_total,
        vendas_por_lista=[
            {"tipo": k, "vendas": v["vendas"], "receita": float(v["receita"])}
            for k, v in vendas_por_lista.items()
        ],
        vendas_por_promoter=[
            {"promoter": k, "vendas": v["vendas"], "receita": float(v["receita"])}
            for k, v in vendas_por_promoter.items()
        ]
    )

@router.get("/vendas/{evento_id}/csv")
async def exportar_vendas_csv(
    evento_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Exportar relatório de vendas em CSV"""
    
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
    
    transacoes = db.query(Transacao).filter(
        Transacao.evento_id == evento_id,
        Transacao.status == "aprovada"
    ).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        'ID Transação', 'CPF Comprador', 'Nome Comprador', 'Email', 'Telefone',
        'Valor', 'Método Pagamento', 'Lista', 'Promoter', 'Data Compra'
    ])
    
    for transacao in transacoes:
        lista = db.query(Lista).filter(Lista.id == transacao.lista_id).first()
        promoter_nome = ""
        if lista and lista.promoter_id:
            promoter = db.query(Usuario).filter(Usuario.id == lista.promoter_id).first()
            if promoter:
                promoter_nome = promoter.nome
        
        writer.writerow([
            transacao.id,
            transacao.cpf_comprador,
            transacao.nome_comprador,
            transacao.email_comprador or "",
            transacao.telefone_comprador or "",
            float(transacao.valor),
            transacao.metodo_pagamento or "",
            lista.nome if lista else "",
            promoter_nome,
            transacao.criado_em.strftime("%d/%m/%Y %H:%M:%S")
        ])
    
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=vendas_evento_{evento_id}.csv"}
    )

@router.get("/checkins/{evento_id}/csv")
async def exportar_checkins_csv(
    evento_id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Exportar relatório de check-ins em CSV"""
    
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
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        'ID Check-in', 'CPF', 'Nome', 'Método Check-in', 
        'Data Check-in', 'Responsável Check-in'
    ])
    
    for checkin in checkins:
        responsavel = ""
        if checkin.usuario_id:
            usuario = db.query(Usuario).filter(Usuario.id == checkin.usuario_id).first()
            if usuario:
                responsavel = usuario.nome
        
        writer.writerow([
            checkin.id,
            checkin.cpf,
            checkin.nome,
            checkin.metodo_checkin,
            checkin.checkin_em.strftime("%d/%m/%Y %H:%M:%S"),
            responsavel
        ])
    
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=checkins_evento_{evento_id}.csv"}
    )

@router.get("/auditoria")
async def exportar_logs_auditoria(
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    cpf_usuario: Optional[str] = None,
    evento_id: Optional[int] = None,
    formato: str = "json",
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(verificar_permissao_admin)
):
    """Exportar logs de auditoria (apenas admins)"""
    
    from ..models import LogAuditoria
    
    query = db.query(LogAuditoria)
    
    if data_inicio:
        query = query.filter(LogAuditoria.criado_em >= data_inicio)
    
    if data_fim:
        query = query.filter(LogAuditoria.criado_em <= data_fim)
    
    if cpf_usuario:
        query = query.filter(LogAuditoria.cpf_usuario == cpf_usuario)
    
    if evento_id:
        query = query.filter(LogAuditoria.evento_id == evento_id)
    
    logs = query.order_by(LogAuditoria.criado_em.desc()).limit(1000).all()
    
    if formato == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow([
            'ID', 'CPF Usuário', 'Ação', 'Tabela', 'Registro ID',
            'IP Origem', 'Status', 'Data/Hora', 'Detalhes'
        ])
        
        for log in logs:
            writer.writerow([
                log.id,
                log.cpf_usuario,
                log.acao,
                log.tabela_afetada or "",
                log.registro_id or "",
                log.ip_origem or "",
                log.status,
                log.criado_em.strftime("%d/%m/%Y %H:%M:%S"),
                log.detalhes or ""
            ])
        
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=auditoria.csv"}
        )
    
    else:
        return {
            "total": len(logs),
            "logs": [
                {
                    "id": log.id,
                    "cpf_usuario": log.cpf_usuario,
                    "acao": log.acao,
                    "tabela_afetada": log.tabela_afetada,
                    "registro_id": log.registro_id,
                    "ip_origem": log.ip_origem,
                    "status": log.status,
                    "criado_em": log.criado_em.isoformat(),
                    "detalhes": log.detalhes
                }
                for log in logs
            ]
        }
