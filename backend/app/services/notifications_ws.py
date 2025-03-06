from typing import Dict, List, Any
import json
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.models import Notification, User

class ConnectionManager:
    """
    Administrador de conexiones WebSocket para notificaciones en tiempo real.
    """
    
    def __init__(self):
        # Diccionario de conexiones activas: {user_id: [websocket1, websocket2, ...]}
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """
        Conecta un cliente WebSocket y lo asocia con un usuario.
        """
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        """
        Desconecta un cliente WebSocket.
        """
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            
            # Si no hay más conexiones para este usuario, eliminar la entrada
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_notification(self, user_id: int, message: Dict[str, Any]):
        """
        Envía una notificación a un usuario específico.
        """
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error al enviar notificación: {e}")
    
    async def broadcast(self, message: Dict[str, Any]):
        """
        Envía una notificación a todos los usuarios conectados.
        """
        for user_id in self.active_connections:
            await self.send_notification(user_id, message)

# Instancia global del administrador de conexiones
manager = ConnectionManager()

async def handle_websocket(websocket: WebSocket, user_id: int, db: Session):
    """
    Maneja una conexión WebSocket para un usuario.
    """
    await manager.connect(websocket, user_id)
    
    try:
        # Enviar notificaciones no leídas al conectarse
        unread_notifications = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read == False
        ).all()
        
        for notification in unread_notifications:
            await websocket.send_json({
                "id": notification.id,
                "type": notification.type,
                "message": notification.message,
                "created_at": notification.created_at.isoformat()
            })
        
        # Mantener la conexión abierta y escuchar mensajes
        while True:
            # Esperar mensajes del cliente (por ejemplo, confirmación de lectura)
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Procesar mensajes del cliente
            if message.get("action") == "mark_read" and message.get("notification_id"):
                notification_id = message.get("notification_id")
                notification = db.query(Notification).filter(
                    Notification.id == notification_id,
                    Notification.user_id == user_id
                ).first()
                
                if notification:
                    notification.read = True
                    db.commit()
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

async def send_notification_to_user(user_id: int, notification_type: str, message: str, db: Session):
    """
    Envía una notificación a un usuario y la guarda en la base de datos.
    """
    # Crear la notificación en la base de datos
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        message=message,
        read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Enviar la notificación en tiempo real si el usuario está conectado
    await manager.send_notification(user_id, {
        "id": notification.id,
        "type": notification.type,
        "message": notification.message,
        "created_at": notification.created_at.isoformat()
    })
