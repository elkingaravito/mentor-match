from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models import User
from app.services.notifications_ws import handle_websocket

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Endpoint WebSocket para notificaciones en tiempo real.
    """
    # Verificar que el token es válido y corresponde al usuario
    try:
        # Obtener el token del query parameter
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Verificar el token
        user = get_current_user(token, db)
        
        # Verificar que el usuario coincide con el ID proporcionado
        if user.id != user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Manejar la conexión WebSocket
        await handle_websocket(websocket, user_id, db)
    
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    
    except WebSocketDisconnect:
        # La desconexión ya se maneja en handle_websocket
        pass
