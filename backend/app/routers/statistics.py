from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User
from app.services.statistics import StatisticsService

router = APIRouter()

@router.get("/global", response_model=Dict[str, Any])
def get_global_statistics(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get global statistics for the platform.
    """
    stats = StatisticsService.get_global_statistics(db)
    return stats

@router.get("/user/{user_id}", response_model=Dict[str, Any])
def get_user_statistics(
    user_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Get statistics for a specific user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    stats = StatisticsService.get_user_statistics(user_id, db)
    return stats

@router.get("/top-mentors", response_model=List[Dict[str, Any]])
def get_top_mentors(
    limit: int = 5, db: Session = Depends(get_db)
) -> Any:
    """
    Get the top mentors based on number of completed sessions.
    """
    top_mentors = StatisticsService.get_top_mentors(db, limit)
    return top_mentors

@router.get("/popular-skills", response_model=List[Dict[str, Any]])
def get_popular_skills(
    limit: int = 5, db: Session = Depends(get_db)
) -> Any:
    """
    Get the most popular skills based on mentee interests.
    """
    popular_skills = StatisticsService.get_popular_skills(db, limit)
    return popular_skills

@router.get("/session-trends", response_model=Dict[str, Any])
def get_session_trends(
    days: int = 30, db: Session = Depends(get_db)
) -> Any:
    """
    Get session trends for the last X days.
    """
    trends = StatisticsService.get_session_trends(db, days)
    return trends
