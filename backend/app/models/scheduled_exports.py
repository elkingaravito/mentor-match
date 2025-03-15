from sqlalchemy import Column, Integer, String, JSON, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum
from datetime import datetime

class ExportFrequency(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

class ExportFormat(str, enum.Enum):
    CSV = "csv"
    EXCEL = "excel"
    PDF = "pdf"

class ScheduledExport(Base):
    __tablename__ = "scheduled_exports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(String)
    frequency = Column(Enum(ExportFrequency), nullable=False)
    format = Column(Enum(ExportFormat), nullable=False)
    filters = Column(JSON)  # Store filters as JSON
    recipients = Column(JSON)  # Array of email addresses
    last_run = Column(DateTime)
    next_run = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="scheduled_exports")