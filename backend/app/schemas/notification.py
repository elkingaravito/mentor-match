from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str
    related_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    read: bool
    read_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationSettings(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    session_reminders: bool = True
    match_notifications: bool = True
    feedback_notifications: bool = True
    reminder_time: int = 30  # minutos antes de la sesión
