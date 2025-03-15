from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SessionBase(BaseModel):
    mentor_id: int
    mentee_id: int
    start_time: datetime
    end_time: datetime
    title: str
    description: Optional[str] = None
    meeting_link: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    title: Optional[str] = None
    description: Optional[str] = None
    meeting_link: Optional[str] = None
    status: Optional[str] = None

class SessionResponse(SessionBase):
    id: int
    status: str
    calendar_event_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class SessionWithCalendar(SessionResponse):
    calendar_link: Optional[str] = None
