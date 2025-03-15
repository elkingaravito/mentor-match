from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'mentor', 'mentee', 'admin'
    is_active = Column(Boolean, default=True)
    profile_complete = Column(Boolean, default=False)

    # Profile fields
    timezone = Column(String)
    languages = Column(JSON)  # List of language proficiencies
    profile_picture = Column(String)  # URL to profile picture
    
    # Relationships
    mentor = relationship("Mentor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    mentee = relationship("Mentee", back_populates="user", uselist=False, cascade="all, delete-orphan")
    availability = relationship("Availability", back_populates="user", cascade="all, delete-orphan")
    calendar_integration = relationship("CalendarIntegration", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    industry_experience = relationship("UserIndustryExperience", back_populates="user")
    mentoring_preferences = relationship("MentoringPreference", back_populates="user")
    mentorship_goals = relationship("MentorshipGoal", back_populates="user")
    match_preferences = relationship("MatchPreference", back_populates="user", uselist=False)

class Mentor(Base):
    __tablename__ = "mentors"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    bio = Column(Text)
    experience_years = Column(Integer)
    company = Column(String)
    position = Column(String)
    linkedin_url = Column(String)
    
    # Mentor-specific fields
    expertise_areas = Column(JSON)  # List of areas of expertise
    mentoring_experience = Column(JSON)  # Previous mentoring experience
    max_mentees = Column(Integer, default=3)
    current_mentee_count = Column(Integer, default=0)
    
    # Preferences
    preferred_mentee_level = Column(String)  # junior, mid-level, senior
    mentoring_style = Column(String)  # coaching, advisory, hands-on
    session_format = Column(JSON)  # preferred session formats
    
    # Relationships
    user = relationship("User", back_populates="mentor")
    skills = relationship("MentorSkill", back_populates="mentor", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="mentor", foreign_keys="Session.mentor_id")
    active_matches = relationship("MatchScore", 
                                primaryjoin="and_(Mentor.user_id==MatchScore.mentor_id, "
                                          "MatchScore.status=='active')")

class Mentee(Base):
    __tablename__ = "mentees"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    bio = Column(Text)
    goals = Column(Text)
    current_position = Column(String)
    linkedin_url = Column(String)
    
    # Mentee-specific fields
    career_stage = Column(String)  # student, early-career, mid-career, etc.
    desired_skills = Column(JSON)  # Skills they want to develop
    learning_style = Column(String)  # visual, practical, theoretical, etc.
    commitment_level = Column(String)  # hours per month
    
    # Program-specific
    program_duration = Column(Integer)  # desired months of mentorship
    specific_goals = Column(JSON)  # Structured goals for the program
    
    # Relationships
    user = relationship("User", back_populates="mentee")
    interests = relationship("MenteeInterest", back_populates="mentee", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="mentee", foreign_keys="Session.mentee_id")
    active_matches = relationship("MatchScore", 
                                primaryjoin="and_(Mentee.user_id==MatchScore.mentee_id, "
                                          "MatchScore.status=='active')")
