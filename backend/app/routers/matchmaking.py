from typing import Any, List, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Mentor, Mentee
from app.services.matchmaking import MatchmakingService

router = APIRouter()

@router.get("/mentee/{mentee_id}", response_model=List[Dict[str, Any]])
def find_matches_for_mentee(
    mentee_id: int, limit: int = 5, db: Session = Depends(get_db)
) -> Any:
    """
    Find the best mentor matches for a mentee.
    """
    mentee = db.query(Mentee).filter(Mentee.user_id == mentee_id).first()
    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentee not found",
        )
    
    matches = MatchmakingService.find_matches_for_mentee(mentee_id, db, limit)
    return matches

@router.get("/mentor/{mentor_id}", response_model=List[Dict[str, Any]])
def find_matches_for_mentor(
    mentor_id: int, limit: int = 5, db: Session = Depends(get_db)
) -> Any:
    """
    Find the best mentee matches for a mentor.
    """
    mentor = db.query(Mentor).filter(Mentor.user_id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found",
        )
    
    matches = MatchmakingService.find_matches_for_mentor(mentor_id, db, limit)
    return matches
