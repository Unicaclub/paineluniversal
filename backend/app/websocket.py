from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
from datetime import datetime
import json
import asyncio
from sqlalchemy.orm import sessionmaker
from .database import engine
from datetime import datetime

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, evento_id: int):
        await websocket.accept()
        if evento_id not in self.active_connections:
            self.active_connections[evento_id] = []
        self.active_connections[evento_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, evento_id: int):
        if evento_id in self.active_connections:
            if websocket in self.active_connections[evento_id]:
                self.active_connections[evento_id].remove(websocket)
    
    async def broadcast_to_event(self, evento_id: int, message: dict):
        if evento_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[evento_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    disconnected.append(connection)
            
            for conn in disconnected:
                self.active_connections[evento_id].remove(conn)

manager = ConnectionManager()

async def websocket_marketing_endpoint(websocket: WebSocket, empresa_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "join_empresa":
                await websocket.send_text(json.dumps({
                    "type": "joined",
                    "empresa_id": empresa_id
                }))
            
            elif message.get("type") == "transacao_fidelidade":
                await manager.broadcast({
                    "type": "transacao_fidelidade",
                    "data": message.get("data")
                })
            
            elif message.get("type") == "nivel_upgrade":
                await manager.broadcast({
                    "type": "nivel_upgrade", 
                    "data": message.get("data")
                })
            
            elif message.get("type") == "campanha_executada":
                await manager.broadcast({
                    "type": "campanha_executada",
                    "data": message.get("data")
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def notify_stock_update(produto_id: int, evento_id: int, estoque_atual: int, produto_nome: str):
    await manager.broadcast_to_event(evento_id, {
        "type": "stock_update",
        "produto_id": produto_id,
        "estoque_atual": estoque_atual,
        "produto_nome": produto_nome,
        "timestamp": datetime.now().isoformat()
    })

async def notify_new_sale(evento_id: int, venda_data: dict):
    await manager.broadcast_to_event(evento_id, {
        "type": "new_sale",
        "venda": venda_data,
        "timestamp": datetime.now().isoformat()
    })

async def notify_cash_register_update(evento_id: int, caixa_data: dict):
    await manager.broadcast_to_event(evento_id, {
        "type": "cash_register_update",
        "caixa": caixa_data,
        "timestamp": datetime.now().isoformat()
    })

async def notify_checkin_update(evento_id: int, checkin_data: dict):
    await manager.broadcast_to_event(evento_id, {
        "type": "checkin_update",
        "data": checkin_data,
        "timestamp": datetime.now().isoformat()
    })

async def notify_dashboard_update(evento_id: int, dashboard_data: dict):
    await manager.broadcast_to_event(evento_id, {
        "type": "dashboard_update",
        "data": dashboard_data,
        "timestamp": datetime.now().isoformat()
    })

async def notify_mesa_update(evento_id: int, mesa_data: dict):
    await manager.broadcast_to_event(evento_id, {
        "type": "mesa_atualizada",
        "data": mesa_data,
        "timestamp": datetime.now().isoformat()
    })

async def notify_comanda_update(evento_id: int, comanda_data: dict):
    await manager.broadcast_to_event(evento_id, {
        "type": "comanda_aberta",
        "data": comanda_data,
        "timestamp": datetime.now().isoformat()
    })

async def notify_bloqueio_update(evento_id: int, bloqueio_data: dict):
    await manager.broadcast_to_event(evento_id, {
        "type": "entidade_bloqueada",
        "data": bloqueio_data,
        "timestamp": datetime.now().isoformat()
    })

async def notify_cartao_update(evento_id: int, cartao_data: dict):
    await manager.broadcast_to_event(evento_id, {
        "type": "cartao_emitido",
        "data": cartao_data,
        "timestamp": datetime.now().isoformat()
    })

async def broadcast_erp_kpis(data):
    """Broadcast ERP KPIs update to all connected clients"""
    await manager.broadcast_to_event(0, {
        "type": "kpis_atualizados",
        "data": data
    })

async def broadcast_nova_venda(venda):
    """Broadcast new sale to all connected clients"""
    await manager.broadcast_to_event(0, {
        "type": "nova_venda",
        "data": venda
    })

async def broadcast_estoque_atualizado(produto):
    """Broadcast inventory update to all connected clients"""
    await manager.broadcast_to_event(0, {
        "type": "estoque_atualizado",
        "data": produto
    })

async def broadcast_integracao_sincronizada(integracao):
    """Broadcast integration sync to all connected clients"""
    await manager.broadcast_to_event(0, {
        "type": "integracao_sincronizada",
        "data": integracao
    })

async def broadcast_novo_alerta(alerta):
    """Broadcast new alert to all connected clients"""
    await manager.broadcast_to_event(0, {
        "type": "novo_alerta",
        "data": alerta
    })
