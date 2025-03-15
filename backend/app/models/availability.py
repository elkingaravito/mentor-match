from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Availability(Base, TimestampMixin):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    recurrence = Column(String)  # RRULE format for recurring availability
    is_available = Column(Boolean, default=True)
    calendar_event_id = Column(String)  # Reference to external calendar event
    
    # Metadata for calendar integration
    calendar_integration = Column(JSON)  # Stores calendar provider details
    
    # Relationships
    user = relationship("User", back_populates="availability")
    sessions = relationship("Session", back_populates="availability")

class CalendarIntegration(Base):
    __tablename__ = "calendar_integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    provider = Column(String)  # "google", "outlook", etc.
    credentials = Column(JSON)  # Encrypted credentials
    settings = Column(JSON)  # User preferences for calendar sync
    last_sync = Column(DateTime)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="calendar_integration")
