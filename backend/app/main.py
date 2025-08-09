from fastapi import FastAPI, Depends, HTTPException, status, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os

from .database import engine, get_db
from .models import Base
from .routers import auth, eventos, usuarios, empresas, listas, transacoes, checkins, dashboard, relatorios, whatsapp, cupons, n8n, pdv, financeiro, gamificacao
from .middleware import LoggingMiddleware
from .auth import verificar_permissao_admin
from .scheduler import start_scheduler
from .websocket import manager

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Gestão de Eventos",
    description="API completa para gestão de eventos com foco em segurança e automação via CPF",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware personalizado para CORS adicional
@app.middleware("http")
async def cors_handler(request: Request, call_next):
    # Se é um request OPTIONS (preflight), responder diretamente
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response
    
    # Para outros requests, processar normalmente
    response = await call_next(request)
    
    # Adicionar headers CORS à resposta
    origin = request.headers.get("Origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# Configuração CORS para desenvolvimento e produção
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://frontend-painel-universal-production.up.railway.app",
        "https://backend-painel-universal-production.up.railway.app",
        # Wildcards para Railway
        "https://*.railway.app",
        "https://*.up.railway.app", 
        # Permissivo para desenvolvimento
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"],
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
async def handle_cors_preflight(path: str):
    """Handle CORS preflight requests"""
    return {"message": "CORS preflight OK"}

@app.get("/api/health")
async def api_health():
    """Health check específico para API"""
    return {
        "status": "ok",
        "api": "Sistema Universal",
        "version": "1.0.0",
        "cors": "enabled",
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
