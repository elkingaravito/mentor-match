from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'mentor', 'mentee', 'admin'

    # Relaciones
    mentor = relationship("Mentor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    mentee = relationship("Mentee", back_populates="user", uselist=False, cascade="all, delete-orphan")
    availability = relationship("Availability", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Mentor(Base):
    __tablename__ = "mentors"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    bio = Column(Text)
    experience_years = Column(Integer)
    company = Column(String)
    position = Column(String)
    linkedin_url = Column(String)
    calendar_integration = Column(String)  # JSON como string

    # Relaciones
    user = relationship("User", back_populates="mentor")
    skills = relationship("MentorSkill", back_populates="mentor", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="mentor", foreign_keys="Session.mentor_id")

class Mentee(Base):
    __tablename__ = "mentees"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    bio = Column(Text)
    goals = Column(Text)
    current_position = Column(String)
    linkedin_url = Column(String)

    # Relaciones
    user = relationship("User", back_populates="mentee")
    interests = relationship("MenteeInterest", back_populates="mentee", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="mentee", foreign_keys="Session.mentee_id")
