from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    day_of_week = Column(Integer, nullable=False)  # 0-6 (domingo a sábado)
    start_time = Column(String, nullable=False)  # Formato HH:MM
    end_time = Column(String, nullable=False)  # Formato HH:MM
    recurrence = Column(String, nullable=False)  # 'weekly', 'biweekly', 'monthly'

    # Relaciones
    user = relationship("User", back_populates="availability")

class Session(Base, TimestampMixin):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("mentors.user_id"))
    mentee_id = Column(Integer, ForeignKey("mentees.user_id"))
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, nullable=False)  # 'scheduled', 'completed', 'cancelled', 'no-show'
    meeting_link = Column(String)
    calendar_event_id = Column(String)  # ID del evento en Google Calendar

    # Relaciones
    mentor = relationship("Mentor", back_populates="sessions", foreign_keys=[mentor_id])
    mentee = relationship("Mentee", back_populates="sessions", foreign_keys=[mentee_id])
    feedback = relationship("SessionFeedback", back_populates="session", cascade="all, delete-orphan")

class SessionFeedback(Base, TimestampMixin):
    __tablename__ = "session_feedback"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    rating = Column(Integer, nullable=False)  # 1-5
    comments = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))

    # Relaciones
    session = relationship("Session", back_populates="feedback")
    user = relationship("User")

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, nullable=False)  # 'session_reminder', 'session_cancelled', etc.
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)

    # Relaciones
    user = relationship("User", back_populates="notifications")
