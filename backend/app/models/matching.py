from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Boolean, Text, Float
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class Industry(Base):
    __tablename__ = "industries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)

class UserIndustryExperience(Base):
    __tablename__ = "user_industry_experience"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    industry_id = Column(Integer, ForeignKey("industries.id"))
    years_experience = Column(Integer, default=0)
    is_current = Column(Boolean, default=True)
    position_level = Column(String)  # e.g., "Junior", "Senior", "Lead", "Manager"

    user = relationship("User", back_populates="industry_experience")
    industry = relationship("Industry")

class MentoringStyle(str, enum.Enum):
    DIRECTIVE = "directive"          # More structured, goal-oriented
    COLLABORATIVE = "collaborative"  # Partnership-based approach
    SUPPORTIVE = "supportive"       # Emphasis on emotional support
    CHALLENGING = "challenging"      # Pushes mentee out of comfort zone

class MentoringPreference(Base):
    __tablename__ = "mentoring_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    preferred_style = Column(Enum(MentoringStyle))
    structured_sessions = Column(Boolean, default=True)  # Prefers structured vs. informal sessions
    meeting_frequency = Column(Integer)  # Preferred meetings per month
    session_duration = Column(Integer)  # Preferred minutes per session
    goals_focus = Column(Float)  # 0-1 scale: technical skills vs. soft skills focus
    feedback_frequency = Column(String)  # e.g., "After each session", "Weekly", "Monthly"

    user = relationship("User", back_populates="mentoring_preferences")

class MentorshipGoal(Base):
    __tablename__ = "mentorship_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    timeline_months = Column(Integer)
    priority = Column(Integer)  # 1-5 scale
    category = Column(String)  # e.g., "Technical", "Leadership", "Career Growth"
    status = Column(String, default="pending")  # pending, in_progress, completed

    user = relationship("User", back_populates="mentorship_goals")