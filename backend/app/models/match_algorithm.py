from sqlalchemy import Column, Integer, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class MatchScore(Base, TimestampMixin):
    __tablename__ = "match_scores"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"))
    mentee_id = Column(Integer, ForeignKey("users.id"))
    
    # Overall match score
    total_score = Column(Float)
    
    # Component scores
    skill_match_score = Column(Float)  # How well skills/interests align
    availability_score = Column(Float)  # Schedule compatibility
    style_match_score = Column(Float)  # Mentoring style compatibility
    goals_alignment_score = Column(Float)  # How well mentor can help with mentee goals
    
    # Match details
    match_details = Column(JSON)  # Detailed breakdown of the match
    status = Column(String)  # "suggested", "accepted", "rejected", "active"
    
    # Relationships
    mentor = relationship("User", foreign_keys=[mentor_id])
    mentee = relationship("User", foreign_keys=[mentee_id])

class MatchPreference(Base):
    __tablename__ = "match_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Matching weights (0-1)
    skill_weight = Column(Float, default=0.3)
    availability_weight = Column(Float, default=0.2)
    style_weight = Column(Float, default=0.2)
    goals_weight = Column(Float, default=0.3)
    
    # Preferences
    preferred_meeting_frequency = Column(Integer)  # meetings per month
    preferred_session_duration = Column(Integer)  # minutes
    timezone = Column(String)
    language_preferences = Column(JSON)  # List of preferred languages
    industry_preferences = Column(JSON)  # Preferred industries
    
    # Additional criteria
    custom_criteria = Column(JSON)  # Any additional matching criteria
    exclusions = Column(JSON)  # Users/criteria to exclude
    
    user = relationship("User", back_populates="match_preferences")

class MatchFeedback(Base, TimestampMixin):
    __tablename__ = "match_feedback"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("match_scores.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)  # 1-5 rating
    feedback = Column(Text)
    suggestions = Column(Text)
    
    match = relationship("MatchScore")
    user = relationship("User")
