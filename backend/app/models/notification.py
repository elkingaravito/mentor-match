from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # session_scheduled, session_reminder, etc.
    related_id = Column(Integer)  # ID de la entidad relacionada (sesión, match, etc.)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)

    # Relaciones
    user = relationship("User", back_populates="notifications")
