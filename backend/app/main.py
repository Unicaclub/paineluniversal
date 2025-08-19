from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime

# App mínima
app = FastAPI(title="Sistema Universal - Teste")

# CORS básico
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Backend funcionando!", "timestamp": datetime.now().isoformat()}

@app.get("/healthz")
async def health():
    return {"status": "healthy"}

@app.get("/api/health")
async def api_health():
    return {"status": "api_healthy"}

@app.post("/api/auth/login")
async def test_login():
    return {
        "access_token": "test_token",
        "token_type": "bearer",
        "usuario": {
            "id": 1,
            "nome": "Teste",
            "cpf": "00000000000",
            "email": "teste@teste.com",
            "tipo": "admin"
        }
    }

print("🚀 FastAPI test app created successfully")
