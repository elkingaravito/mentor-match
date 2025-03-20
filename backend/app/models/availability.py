from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Availability(Base, TimestampMixin):
    __tablename__ = "availability"
    __table_args__ = {'extend_existing': True}  # Añadir esto para prevenir errores de tabla duplicada

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    day_of_week = Column(Integer, nullable=False)  # 0-6 (domingo a sábado)
    start_time = Column(String, nullable=False)  # Formato HH:MM
    end_time = Column(String, nullable=False)  # Formato HH:MM
    recurrence = Column(String, nullable=False)  # 'weekly', 'biweekly', 'monthly'

    # Relaciones
    user = relationship("User", back_populates="availability")

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
