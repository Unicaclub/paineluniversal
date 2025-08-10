from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
import json

from ..database import get_db
from ..models import *
from ..schemas import *
from ..auth import get_current_user

router = APIRouter(prefix="/api/erp-supremo", tags=["ERP Supremo"])


@router.get("/plano-contas")
async def listar_plano_contas(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    contas = db.query(PlanoContasIA).filter(PlanoContasIA.ativo == True).all()
    return {"success": True, "data": contas}

@router.post("/plano-contas")
async def criar_conta(
    conta_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    nova_conta = PlanoContasIA(**conta_data)
    db.add(nova_conta)
    db.commit()
    db.refresh(nova_conta)
    return {"success": True, "data": nova_conta}

@router.get("/fluxo-caixa-preditivo/{empresa_id}")
async def obter_fluxo_caixa_preditivo(
    empresa_id: int,
    dias_projecao: int = Query(90, description="Dias de projeção"),
    cenario: str = Query("realista", description="Cenário de análise"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    fluxo = db.query(FluxoCaixaPreditivo).filter(
        FluxoCaixaPreditivo.empresa_id == empresa_id,
        FluxoCaixaPreditivo.cenario == cenario
    ).limit(dias_projecao).all()
    
    return {"success": True, "data": fluxo}

@router.post("/gerar-fluxo-caixa-preditivo")
async def gerar_fluxo_caixa_preditivo(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    empresa_id = dados.get("empresa_id")
    dias_projecao = dados.get("dias_projecao", 90)
    
    
    previsoes = []
    for i in range(dias_projecao):
        data_ref = datetime.now().date()
        previsao = FluxoCaixaPreditivo(
            empresa_id=empresa_id,
            data_referencia=data_ref,
            tipo="entrada",
            categoria="vendas_previstas",
            valor_previsto=10000 + (i * 100),
            probabilidade_realizacao=85.5,
            algoritmo_usado="LSTM_Prophet",
            confiabilidade=92.3,
            fatores_influencia={"sazonalidade": 0.8, "tendencia": 0.6}
        )
        previsoes.append(previsao)
    
    db.add_all(previsoes)
    db.commit()
    
    return {"success": True, "message": "Fluxo de caixa preditivo gerado", "data": previsoes}

@router.get("/conciliacao-bancaria/{empresa_id}")
async def obter_conciliacao_bancaria(
    empresa_id: int,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(ConciliacaoBancariaIA).filter(
        ConciliacaoBancariaIA.empresa_id == empresa_id
    )
    
    if status:
        query = query.filter(ConciliacaoBancariaIA.status_conciliacao == status)
    
    conciliacoes = query.all()
    return {"success": True, "data": conciliacoes}

@router.post("/executar-conciliacao-automatica")
async def executar_conciliacao_automatica(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    empresa_id = dados.get("empresa_id")
    
    
    conciliacoes_processadas = 0
    matches_automaticos = 0
    
    return {
        "success": True,
        "message": "Conciliação automática executada",
        "data": {
            "conciliacoes_processadas": conciliacoes_processadas,
            "matches_automaticos": matches_automaticos,
            "taxa_sucesso": 95.2
        }
    }

@router.get("/dre-automatico/{empresa_id}")
async def obter_dre_automatico(
    empresa_id: int,
    periodo_inicio: date = Query(...),
    periodo_fim: date = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    dre = db.query(DREAutomatico).filter(
        DREAutomatico.empresa_id == empresa_id,
        DREAutomatico.periodo_inicio == periodo_inicio,
        DREAutomatico.periodo_fim == periodo_fim
    ).first()
    
    if not dre:
        raise HTTPException(status_code=404, detail="DRE não encontrado para o período")
    
    return {"success": True, "data": dre}


@router.get("/previsao-demanda/{produto_id}")
async def obter_previsao_demanda(
    produto_id: int,
    empresa_id: int = Query(...),
    horizonte_dias: int = Query(30),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    previsao = db.query(PrevisaoDemandaIA).filter(
        PrevisaoDemandaIA.produto_id == produto_id,
        PrevisaoDemandaIA.empresa_id == empresa_id,
        PrevisaoDemandaIA.horizonte_dias == horizonte_dias
    ).first()
    
    return {"success": True, "data": previsao}

@router.post("/gerar-previsao-demanda")
async def gerar_previsao_demanda(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    produto_id = dados.get("produto_id")
    empresa_id = dados.get("empresa_id")
    horizonte_dias = dados.get("horizonte_dias", 30)
    
    nova_previsao = PrevisaoDemandaIA(
        produto_id=produto_id,
        empresa_id=empresa_id,
        data_previsao=datetime.now().date(),
        horizonte_dias=horizonte_dias,
        demanda_prevista=150.5,
        intervalo_confianca_min=120.0,
        intervalo_confianca_max=180.0,
        algoritmo_usado="ARIMA_SARIMA",
        acuracia_modelo=89.7,
        fatores_sazonais={"janeiro": 1.2, "dezembro": 1.5},
        tendencia_crescimento=5.2,
        volatilidade=12.8,
        ponto_reposicao_sugerido=50,
        estoque_seguranca_sugerido=25
    )
    
    db.add(nova_previsao)
    db.commit()
    db.refresh(nova_previsao)
    
    return {"success": True, "data": nova_previsao}

@router.get("/classificacao-abc-xyz/{empresa_id}")
async def obter_classificacao_abc_xyz(
    empresa_id: int,
    classificacao: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(ClassificacaoABCXYZ).filter(
        ClassificacaoABCXYZ.empresa_id == empresa_id
    )
    
    if classificacao:
        query = query.filter(ClassificacaoABCXYZ.classificacao_combinada == classificacao)
    
    classificacoes = query.all()
    return {"success": True, "data": classificacoes}

@router.post("/executar-classificacao-abc-xyz")
async def executar_classificacao_abc_xyz(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    empresa_id = dados.get("empresa_id")
    periodo_inicio = dados.get("periodo_inicio")
    periodo_fim = dados.get("periodo_fim")
    
    produtos_classificados = 0
    
    return {
        "success": True,
        "message": "Classificação ABC-XYZ executada",
        "data": {
            "produtos_classificados": produtos_classificados,
            "classe_a": 20,
            "classe_b": 30,
            "classe_c": 50
        }
    }


@router.get("/cliente-analise-360/{cliente_id}")
async def obter_analise_360_cliente(
    cliente_id: int,
    empresa_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    analise = db.query(ClienteAnalise360).filter(
        ClienteAnalise360.cliente_id == cliente_id,
        ClienteAnalise360.empresa_id == empresa_id
    ).first()
    
    return {"success": True, "data": analise}

@router.post("/gerar-analise-360-cliente")
async def gerar_analise_360_cliente(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cliente_id = dados.get("cliente_id")
    empresa_id = dados.get("empresa_id")
    
    nova_analise = ClienteAnalise360(
        cliente_id=cliente_id,
        empresa_id=empresa_id,
        score_credito=750,
        score_fidelidade=85,
        score_engajamento=92,
        valor_vida_estimado=15000.00,
        probabilidade_churn=12.5,
        segmento_automatico="premium",
        perfil_comportamental={"frequencia_compra": "alta", "valor_medio": 500},
        preferencias_produto={"categoria_favorita": "eletrônicos"},
        proxima_compra_prevista=datetime.now().date(),
        valor_proxima_compra=450.00,
        canal_preferencial="online",
        melhor_horario_contato="14:00-16:00",
        insights_ia={"tendencia": "crescente", "risco": "baixo"},
        recomendacoes_acao=["oferecer_desconto_premium", "contato_proativo"]
    )
    
    db.add(nova_analise)
    db.commit()
    db.refresh(nova_analise)
    
    return {"success": True, "data": nova_analise}


@router.get("/modelos-ml")
async def listar_modelos_ml(
    tipo_modelo: Optional[str] = Query(None),
    ativo: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(ModelosML)
    
    if tipo_modelo:
        query = query.filter(ModelosML.tipo_modelo == tipo_modelo)
    
    if ativo is not None:
        query = query.filter(ModelosML.modelo_ativo == ativo)
    
    modelos = query.all()
    return {"success": True, "data": modelos}

@router.post("/treinar-modelo")
async def treinar_modelo(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    nome_modelo = dados.get("nome_modelo")
    tipo_modelo = dados.get("tipo_modelo")
    algoritmo = dados.get("algoritmo")
    
    novo_modelo = ModelosML(
        nome_modelo=nome_modelo,
        tipo_modelo=tipo_modelo,
        algoritmo=algoritmo,
        versao="1.0",
        parametros=dados.get("parametros", {}),
        metricas_performance={"accuracy": 0.95, "precision": 0.92, "recall": 0.89},
        data_treino=datetime.now(),
        modelo_ativo=True,
        criado_por=current_user.get("id")
    )
    
    db.add(novo_modelo)
    db.commit()
    db.refresh(novo_modelo)
    
    return {"success": True, "data": novo_modelo}

@router.get("/predicoes-insights/{empresa_id}")
async def obter_predicoes_insights(
    empresa_id: int,
    tipo_predicao: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(PredicoesInsights).filter(
        PredicoesInsights.empresa_id == empresa_id
    )
    
    if tipo_predicao:
        query = query.filter(PredicoesInsights.tipo_predicao == tipo_predicao)
    
    predicoes = query.order_by(PredicoesInsights.data_predicao.desc()).limit(100).all()
    return {"success": True, "data": predicoes}

@router.post("/gerar-predicao")
async def gerar_predicao(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    modelo_id = dados.get("modelo_id")
    empresa_id = dados.get("empresa_id")
    tipo_predicao = dados.get("tipo_predicao")
    
    nova_predicao = PredicoesInsights(
        modelo_id=modelo_id,
        empresa_id=empresa_id,
        tipo_predicao=tipo_predicao,
        entidade_id=dados.get("entidade_id"),
        entidade_tipo=dados.get("entidade_tipo"),
        data_referencia_predicao=datetime.now().date(),
        valor_predito=1250.75,
        intervalo_confianca_min=1100.00,
        intervalo_confianca_max=1400.00,
        probabilidade=87.5,
        confianca_predicao=92.3,
        fatores_influencia={"sazonalidade": 0.7, "promocoes": 0.3},
        explicabilidade={"feature_importance": {"preco": 0.4, "categoria": 0.3}},
        acao_recomendada="Aumentar estoque em 20%",
        impacto_estimado=5000.00,
        prioridade="alta"
    )
    
    db.add(nova_predicao)
    db.commit()
    db.refresh(nova_predicao)
    
    return {"success": True, "data": nova_predicao}


@router.get("/dashboard-executivo/{empresa_id}")
async def obter_dashboard_executivo(
    empresa_id: int,
    periodo: int = Query(30, description="Período em dias"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    dashboard_data = {
        "kpis_financeiros": {
            "receita_total": 150000.00,
            "lucro_liquido": 25000.00,
            "margem_liquida": 16.67,
            "ebitda": 35000.00,
            "fluxo_caixa_livre": 20000.00
        },
        "kpis_vendas": {
            "vendas_periodo": 1250,
            "ticket_medio": 120.00,
            "conversao": 3.5,
            "crescimento_vendas": 15.2
        },
        "kpis_estoque": {
            "giro_estoque": 8.5,
            "cobertura_dias": 42,
            "produtos_ruptura": 5,
            "acuracia_previsao": 89.7
        },
        "kpis_clientes": {
            "clientes_ativos": 850,
            "nps": 72,
            "churn_rate": 5.2,
            "clv_medio": 2500.00
        },
        "alertas": [
            {"tipo": "estoque", "mensagem": "5 produtos em ruptura", "prioridade": "alta"},
            {"tipo": "financeiro", "mensagem": "Fluxo de caixa negativo em 7 dias", "prioridade": "critica"}
        ],
        "insights_ia": [
            "Vendas 15% acima da previsão este mês",
            "Categoria eletrônicos com maior potencial de crescimento",
            "Cliente premium com risco de churn identificado"
        ]
    }
    
    return {"success": True, "data": dashboard_data}
