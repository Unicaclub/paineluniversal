from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, or_
from typing import List, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
import json
import uuid

from ..database import get_db
from ..models import (
    Evento, LayoutEvento, AreaEvento, Mesa, ComandaOperacao,
    ComandaParticipante, ComandaItem, Bloqueio, GrupoCartao, CartaoEvento,
    ClienteEvento, Usuario, StatusMesa, StatusComandaOperacao, TipoBloqueio
)
from ..schemas import (
    LayoutEventoCreate, LayoutEvento, AreaEventoCreate, AreaEvento,
    MesaCreate, Mesa, ComandaOperacaoCreate, ComandaOperacao,
    ComandaParticipanteCreate, ComandaParticipante, ComandaItemCreate, ComandaItem,
    BloqueioCreate, Bloqueio, GrupoCartaoCreate, GrupoCartao,
    CartaoEventoCreate, CartaoEvento, FiltrosMapaOperacao, EstatisticasOperacao,
    ResultadoBusca
)
from ..auth import obter_usuario_atual, verificar_permissao_admin
from ..websocket import manager

router = APIRouter(prefix="/mapa-operacao", tags=["Mapa da Operação"])

@router.get("/eventos/{evento_id}/layout", response_model=dict)
async def obter_layout_evento(
    evento_id: int,
    mostrar_apenas_ativas: bool = True,
    tipo_area: Optional[str] = None,
    status_mesa: Optional[str] = None,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Obter layout completo do evento com áreas e mesas"""
    
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    
    layout_query = db.query(LayoutEvento).filter(LayoutEvento.evento_id == evento_id)
    layout = layout_query.first()
    
    if not layout:
        layout = LayoutEvento(
            evento_id=evento_id,
            nome=f"Layout {evento.nome}",
            largura=1200,
            altura=800,
            escala=1.0,
            configuracao={}
        )
        db.add(layout)
        db.commit()
        db.refresh(layout)
    
    areas_query = db.query(AreaEvento).filter(AreaEvento.layout_id == layout.id)
    
    if mostrar_apenas_ativas:
        areas_query = areas_query.filter(AreaEvento.ativa == True)
    
    if tipo_area:
        areas_query = areas_query.filter(AreaEvento.tipo == tipo_area)
    
    areas = areas_query.all()
    
    layout_data = {
        "id": layout.id,
        "evento_id": layout.evento_id,
        "nome": layout.nome,
        "largura": layout.largura,
        "altura": layout.altura,
        "escala": float(layout.escala),
        "configuracao": layout.configuracao,
        "imagem_fundo": layout.imagem_fundo,
        "areas": []
    }
    
    for area in areas:
        mesas_query = db.query(Mesa).filter(Mesa.area_id == area.id)
        
        if status_mesa:
            mesas_query = mesas_query.filter(Mesa.status == status_mesa)
        
        mesas = mesas_query.all()
        
        mesas_data = []
        for mesa in mesas:
            comanda_ativa = db.query(ComandaOperacao).filter(
                ComandaOperacao.mesa_id == mesa.id,
                ComandaOperacao.status.in_(['aberta', 'bloqueada'])
            ).first()
            
            participantes_count = 0
            if comanda_ativa:
                participantes_count = db.query(ComandaParticipante).filter(
                    ComandaParticipante.comanda_id == comanda_ativa.id,
                    ComandaParticipante.ativo == True
                ).count()
            
            mesas_data.append({
                "id": mesa.id,
                "numero": mesa.numero,
                "nome": mesa.nome,
                "tipo": mesa.tipo,
                "capacidade_pessoas": mesa.capacidade_pessoas,
                "posicao_x": mesa.posicao_x,
                "posicao_y": mesa.posicao_y,
                "largura": mesa.largura,
                "altura": mesa.altura,
                "formato": mesa.formato,
                "status": mesa.status.value,
                "valor_minimo": float(mesa.valor_minimo),
                "taxa_servico": float(mesa.taxa_servico),
                "observacoes": mesa.observacoes,
                "configuracoes": mesa.configuracoes,
                "comanda_ativa": {
                    "id": comanda_ativa.id,
                    "numero_comanda": comanda_ativa.numero_comanda,
                    "valor_total": float(comanda_ativa.valor_total),
                    "participantes_count": participantes_count
                } if comanda_ativa else None
            })
        
        layout_data["areas"].append({
            "id": area.id,
            "nome": area.nome,
            "tipo": area.tipo.value,
            "posicao_x": area.posicao_x,
            "posicao_y": area.posicao_y,
            "largura": area.largura,
            "altura": area.altura,
            "capacidade_maxima": area.capacidade_maxima,
            "cor": area.cor,
            "ativa": area.ativa,
            "configuracoes": area.configuracoes,
            "restricoes": area.restricoes,
            "mesas": mesas_data
        })
    
    return layout_data

@router.get("/eventos/{evento_id}/estatisticas", response_model=EstatisticasOperacao)
async def obter_estatisticas_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Obter estatísticas em tempo real do evento"""
    
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    
    layout = db.query(LayoutEvento).filter(LayoutEvento.evento_id == evento_id).first()
    if not layout:
        raise HTTPException(status_code=404, detail="Layout não encontrado")
    
    total_mesas = db.query(Mesa).join(AreaEvento).filter(
        AreaEvento.layout_id == layout.id
    ).count()
    
    mesas_ocupadas = db.query(Mesa).join(AreaEvento).filter(
        AreaEvento.layout_id == layout.id,
        Mesa.status == StatusMesa.OCUPADA
    ).count()
    
    mesas_disponveis = db.query(Mesa).join(AreaEvento).filter(
        AreaEvento.layout_id == layout.id,
        Mesa.status == StatusMesa.DISPONIVEL
    ).count()
    
    mesas_reservadas = db.query(Mesa).join(AreaEvento).filter(
        AreaEvento.layout_id == layout.id,
        Mesa.status == StatusMesa.RESERVADA
    ).count()
    
    mesas_bloqueadas = db.query(Mesa).join(AreaEvento).filter(
        AreaEvento.layout_id == layout.id,
        Mesa.status == StatusMesa.BLOQUEADA
    ).count()
    
    comandas_abertas = db.query(ComandaOperacao).filter(
        ComandaOperacao.evento_id == evento_id,
        ComandaOperacao.status == StatusComandaOperacao.ABERTA
    ).count()
    
    comandas_bloqueadas = db.query(ComandaOperacao).filter(
        ComandaOperacao.evento_id == evento_id,
        ComandaOperacao.status == StatusComandaOperacao.BLOQUEADA
    ).count()
    
    total_participantes = db.query(ComandaParticipante).join(ComandaOperacao).filter(
        ComandaOperacao.evento_id == evento_id,
        ComandaParticipante.ativo == True
    ).count()
    
    faturamento_result = db.query(func.sum(ComandaOperacao.valor_total)).filter(
        ComandaOperacao.evento_id == evento_id,
        ComandaOperacao.status.in_([StatusComandaOperacao.ABERTA, StatusComandaOperacao.FECHADA])
    ).scalar()
    
    faturamento_total = Decimal(str(faturamento_result or 0))
    
    ticket_medio = Decimal('0')
    if comandas_abertas > 0:
        ticket_medio = faturamento_total / comandas_abertas
    
    return EstatisticasOperacao(
        total_mesas=total_mesas,
        mesas_ocupadas=mesas_ocupadas,
        mesas_disponveis=mesas_disponveis,
        mesas_reservadas=mesas_reservadas,
        mesas_bloqueadas=mesas_bloqueadas,
        comandas_abertas=comandas_abertas,
        comandas_bloqueadas=comandas_bloqueadas,
        total_participantes=total_participantes,
        faturamento_total=faturamento_total,
        ticket_medio=ticket_medio
    )

@router.post("/eventos/{evento_id}/buscar", response_model=List[ResultadoBusca])
async def buscar_operacao(
    evento_id: int,
    filtros: FiltrosMapaOperacao,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Buscar por CPF/TAG/Número/Nome no evento"""
    
    if not filtros.busca_texto:
        return []
    
    resultados = []
    busca_texto = filtros.busca_texto.strip().lower()
    
    if filtros.busca_tipo in [None, 'cpf']:
        clientes = db.query(ClienteEvento).filter(
            ClienteEvento.evento_id == evento_id,
            ClienteEvento.cpf.ilike(f"%{busca_texto}%")
        ).limit(10).all()
        
        for cliente in clientes:
            comandas_ativas = db.query(ComandaOperacao).filter(
                ComandaOperacao.evento_id == evento_id,
                ComandaOperacao.cliente_principal_cpf == cliente.cpf,
                ComandaOperacao.status.in_([StatusComandaOperacao.ABERTA, StatusComandaOperacao.BLOQUEADA])
            ).count()
            
            resultados.append(ResultadoBusca(
                tipo="cliente",
                id=cliente.id,
                titulo=cliente.nome,
                subtitulo=f"CPF: {cliente.cpf}",
                status="ativo" if comandas_ativas > 0 else "inativo",
                dados_extras={
                    "cpf": cliente.cpf,
                    "telefone": cliente.telefone,
                    "comandas_ativas": comandas_ativas
                }
            ))
    
    if filtros.busca_tipo in [None, 'mesa']:
        layout = db.query(LayoutEvento).filter(LayoutEvento.evento_id == evento_id).first()
        if layout:
            mesas = db.query(Mesa).join(AreaEvento).filter(
                AreaEvento.layout_id == layout.id,
                or_(
                    Mesa.numero.ilike(f"%{busca_texto}%"),
                    Mesa.nome.ilike(f"%{busca_texto}%")
                )
            ).limit(10).all()
            
            for mesa in mesas:
                comanda_ativa = db.query(ComandaOperacao).filter(
                    ComandaOperacao.mesa_id == mesa.id,
                    ComandaOperacao.status.in_([StatusComandaOperacao.ABERTA, StatusComandaOperacao.BLOQUEADA])
                ).first()
                
                resultados.append(ResultadoBusca(
                    tipo="mesa",
                    id=mesa.id,
                    titulo=f"Mesa {mesa.numero}",
                    subtitulo=mesa.nome or f"Área: {mesa.area.nome}",
                    status=mesa.status.value,
                    dados_extras={
                        "numero": mesa.numero,
                        "capacidade": mesa.capacidade_pessoas,
                        "comanda_ativa": comanda_ativa.numero_comanda if comanda_ativa else None
                    }
                ))
    
    if filtros.busca_tipo in [None, 'comanda']:
        comandas = db.query(ComandaOperacao).filter(
            ComandaOperacao.evento_id == evento_id,
            ComandaOperacao.numero_comanda.ilike(f"%{busca_texto}%")
        ).limit(10).all()
        
        for comanda in comandas:
            mesa_info = ""
            if comanda.mesa:
                mesa_info = f"Mesa {comanda.mesa.numero}"
            
            resultados.append(ResultadoBusca(
                tipo="comanda",
                id=comanda.id,
                titulo=f"Comanda {comanda.numero_comanda}",
                subtitulo=mesa_info,
                status=comanda.status.value,
                dados_extras={
                    "numero_comanda": comanda.numero_comanda,
                    "valor_total": float(comanda.valor_total),
                    "mesa_numero": comanda.mesa.numero if comanda.mesa else None
                }
            ))
    
    if filtros.busca_tipo in [None, 'cartao']:
        cartoes = db.query(CartaoEvento).filter(
            CartaoEvento.evento_id == evento_id,
            or_(
                CartaoEvento.numero_cartao.ilike(f"%{busca_texto}%"),
                CartaoEvento.qr_code.ilike(f"%{busca_texto}%")
            )
        ).limit(10).all()
        
        for cartao in cartoes:
            cliente_nome = ""
            if cartao.cliente:
                cliente_nome = cartao.cliente.nome
            
            resultados.append(ResultadoBusca(
                tipo="cartao",
                id=cartao.id,
                titulo=f"Cartão {cartao.numero_cartao}",
                subtitulo=cliente_nome,
                status=cartao.status,
                dados_extras={
                    "numero_cartao": cartao.numero_cartao,
                    "saldo_credito": float(cartao.saldo_credito),
                    "consumo_total": float(cartao.consumo_total)
                }
            ))
    
    return resultados[:20]

@router.put("/mesas/{mesa_id}/status")
async def atualizar_status_mesa(
    mesa_id: int,
    novo_status: str,
    observacoes: Optional[str] = None,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Atualizar status de uma mesa"""
    
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa não encontrada")
    
    try:
        status_enum = StatusMesa(novo_status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Status inválido")
    
    status_anterior = mesa.status
    mesa.status = status_enum
    
    if observacoes:
        mesa.observacoes = observacoes
    
    db.commit()
    db.refresh(mesa)
    
    await manager.broadcast_to_event(mesa.area.layout.evento_id, {
        "type": "mesa_atualizada",
        "data": {
            "mesa_id": mesa.id,
            "numero": mesa.numero,
            "status_anterior": status_anterior.value,
            "status_novo": novo_status,
            "usuario": usuario_atual.nome,
            "timestamp": datetime.now().isoformat()
        }
    })
    
    return {"message": "Status da mesa atualizado com sucesso"}

@router.post("/eventos/{evento_id}/comandas", response_model=ComandaOperacao)
async def abrir_comanda(
    evento_id: int,
    comanda_data: ComandaOperacaoCreate,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Abrir nova comanda"""
    
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    
    if comanda_data.mesa_id:
        mesa = db.query(Mesa).filter(Mesa.id == comanda_data.mesa_id).first()
        if not mesa:
            raise HTTPException(status_code=404, detail="Mesa não encontrada")
        
        comanda_existente = db.query(ComandaOperacao).filter(
            ComandaOperacao.mesa_id == comanda_data.mesa_id,
            ComandaOperacao.status.in_([StatusComandaOperacao.ABERTA, StatusComandaOperacao.BLOQUEADA])
        ).first()
        
        if comanda_existente:
            raise HTTPException(status_code=400, detail="Mesa já possui comanda ativa")
    
    comanda_existente_numero = db.query(ComandaOperacao).filter(
        ComandaOperacao.numero_comanda == comanda_data.numero_comanda
    ).first()
    
    if comanda_existente_numero:
        raise HTTPException(status_code=400, detail="Número de comanda já existe")
    
    nova_comanda = ComandaOperacao(
        uuid=str(uuid.uuid4()),
        evento_id=evento_id,
        mesa_id=comanda_data.mesa_id,
        numero_comanda=comanda_data.numero_comanda,
        cliente_principal_cpf=comanda_data.cliente_principal_cpf,
        status=comanda_data.status,
        tipo=comanda_data.tipo,
        observacoes=comanda_data.observacoes,
        funcionario_abertura=usuario_atual.id,
        configuracoes=comanda_data.configuracoes
    )
    
    db.add(nova_comanda)
    db.commit()
    db.refresh(nova_comanda)
    
    if comanda_data.mesa_id:
        mesa.status = StatusMesa.OCUPADA
        db.commit()
    
    await manager.broadcast_to_event(evento_id, {
        "type": "comanda_aberta",
        "data": {
            "comanda_id": nova_comanda.id,
            "numero_comanda": nova_comanda.numero_comanda,
            "mesa_id": nova_comanda.mesa_id,
            "mesa_numero": mesa.numero if comanda_data.mesa_id else None,
            "usuario": usuario_atual.nome,
            "timestamp": datetime.now().isoformat()
        }
    })
    
    return nova_comanda

@router.post("/bloqueios", response_model=Bloqueio)
async def criar_bloqueio(
    bloqueio_data: BloqueioCreate,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Criar novo bloqueio"""
    
    evento = db.query(Evento).filter(Evento.id == bloqueio_data.evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    
    bloqueio_existente = db.query(Bloqueio).filter(
        Bloqueio.tipo == bloqueio_data.tipo,
        Bloqueio.referencia_id == bloqueio_data.referencia_id,
        Bloqueio.ativo == True
    ).first()
    
    if bloqueio_existente:
        raise HTTPException(status_code=400, detail="Entidade já está bloqueada")
    
    novo_bloqueio = Bloqueio(
        tipo=bloqueio_data.tipo,
        referencia_id=bloqueio_data.referencia_id,
        evento_id=bloqueio_data.evento_id,
        motivo=bloqueio_data.motivo,
        detalhes=bloqueio_data.detalhes,
        bloqueado_por=usuario_atual.id,
        temporario=bloqueio_data.temporario,
        expira_em=bloqueio_data.expira_em
    )
    
    db.add(novo_bloqueio)
    db.commit()
    db.refresh(novo_bloqueio)
    
    if bloqueio_data.tipo == TipoBloqueio.MESA:
        mesa = db.query(Mesa).filter(Mesa.id == int(bloqueio_data.referencia_id)).first()
        if mesa:
            mesa.status = StatusMesa.BLOQUEADA
            db.commit()
    
    elif bloqueio_data.tipo == TipoBloqueio.COMANDA:
        comanda = db.query(ComandaOperacao).filter(ComandaOperacao.id == int(bloqueio_data.referencia_id)).first()
        if comanda:
            comanda.status = StatusComandaOperacao.BLOQUEADA
            db.commit()
    
    await manager.broadcast_to_event(bloqueio_data.evento_id, {
        "type": "entidade_bloqueada",
        "data": {
            "bloqueio_id": novo_bloqueio.id,
            "tipo": bloqueio_data.tipo.value,
            "referencia_id": bloqueio_data.referencia_id,
            "motivo": bloqueio_data.motivo,
            "usuario": usuario_atual.nome,
            "timestamp": datetime.now().isoformat()
        }
    })
    
    return novo_bloqueio

@router.delete("/bloqueios/{bloqueio_id}")
async def desbloquear_entidade(
    bloqueio_id: int,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Desbloquear entidade"""
    
    bloqueio = db.query(Bloqueio).filter(Bloqueio.id == bloqueio_id).first()
    if not bloqueio:
        raise HTTPException(status_code=404, detail="Bloqueio não encontrado")
    
    if not bloqueio.ativo:
        raise HTTPException(status_code=400, detail="Bloqueio já foi removido")
    
    bloqueio.ativo = False
    bloqueio.desbloqueado_por = usuario_atual.id
    bloqueio.desbloqueado_em = datetime.now()
    
    if bloqueio.tipo == TipoBloqueio.MESA:
        mesa = db.query(Mesa).filter(Mesa.id == int(bloqueio.referencia_id)).first()
        if mesa:
            mesa.status = StatusMesa.DISPONIVEL
    
    elif bloqueio.tipo == TipoBloqueio.COMANDA:
        comanda = db.query(ComandaOperacao).filter(ComandaOperacao.id == int(bloqueio.referencia_id)).first()
        if comanda:
            comanda.status = StatusComandaOperacao.ABERTA
    
    db.commit()
    
    await manager.broadcast_to_event(bloqueio.evento_id, {
        "type": "entidade_desbloqueada",
        "data": {
            "bloqueio_id": bloqueio.id,
            "tipo": bloqueio.tipo.value,
            "referencia_id": bloqueio.referencia_id,
            "usuario": usuario_atual.nome,
            "timestamp": datetime.now().isoformat()
        }
    })
    
    return {"message": "Entidade desbloqueada com sucesso"}

@router.post("/eventos/{evento_id}/cartoes", response_model=CartaoEvento)
async def emitir_cartao(
    evento_id: int,
    cartao_data: CartaoEventoCreate,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Emitir novo cartão do evento"""
    
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    
    cartao_existente = db.query(CartaoEvento).filter(
        CartaoEvento.numero_cartao == cartao_data.numero_cartao
    ).first()
    
    if cartao_existente:
        raise HTTPException(status_code=400, detail="Número de cartão já existe")
    
    qr_code = f"MEEP-{evento_id}-{cartao_data.numero_cartao}-{uuid.uuid4().hex[:8]}"
    
    novo_cartao = CartaoEvento(
        uuid=str(uuid.uuid4()),
        evento_id=evento_id,
        grupo_id=cartao_data.grupo_id,
        numero_cartao=cartao_data.numero_cartao,
        cliente_cpf=cartao_data.cliente_cpf,
        qr_code=qr_code,
        status=cartao_data.status,
        saldo_credito=cartao_data.saldo_credito,
        limite_consumo=cartao_data.limite_consumo,
        configuracoes=cartao_data.configuracoes
    )
    
    db.add(novo_cartao)
    db.commit()
    db.refresh(novo_cartao)
    
    await manager.broadcast_to_event(evento_id, {
        "type": "cartao_emitido",
        "data": {
            "cartao_id": novo_cartao.id,
            "numero_cartao": novo_cartao.numero_cartao,
            "cliente_cpf": novo_cartao.cliente_cpf,
            "saldo_credito": float(novo_cartao.saldo_credito),
            "usuario": usuario_atual.nome,
            "timestamp": datetime.now().isoformat()
        }
    })
    
    return novo_cartao
