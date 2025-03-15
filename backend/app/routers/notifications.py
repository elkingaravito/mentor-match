from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationResponse, NotificationCreate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene las notificaciones del usuario."""
    notification_service = NotificationService(db)
    return await notification_service.get_user_notifications(
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit
    )

@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca una notificación como leída."""
    notification_service = NotificationService(db)
    notification = await notification_service.mark_as_read(
        notification_id=notification_id,
        user_id=current_user.id
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina una notificación."""
    notification_service = NotificationService(db)
    success = await notification_service.delete_notification(
        notification_id=notification_id,
        user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

@router.post("/settings")
async def update_notification_settings(
    settings: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualiza las preferencias de notificación del usuario."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.notification_settings = settings
    db.commit()
    return {"status": "success"}
