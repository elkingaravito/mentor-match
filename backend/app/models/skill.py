from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # 'technical', 'soft', 'business', etc.

    # Relaciones
    mentor_skills = relationship("MentorSkill", back_populates="skill")
    mentee_interests = relationship("MenteeInterest", back_populates="skill")

class MentorSkill(Base):
    __tablename__ = "mentor_skills"

    mentor_id = Column(Integer, ForeignKey("mentors.user_id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    proficiency_level = Column(Integer, nullable=False)  # 1-5

    # Relaciones
    mentor = relationship("Mentor", back_populates="skills")
    skill = relationship("Skill", back_populates="mentor_skills")

class MenteeInterest(Base):
    __tablename__ = "mentee_interests"

    mentee_id = Column(Integer, ForeignKey("mentees.user_id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    interest_level = Column(Integer, nullable=False)  # 1-5

    # Relaciones
    mentee = relationship("Mentee", back_populates="interests")
    skill = relationship("Skill", back_populates="mentee_interests")
