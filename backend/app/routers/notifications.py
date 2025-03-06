from typing import Any, List, Dict
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.core.database import get_db
from app.models import Notification, User

router = APIRouter()

@router.get("/user/{user_id}", response_model=List[schemas.Notification])
def read_user_notifications(
    user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve notifications for a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(
        Notification.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return notifications

@router.post("/", response_model=schemas.Notification)
def create_notification(
    notification_in: schemas.NotificationCreate, db: Session = Depends(get_db)
) -> Any:
    """
    Create a new notification.
    """
    user = db.query(User).filter(User.id == notification_in.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    notification = Notification(**notification_in.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.put("/{notification_id}", response_model=schemas.Notification)
def update_notification(
    notification_id: int, notification_in: schemas.NotificationUpdate, db: Session = Depends(get_db)
) -> Any:
    """
    Update a notification.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    update_data = notification_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notification, field, value)
    
    db.commit()
    db.refresh(notification)
    return notification

@router.delete("/{notification_id}", response_model=schemas.Notification)
def delete_notification(
    notification_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Delete a notification.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    db.delete(notification)
    db.commit()
    return notification

@router.put("/user/{user_id}/mark-all-read", response_model=dict)
def mark_all_notifications_read(
    user_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Mark all notifications as read for a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.read == False
    ).all()
    
    for notification in notifications:
        notification.read = True
    
    db.commit()
    
    return {"marked_read": len(notifications)}
