from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class MatchPreferenceBase(BaseModel):
    skill_weight: Optional[float] = 0.3
    availability_weight: Optional[float] = 0.2
    style_weight: Optional[float] = 0.2
    goals_weight: Optional[float] = 0.3
    preferred_meeting_frequency: Optional[int] = None
    preferred_session_duration: Optional[int] = None
    timezone: Optional[str] = None
    language_preferences: Optional[List[str]] = None
    industry_preferences: Optional[List[str]] = None
    custom_criteria: Optional[Dict] = None
    exclusions: Optional[Dict] = None

class MatchPreferenceCreate(MatchPreferenceBase):
    pass

class MatchPreferenceUpdate(MatchPreferenceBase):
    pass

class MatchScoreBase(BaseModel):
    mentor_id: int
    mentee_id: int
    total_score: float
    skill_match_score: float
    availability_score: float
    style_match_score: float
    goals_alignment_score: float
    match_details: Dict
    status: str

class MatchScoreCreate(MatchScoreBase):
    pass

class MatchScoreUpdate(BaseModel):
    status: Optional[str] = None
    match_details: Optional[Dict] = None

class MatchScore(MatchScoreBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class MatchFeedbackBase(BaseModel):
    rating: int
    feedback: Optional[str] = None
    suggestions: Optional[str] = None

class MatchFeedbackCreate(MatchFeedbackBase):
    match_id: int
    user_id: int

class MatchFeedback(MatchFeedbackBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
