from fastapi import FastAPI, Depends, HTTPException, status, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import logging

from .database import engine, get_db
from .models import Base
from .routers import auth, eventos, usuarios, empresas, listas, transacoes, checkins, dashboard, relatorios, whatsapp, cupons, n8n, pdv, financeiro, gamificacao
from .middleware import LoggingMiddleware
from .auth import verificar_permissao_admin
from .scheduler import start_scheduler
from .websocket import manager

Base.metadata.create_all(bind=engine)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sistema de Gestão de Eventos",
    description="API completa para gestão de eventos com foco em segurança e automação via CPF",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuração de origens permitidas baseada no ambiente
def get_allowed_origins():
    """CORS Ultra-Permissivo para resolver problemas de produção"""
    
    # Em qualquer ambiente, permitir TODAS as origens
    logger.info("🔥 CORS ULTRA-PERMISSIVO ATIVADO - Permitindo todas as origens")
    return ["*"]

# Middleware de debug para CORS
@app.middleware("http")
async def cors_debug_middleware(request: Request, call_next):
    """Middleware para debug de CORS requests"""
    origin = request.headers.get("origin")
    method = request.method
    
    logger.info(f"CORS Debug - Method: {method}, Origin: {origin}, Path: {request.url.path}")
    
    # Para requisições OPTIONS (preflight), retornar resposta CORS válida
    if method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = origin or "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "3600"
        logger.info(f"CORS Preflight respondido para origin: {origin}")
        return response
    
    response = await call_next(request)
    
    # Log dos headers de resposta CORS
    cors_headers = {k: v for k, v in response.headers.items() if k.lower().startswith('access-control')}
    if cors_headers:
        logger.info(f"CORS Headers enviados: {cors_headers}")
    
    return response

# 🔥 CONFIGURAÇÃO CORS ULTRA-PERMISSIVA - OPÇÃO 1
allowed_origins = get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir TODAS as origens
    allow_credentials=False,  # OBRIGATÓRIO ser False quando origins=["*"]
    allow_methods=["*"],  # Permitir TODOS os métodos
    allow_headers=["*"],  # Permitir TODOS os headers
    expose_headers=["*"],  # Expor TODOS os headers
    max_age=86400,  # Cache preflight por 24 horas
)

app.add_middleware(LoggingMiddleware)

start_scheduler()

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(empresas.router, prefix="/api/empresas", tags=["Empresas"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["Usuários"])
app.include_router(eventos.router, prefix="/api/eventos", tags=["Eventos"])
app.include_router(listas.router, prefix="/api/listas", tags=["Listas"])
app.include_router(transacoes.router, prefix="/api/transacoes", tags=["Transações"])
app.include_router(checkins.router, prefix="/api/checkins", tags=["Check-ins"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(relatorios.router, prefix="/api/relatorios", tags=["Relatórios"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp"])
app.include_router(cupons.router, prefix="/api/cupons", tags=["Cupons"])
app.include_router(n8n.router, prefix="/api/n8n", tags=["N8N"])
app.include_router(pdv.router, prefix="/api")
app.include_router(financeiro.router, prefix="/api")
app.include_router(gamificacao.router, prefix="/api")

@app.websocket("/api/pdv/ws/{evento_id}")
async def websocket_endpoint(websocket: WebSocket, evento_id: int):
    await manager.connect(websocket, evento_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"pong: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, evento_id)

@app.websocket("/api/checkin/ws/{evento_id}")
async def checkin_websocket_endpoint(websocket: WebSocket, evento_id: int):
    await manager.connect(websocket, evento_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"checkin-pong: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, evento_id)

@app.get("/healthz")
async def healthz():
    return {
        "status": "ok", 
        "mensagem": "Sistema de Gestão de Eventos funcionando",
        "timestamp": datetime.now().isoformat(),
        "environment": "production" if os.getenv("RAILWAY_ENVIRONMENT") else "development"
    }

@app.options("/api/{path:path}")
async def handle_cors_preflight(path: str, request: Request):
    """Handle CORS preflight requests com debug detalhado"""
    origin = request.headers.get("origin")
    method = request.headers.get("access-control-request-method")
    headers = request.headers.get("access-control-request-headers")
    
    logger.info(f"🔍 CORS Preflight - Path: {path}, Origin: {origin}, Method: {method}, Headers: {headers}")
    
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "86400"
    
    return response

@app.get("/api/health")
async def api_health():
    """Health check específico para API"""
    return {
        "status": "ok",
        "api": "Sistema Universal",
        "version": "1.0.0",
        "cors": "ultra-permissive",
        "environment": "production" if os.getenv("RAILWAY_ENVIRONMENT") else "development",
        "timestamp": datetime.now().isoformat()
    }

@app.api_route("/api/cors-test", methods=["GET", "POST", "OPTIONS"])
async def cors_test(request: Request):
    """Endpoint para testar CORS e debug detalhado"""
    origin = request.headers.get("origin")
    user_agent = request.headers.get("user-agent")
    method = request.method
    
    logger.info(f"🧪 CORS Test - Method: {method}, Origin: {origin}")
    
    return {
        "message": "CORS test successful - ULTRA PERMISSIVE MODE",
        "method": method,
        "origin": origin,
        "user_agent": user_agent,
        "environment": "production" if os.getenv("RAILWAY_ENVIRONMENT") else "development",
        "cors_mode": "ultra_permissive",
        "allowed_origins": ["*"],
        "timestamp": datetime.now().isoformat()
    }

@app.post("/setup-inicial")
async def setup_inicial_temp(db: Session = Depends(get_db)):
    from .models import Empresa, Usuario, TipoUsuario
    from .auth import gerar_hash_senha
    
    try:
        # Verificar se já existe empresa
        empresa_existente = db.query(Empresa).first()
        if empresa_existente:
            return {"message": "Sistema já foi inicializado", "empresa": empresa_existente.nome}
        
        # Criar empresa
        empresa = Empresa(
            nome="Painel Universal - Empresa Demo",
            cnpj="00000000000100",
            email="contato@paineluniversal.com",
            telefone="(11) 99999-9999",
            endereco="Endereço da empresa demo"
        )
        db.add(empresa)
        db.commit()
        db.refresh(empresa)
        
        # Criar usuário admin
        admin = Usuario(
            cpf="00000000000",
            nome="Administrador Sistema",
            email="admin@paineluniversal.com",
            telefone="(11) 99999-0000",
            senha_hash=gerar_hash_senha("0000"),
            tipo=TipoUsuario.ADMIN
        )
        db.add(admin)
        
        # Criar usuário promoter
        promoter = Usuario(
            cpf="11111111111",
            nome="Promoter Demo",
            email="promoter@paineluniversal.com",
            telefone="(11) 99999-1111",
            senha_hash=gerar_hash_senha("promoter123"),
            tipo=TipoUsuario.PROMOTER
        )
        db.add(promoter)
        
        db.commit()
        
        return {
            "message": "Sistema inicializado com sucesso!",
            "empresa": empresa.nome,
            "usuarios_criados": [
                {"cpf": "00000000000", "nome": admin.nome, "tipo": "admin", "senha": "0000"},
                {"cpf": "11111111111", "nome": promoter.nome, "tipo": "promoter", "senha": "promoter123"}
            ]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao inicializar sistema: {str(e)}")

@app.get("/")
async def root():
    return {
        "mensagem": "Bem-vindo ao Sistema de Gestão de Eventos",
        "versao": "1.0.0",
        "documentacao": "/docs",
        "timestamp": datetime.now().isoformat()
    }