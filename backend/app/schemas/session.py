from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# Esquemas base
class AvailabilityBase(BaseModel):
    day_of_week: int  # 0-6 (domingo a sábado)
    start_time: str  # Formato HH:MM
    end_time: str  # Formato HH:MM
    recurrence: str  # 'weekly', 'biweekly', 'monthly'

class SessionBase(BaseModel):
    mentor_id: int
    mentee_id: int
    start_time: datetime
    end_time: datetime
    status: str  # 'scheduled', 'completed', 'cancelled', 'no-show'
    meeting_link: Optional[str] = None
    calendar_event_id: Optional[str] = None

class SessionFeedbackBase(BaseModel):
    rating: int  # 1-5
    comments: Optional[str] = None

class NotificationBase(BaseModel):
    type: str  # 'session_reminder', 'session_cancelled', etc.
    message: str
    read: bool = False

# Esquemas para creación
class AvailabilityCreate(AvailabilityBase):
    pass

class SessionCreate(BaseModel):
    mentor_id: int
    mentee_id: int
    start_time: datetime
    end_time: datetime

class SessionFeedbackCreate(SessionFeedbackBase):
    session_id: int

class NotificationCreate(NotificationBase):
    user_id: int

# Esquemas para actualización
class AvailabilityUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    recurrence: Optional[str] = None

class SessionUpdate(BaseModel):
    status: Optional[str] = None
    meeting_link: Optional[str] = None
    calendar_event_id: Optional[str] = None

class SessionFeedbackUpdate(BaseModel):
    rating: Optional[int] = None
    comments: Optional[str] = None

class NotificationUpdate(BaseModel):
    read: Optional[bool] = None

# Esquemas para respuesta
class Availability(AvailabilityBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class Session(SessionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SessionFeedback(SessionFeedbackBase):
    id: int
    session_id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Notification(NotificationBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Esquemas para listas
class AvailabilityList(BaseModel):
    availabilities: List[Availability]

class SessionList(BaseModel):
    sessions: List[Session]

class NotificationList(BaseModel):
    notifications: List[Notification]