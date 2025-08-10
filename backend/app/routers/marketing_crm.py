from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, text
from typing import List, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
import json

from ..database import get_db
from ..models import (
    ProgramaFidelidade, NivelFidelidade, CarteiraFidelidade, TransacaoFidelidade,
    SegmentoCliente, ClienteSegmento, CampanhaMarketing, TemplateMensagem,
    ListaEvento, ListaParticipante, Promocao, CupomUso, AnalyticsEvento,
    WorkflowMarketing, WorkflowExecucao, ClienteEvento, Usuario, Evento
)
from ..schemas import (
    ProgramaFidelidadeCreate, ProgramaFidelidade as ProgramaFidelidadeSchema,
    NivelFidelidadeCreate, NivelFidelidade as NivelFidelidadeSchema,
    CarteiraFidelidadeCreate, CarteiraFidelidade as CarteiraFidelidadeSchema,
    TransacaoFidelidadeCreate, TransacaoFidelidade as TransacaoFidelidadeSchema,
    SegmentoClienteCreate, SegmentoCliente as SegmentoClienteSchema,
    CampanhaMarketingCreate, CampanhaMarketing as CampanhaMarketingSchema,
    TemplateMensagemCreate, TemplateMensagem as TemplateMensagemSchema,
    PromocaoCreate, Promocao as PromocaoSchema,
    DashboardMarketing, AnalysePreditivaCliente, ROIPrograma
)
from ..auth import obter_usuario_atual, verificar_permissao_admin
from ..websocket import manager

router = APIRouter(prefix="/marketing-crm", tags=["Marketing e CRM Supremo"])

@router.get("/dashboard")
async def obter_dashboard_marketing(
    periodo_dias: int = 30,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Dashboard principal do sistema de marketing"""
    try:
        data_inicio = datetime.now() - timedelta(days=periodo_dias)
        
        total_clientes_fidelidade = db.query(CarteiraFidelidade).filter(
            CarteiraFidelidade.status == 'ativo'
        ).count()
        
        pontos_emitidos = db.query(func.sum(TransacaoFidelidade.pontos_transacao)).filter(
            TransacaoFidelidade.tipo == 'ganho',
            TransacaoFidelidade.criado_em >= data_inicio
        ).scalar() or 0
        
        pontos_resgatados = db.query(func.sum(TransacaoFidelidade.pontos_transacao)).filter(
            TransacaoFidelidade.tipo == 'resgate',
            TransacaoFidelidade.criado_em >= data_inicio
        ).scalar() or 0
        
        campanhas_ativas = db.query(CampanhaMarketing).filter(
            CampanhaMarketing.status.in_(['executando', 'agendada'])
        ).count()
        
        promocoes_ativas = db.query(Promocao).filter(
            Promocao.ativa == True,
            Promocao.data_inicio <= datetime.now(),
            Promocao.data_fim >= datetime.now()
        ).count()
        
        cupons_utilizados = db.query(CupomUso).filter(
            CupomUso.data_uso >= data_inicio
        ).count()
        
        receita_promocoes = db.query(func.sum(CupomUso.valor_desconto_aplicado)).filter(
            CupomUso.data_uso >= data_inicio
        ).scalar() or 0
        
        roi_fidelidade = Decimal('15.5')  # Placeholder - implementar cálculo real
        taxa_engajamento = Decimal('68.2')  # Placeholder - implementar cálculo real
        conversao_campanhas = Decimal('12.8')  # Placeholder - implementar cálculo real
        
        dashboard = DashboardMarketing(
            total_clientes_fidelidade=total_clientes_fidelidade,
            pontos_emitidos_mes=abs(pontos_emitidos),
            pontos_resgatados_mes=abs(pontos_resgatados),
            campanhas_ativas=campanhas_ativas,
            taxa_engajamento=taxa_engajamento,
            roi_fidelidade=roi_fidelidade,
            promocoes_ativas=promocoes_ativas,
            cupons_utilizados_mes=cupons_utilizados,
            receita_promocoes=receita_promocoes,
            segmentos_ativos=db.query(SegmentoCliente).filter(SegmentoCliente.ativo == True).count(),
            workflows_executando=db.query(WorkflowExecucao).filter(WorkflowExecucao.status == 'executando').count(),
            conversao_campanhas=conversao_campanhas
        )
        
        return {"success": True, "data": dashboard}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter dashboard: {str(e)}")

@router.post("/programas-fidelidade", response_model=ProgramaFidelidadeSchema)
async def criar_programa_fidelidade(
    programa: ProgramaFidelidadeCreate,
    db: Session = Depends(get_db),
    usuario_atual = Depends(verificar_permissao_admin)
):
    """Criar novo programa de fidelidade"""
    try:
        db_programa = ProgramaFidelidade(**programa.dict())
        db.add(db_programa)
        db.commit()
        db.refresh(db_programa)
        
        await criar_niveis_padrao(db, db_programa.id)
        
        await manager.broadcast({
            "type": "programa_fidelidade_criado",
            "data": {"programa_id": db_programa.id, "nome": db_programa.nome}
        })
        
        return db_programa
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar programa: {str(e)}")

async def criar_niveis_padrao(db: Session, programa_id: int):
    """Criar níveis padrão para programa de fidelidade"""
    niveis_base = [
        {
            "nome": "Bronze Iniciante",
            "descricao": "Bem-vindo ao programa!",
            "cor": "#CD7F32",
            "icone": "🥉",
            "pontos_minimos": 0,
            "pontos_maximos": 999,
            "multiplicador_pontos": Decimal('1.0'),
            "desconto_percentual": Decimal('0'),
            "beneficios": ["Pontos em todas as compras", "Aniversário em dobro"],
            "ordem": 1
        },
        {
            "nome": "Prata Fidelidade",
            "descricao": "Cliente especial com benefícios únicos",
            "cor": "#C0C0C0",
            "icone": "🥈",
            "pontos_minimos": 1000,
            "pontos_maximos": 4999,
            "multiplicador_pontos": Decimal('1.25'),
            "desconto_percentual": Decimal('5'),
            "beneficios": ["25% mais pontos", "5% desconto permanente", "Lista VIP automática"],
            "ordem": 2
        },
        {
            "nome": "Ouro Premium",
            "descricao": "Status VIP com máximos privilégios",
            "cor": "#FFD700",
            "icone": "🥇",
            "pontos_minimos": 5000,
            "pontos_maximos": 14999,
            "multiplicador_pontos": Decimal('1.5'),
            "desconto_percentual": Decimal('10'),
            "beneficios": ["50% mais pontos", "10% desconto", "Mesa VIP reservada"],
            "ordem": 3
        },
        {
            "nome": "Diamante Elite",
            "descricao": "O máximo em exclusividade",
            "cor": "#B9F2FF",
            "icone": "💎",
            "pontos_minimos": 15000,
            "pontos_maximos": None,
            "multiplicador_pontos": Decimal('2.0'),
            "desconto_percentual": Decimal('15'),
            "beneficios": ["Pontos em dobro", "15% desconto", "Área VIP exclusiva"],
            "ordem": 4
        }
    ]
    
    for nivel_data in niveis_base:
        nivel = NivelFidelidade(programa_id=programa_id, **nivel_data)
        db.add(nivel)
    
    db.commit()

@router.post("/carteiras-fidelidade", response_model=CarteiraFidelidadeSchema)
async def criar_carteira_fidelidade(
    carteira: CarteiraFidelidadeCreate,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Criar carteira de fidelidade para cliente"""
    try:
        carteira_existente = db.query(CarteiraFidelidade).filter(
            CarteiraFidelidade.cliente_cpf == carteira.cliente_cpf,
            CarteiraFidelidade.programa_id == carteira.programa_id
        ).first()
        
        if carteira_existente:
            raise HTTPException(status_code=400, detail="Cliente já possui carteira neste programa")
        
        primeiro_nivel = db.query(NivelFidelidade).filter(
            NivelFidelidade.programa_id == carteira.programa_id
        ).order_by(NivelFidelidade.ordem).first()
        
        db_carteira = CarteiraFidelidade(
            **carteira.dict(),
            nivel_atual_id=primeiro_nivel.id if primeiro_nivel else None
        )
        db.add(db_carteira)
        db.commit()
        db.refresh(db_carteira)
        
        await adicionar_pontos_boas_vindas(db, db_carteira.id)
        
        return db_carteira
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar carteira: {str(e)}")

async def adicionar_pontos_boas_vindas(db: Session, carteira_id: int):
    """Adicionar pontos de boas-vindas"""
    transacao = TransacaoFidelidade(
        carteira_id=carteira_id,
        tipo='ganho',
        origem='boas_vindas',
        pontos_antes=0,
        pontos_transacao=100,
        pontos_depois=100,
        descricao='Pontos de boas-vindas ao programa'
    )
    db.add(transacao)
    db.commit()

@router.post("/adicionar-pontos")
async def adicionar_pontos(
    carteira_id: int,
    pontos: int,
    origem: str,
    evento_id: Optional[int] = None,
    valor_compra: Optional[float] = None,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Adicionar pontos à carteira com multiplicadores inteligentes"""
    try:
        carteira = db.query(CarteiraFidelidade).filter(CarteiraFidelidade.id == carteira_id).first()
        if not carteira:
            raise HTTPException(status_code=404, detail="Carteira não encontrada")
        
        multiplicador_total = await calcular_multiplicadores(db, carteira, origem, valor_compra)
        pontos_finais = int(pontos * multiplicador_total)
        
        cliente = db.query(ClienteEvento).filter(ClienteEvento.cpf == carteira.cliente_cpf).first()
        bonus_aniversario = 0
        if cliente and cliente.data_nascimento:
            hoje = datetime.now().date()
            if (cliente.data_nascimento.month == hoje.month and 
                cliente.data_nascimento.day == hoje.day):
                bonus_aniversario = pontos_finais  # Dobrar pontos no aniversário
        
        pontos_totais = pontos_finais + bonus_aniversario
        
        transacao = TransacaoFidelidade(
            carteira_id=carteira_id,
            evento_id=evento_id,
            tipo='ganho',
            origem=origem,
            pontos_antes=carteira.pontos_atuais,
            pontos_transacao=pontos_totais,
            pontos_depois=carteira.pontos_atuais + pontos_totais,
            valor_monetario=valor_compra,
            descricao=f"Pontos por {origem}" + (" (Aniversário!)" if bonus_aniversario > 0 else ""),
            funcionario_id=usuario_atual.id,
            metadata={
                "multiplicador_aplicado": multiplicador_total,
                "bonus_aniversario": bonus_aniversario,
                "algoritmo_versao": "2.0"
            }
        )
        db.add(transacao)
        
        carteira.pontos_atuais += pontos_totais
        carteira.pontos_lifetime += pontos_totais
        carteira.ultima_atividade = datetime.now()
        
        await verificar_upgrade_nivel(db, carteira)
        
        db.commit()
        
        await manager.broadcast({
            "type": "pontos_adicionados",
            "data": {
                "cliente_cpf": carteira.cliente_cpf,
                "pontos": pontos_totais,
                "origem": origem,
                "bonus_aniversario": bonus_aniversario > 0
            }
        })
        
        return {
            "success": True,
            "pontos_adicionados": pontos_totais,
            "bonus_aniversario": bonus_aniversario,
            "multiplicador": multiplicador_total,
            "novo_saldo": carteira.pontos_atuais
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao adicionar pontos: {str(e)}")

async def calcular_multiplicadores(db: Session, carteira: CarteiraFidelidade, origem: str, valor_compra: Optional[float]):
    """Calcular multiplicadores inteligentes"""
    multiplicador = 1.0
    
    if carteira.nivel_atual_id:
        nivel = db.query(NivelFidelidade).filter(NivelFidelidade.id == carteira.nivel_atual_id).first()
        if nivel:
            multiplicador *= float(nivel.multiplicador_pontos)
    
    hora_atual = datetime.now().hour
    if 17 <= hora_atual <= 19:
        multiplicador *= 1.2
    
    dia_semana = datetime.now().weekday()
    if dia_semana in [0, 1, 6]:  # Segunda, terça, domingo
        multiplicador *= 1.15
    
    if valor_compra:
        if valor_compra > 200:
            multiplicador *= 1.25
        elif valor_compra > 100:
            multiplicador *= 1.1
    
    return multiplicador

async def verificar_upgrade_nivel(db: Session, carteira: CarteiraFidelidade):
    """Verificar se cliente deve ser promovido de nível"""
    niveis = db.query(NivelFidelidade).filter(
        NivelFidelidade.programa_id == carteira.programa_id,
        NivelFidelidade.ativo == True
    ).order_by(NivelFidelidade.ordem).all()
    
    for nivel in niveis:
        if (carteira.pontos_atuais >= nivel.pontos_minimos and 
            (nivel.pontos_maximos is None or carteira.pontos_atuais <= nivel.pontos_maximos)):
            if carteira.nivel_atual_id != nivel.id:
                carteira.nivel_atual_id = nivel.id
                
                transacao = TransacaoFidelidade(
                    carteira_id=carteira.id,
                    tipo='bonus',
                    origem='upgrade_nivel',
                    pontos_antes=carteira.pontos_atuais,
                    pontos_transacao=500,  # Bônus por upgrade
                    pontos_depois=carteira.pontos_atuais + 500,
                    descricao=f"Upgrade para nível {nivel.nome}!"
                )
                db.add(transacao)
                carteira.pontos_atuais += 500
                
                await manager.broadcast({
                    "type": "upgrade_nivel",
                    "data": {
                        "cliente_cpf": carteira.cliente_cpf,
                        "novo_nivel": nivel.nome,
                        "bonus_pontos": 500
                    }
                })
            break

@router.get("/analise-preditiva/{cliente_cpf}")
async def analise_preditiva_cliente(
    cliente_cpf: str,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Análise preditiva com IA do comportamento do cliente"""
    try:
        carteira = db.query(CarteiraFidelidade).filter(
            CarteiraFidelidade.cliente_cpf == cliente_cpf
        ).first()
        
        if not carteira:
            raise HTTPException(status_code=404, detail="Cliente não encontrado no programa de fidelidade")
        
        total_transacoes = db.query(TransacaoFidelidade).filter(
            TransacaoFidelidade.carteira_id == carteira.id
        ).count()
        
        ultima_atividade = carteira.ultima_atividade
        dias_inativo = (datetime.now() - ultima_atividade).days if ultima_atividade else 999
        
        score_engajamento = min(100, max(0, 100 - (dias_inativo * 2) + (total_transacoes * 5)))
        
        probabilidade_retorno = max(10, min(95, score_engajamento - (dias_inativo * 1.5)))
        
        valor_medio_projetado = Decimal(str(carteira.pontos_lifetime / max(1, total_transacoes) * 0.01))
        
        proximo_nivel = db.query(NivelFidelidade).filter(
            NivelFidelidade.programa_id == carteira.programa_id,
            NivelFidelidade.pontos_minimos > carteira.pontos_atuais
        ).order_by(NivelFidelidade.pontos_minimos).first()
        
        dias_para_proximo_nivel = None
        if proximo_nivel:
            pontos_necessarios = proximo_nivel.pontos_minimos - carteira.pontos_atuais
            media_pontos_dia = max(1, carteira.pontos_lifetime / max(1, (datetime.now() - carteira.data_ingresso).days))
            dias_para_proximo_nivel = int(pontos_necessarios / media_pontos_dia)
        
        if dias_inativo > 90:
            risco_cancelamento = "alto"
        elif dias_inativo > 30:
            risco_cancelamento = "medio"
        else:
            risco_cancelamento = "baixo"
        
        recomendacoes = []
        if score_engajamento < 50:
            recomendacoes.append("Enviar campanha de reativação")
        if dias_inativo > 30:
            recomendacoes.append("Oferecer promoção especial")
        if carteira.pontos_atuais > 1000:
            recomendacoes.append("Sugerir resgate de pontos")
        
        analise = AnalysePreditivaCliente(
            score_engajamento=int(score_engajamento),
            probabilidade_retorno=int(probabilidade_retorno),
            valor_medio_projetado=valor_medio_projetado,
            proximo_nivel_estimado=proximo_nivel.nome if proximo_nivel else None,
            dias_para_proximo_nivel=dias_para_proximo_nivel,
            recomendacoes=recomendacoes,
            risco_cancelamento=risco_cancelamento,
            melhor_dia_para_contato="Terça-feira",  # Placeholder
            melhor_horario_para_contato="14:00-16:00",  # Placeholder
            preferencias={"canal_preferido": "whatsapp", "categoria_favorita": "bebidas"},
            insights=[
                f"Cliente {'ativo' if dias_inativo < 7 else 'inativo há ' + str(dias_inativo) + ' dias'}",
                f"Nível de engajamento {'alto' if score_engajamento > 70 else 'médio' if score_engajamento > 40 else 'baixo'}",
                f"Total de {total_transacoes} transações realizadas"
            ]
        )
        
        return {"success": True, "data": analise}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise preditiva: {str(e)}")

@router.post("/campanhas", response_model=CampanhaMarketingSchema)
async def criar_campanha(
    campanha: CampanhaMarketingCreate,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Criar nova campanha de marketing"""
    try:
        db_campanha = CampanhaMarketing(**campanha.dict())
        db.add(db_campanha)
        db.commit()
        db.refresh(db_campanha)
        
        return db_campanha
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar campanha: {str(e)}")

@router.post("/promocoes", response_model=PromocaoSchema)
async def criar_promocao(
    promocao: PromocaoCreate,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Criar nova promoção"""
    try:
        db_promocao = Promocao(**promocao.dict())
        db.add(db_promocao)
        db.commit()
        db.refresh(db_promocao)
        
        return db_promocao
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar promoção: {str(e)}")

@router.get("/roi-programa/{programa_id}")
async def calcular_roi_programa(
    programa_id: int,
    periodo_meses: int = 12,
    db: Session = Depends(get_db),
    usuario_atual = Depends(obter_usuario_atual)
):
    """Calcular ROI do programa de fidelidade"""
    try:
        data_inicio = datetime.now() - timedelta(days=periodo_meses * 30)
        
        resultado = db.execute(text("""
            SELECT 
                COUNT(DISTINCT c.cliente_cpf) as total_clientes,
                COALESCE(SUM(CASE WHEN t.tipo = 'ganho' THEN t.valor_monetario ELSE 0 END), 0) as receita_total,
                COALESCE(SUM(CASE WHEN t.tipo = 'resgate' THEN t.valor_monetario ELSE 0 END), 0) as custos_resgates,
                COALESCE(AVG(c.pontos_atuais), 0) as media_pontos_cliente,
                COUNT(t.id) as total_transacoes,
                COALESCE(AVG(CASE WHEN t.tipo = 'ganho' THEN t.valor_monetario ELSE NULL END), 0) as ticket_medio
            FROM carteira_fidelidade c
            LEFT JOIN transacoes_fidelidade t ON c.id = t.carteira_id
            WHERE c.programa_id = :programa_id 
            AND (t.criado_em >= :data_inicio OR t.criado_em IS NULL)
        """), {"programa_id": programa_id, "data_inicio": data_inicio}).fetchone()
        
        if not resultado or resultado.total_clientes == 0:
            raise HTTPException(status_code=404, detail="Programa não encontrado ou sem dados")
        
        receita_total = float(resultado.receita_total or 0)
        custos_resgates = float(resultado.custos_resgates or 0)
        
        roi_percentual = ((receita_total - custos_resgates) / max(custos_resgates, 1) * 100) if custos_resgates > 0 else 0
        
        roi = ROIPrograma(
            total_clientes=resultado.total_clientes,
            receita_total=Decimal(str(receita_total)),
            custos_resgates=Decimal(str(custos_resgates)),
            roi_percentual=Decimal(str(roi_percentual)),
            periodo_analise=periodo_meses,
            custo_por_cliente=Decimal(str(custos_resgates / max(resultado.total_clientes, 1))),
            receita_por_cliente=Decimal(str(receita_total / max(resultado.total_clientes, 1))),
            media_pontos_cliente=Decimal(str(resultado.media_pontos_cliente or 0)),
            total_transacoes=resultado.total_transacoes or 0,
            ticket_medio=Decimal(str(resultado.ticket_medio or 0))
        )
        
        return {"success": True, "data": roi}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular ROI: {str(e)}")
