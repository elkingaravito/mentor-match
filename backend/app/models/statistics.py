from sqlalchemy import Column, Integer, Float, ForeignKey, JSON, String, DateTime
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class SessionStatistics(Base, TimestampMixin):
    __tablename__ = "session_statistics"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    
    # Time metrics
    scheduled_duration = Column(Integer)  # minutes
    actual_duration = Column(Integer)  # minutes
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    
    # Attendance
    mentor_attended = Column(Boolean, default=False)
    mentee_attended = Column(Boolean, default=False)
    
    # Meeting data
    meeting_url = Column(String)  # Google Meet/Zoom URL
    meeting_recording = Column(String)  # Recording URL if available
    meeting_notes = Column(JSON)  # Structured meeting notes
    
    # Metrics
    engagement_score = Column(Float)  # Calculated from participation
    technical_depth = Column(Integer)  # 1-5 scale
    goals_progress = Column(Float)  # 0-1 scale
    
    session = relationship("Session", back_populates="statistics")

class MentorshipMetrics(Base, TimestampMixin):
    __tablename__ = "mentorship_metrics"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"))
    mentee_id = Column(Integer, ForeignKey("users.id"))
    
    # Time investment
    total_sessions = Column(Integer, default=0)
    total_hours = Column(Float, default=0.0)
    avg_session_duration = Column(Float)  # minutes
    
    # Success metrics
    goals_completed = Column(Integer, default=0)
    skills_improved = Column(JSON)  # List of improved skills with ratings
    satisfaction_score = Column(Float)  # Average of feedback scores
    
    # Engagement metrics
    attendance_rate = Column(Float)  # Percentage
    cancellation_rate = Column(Float)  # Percentage
    rescheduling_rate = Column(Float)  # Percentage
    
    # Relationships
    mentor = relationship("User", foreign_keys=[mentor_id])
    mentee = relationship("User", foreign_keys=[mentee_id])

class PlatformStatistics(Base, TimestampMixin):
    __tablename__ = "platform_statistics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)
    
    # User metrics
    active_mentors = Column(Integer)
    active_mentees = Column(Integer)
    total_matches = Column(Integer)
    active_matches = Column(Integer)
    
    # Session metrics
    total_sessions = Column(Integer)
    completed_sessions = Column(Integer)
    cancelled_sessions = Column(Integer)
    avg_session_rating = Column(Float)
    
    # Matching metrics
    avg_match_score = Column(Float)
    match_acceptance_rate = Column(Float)
    
    # Popular topics/skills
    top_skills = Column(JSON)  # Most requested skills
    top_industries = Column(JSON)  # Most active industries
    
    # Time metrics
    total_mentoring_hours = Column(Float)
    avg_sessions_per_match = Column(Float)
