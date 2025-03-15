from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.match_algorithm import MatchScore, MatchPreference, MatchFeedback
from app.schemas.matching import (
    MatchPreferenceCreate, MatchPreferenceUpdate,
    MatchScoreCreate, MatchScore as MatchScoreSchema,
    MatchFeedbackCreate, MatchFeedback as MatchFeedbackSchema
)
from app.services.matching import MatchingService

router = APIRouter()

@router.post("/preferences", response_model=MatchPreferenceCreate)
def create_match_preferences(
    preferences: MatchPreferenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create matching preferences for current user.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_preferences = MatchPreference(user_id=user.id, **preferences.dict())
    db.add(db_preferences)
    db.commit()
    db.refresh(db_preferences)
    return db_preferences

@router.put("/preferences", response_model=MatchPreferenceUpdate)
def update_match_preferences(
    preferences: MatchPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update matching preferences for current user.
    """
    user_preferences = db.query(MatchPreference).filter(
        MatchPreference.user_id == current_user["user_id"]
    ).first()
    
    if not user_preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")
    
    for field, value in preferences.dict(exclude_unset=True).items():
        setattr(user_preferences, field, value)
    
    db.commit()
    db.refresh(user_preferences)
    return user_preferences

@router.get("/suggestions", response_model=List[MatchScoreSchema])
def get_match_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get match suggestions for current user.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    matching_service = MatchingService(db)
    matches = matching_service.get_suggestions(user)
    return matches

@router.post("/accept/{match_id}", response_model=MatchScoreSchema)
def accept_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Accept a match suggestion.
    """
    match = db.query(MatchScore).filter(MatchScore.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Verificar que el usuario es parte del match
    if current_user["user_id"] not in [match.mentor_id, match.mentee_id]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    match.status = "accepted"
    db.commit()
    db.refresh(match)
    return match

@router.post("/reject/{match_id}", response_model=MatchScoreSchema)
def reject_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Reject a match suggestion.
    """
    match = db.query(MatchScore).filter(MatchScore.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Verificar que el usuario es parte del match
    if current_user["user_id"] not in [match.mentor_id, match.mentee_id]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    match.status = "rejected"
    db.commit()
    db.refresh(match)
    return match

@router.post("/feedback", response_model=MatchFeedbackSchema)
def create_match_feedback(
    feedback: MatchFeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create feedback for a match.
    """
    match = db.query(MatchScore).filter(MatchScore.id == feedback.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Verificar que el usuario es parte del match
    if current_user["user_id"] not in [match.mentor_id, match.mentee_id]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_feedback = MatchFeedback(
        user_id=current_user["user_id"],
        **feedback.dict()
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback
