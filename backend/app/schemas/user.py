from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List, Dict
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    timezone: Optional[str] = None
    languages: Optional[List[str]] = None
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: constr(min_length=8)
    role: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    timezone: Optional[str] = None
    languages: Optional[List[str]] = None
    profile_picture: Optional[str] = None

class MentorProfileBase(BaseModel):
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    company: Optional[str] = None
    position: Optional[str] = None
    linkedin_url: Optional[str] = None
    expertise_areas: Optional[List[str]] = None
    mentoring_experience: Optional[Dict] = None
    max_mentees: Optional[int] = 3
    preferred_mentee_level: Optional[str] = None
    mentoring_style: Optional[str] = None
    session_format: Optional[List[str]] = None

class MentorProfileCreate(MentorProfileBase):
    pass

class MentorProfileUpdate(MentorProfileBase):
    pass

class MenteeProfileBase(BaseModel):
    bio: Optional[str] = None
    goals: Optional[str] = None
    current_position: Optional[str] = None
    linkedin_url: Optional[str] = None
    career_stage: Optional[str] = None
    desired_skills: Optional[List[str]] = None
    learning_style: Optional[str] = None
    commitment_level: Optional[str] = None
    program_duration: Optional[int] = None
    specific_goals: Optional[List[Dict]] = None

class MenteeProfileCreate(MenteeProfileBase):
    pass

class MenteeProfileUpdate(MenteeProfileBase):
    pass

class UserInDB(UserBase):
    id: int
    is_active: bool
    profile_complete: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class MentorProfile(MentorProfileBase):
    user_id: int
    current_mentee_count: int

    class Config:
        orm_mode = True

class MenteeProfile(MenteeProfileBase):
    user_id: int

    class Config:
        orm_mode = True

class UserComplete(UserInDB):
    mentor: Optional[MentorProfile] = None
    mentee: Optional[MenteeProfile] = None
