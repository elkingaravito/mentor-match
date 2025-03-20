# /Users/apple/Workspace/mentor-match/backend/app/routers/statistics.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, Dict, List
from datetime import datetime, timedelta
from sqlalchemy import func
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.session import Session
from app.models.mentor import MentorSkill
from app.models.mentee import MenteeInterest

router = APIRouter()

@router.get("/user/current", response_model=Dict[str, Any])
async def get_current_user_statistics(
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get statistics for the current user.
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()

    user_id = current_user.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get session statistics
    sessions = db.query(Session).filter(
        ((Session.mentor_id == user_id) | (Session.mentee_id == user_id)) &
        (Session.start_time.between(start_date, end_date))
    ).all()

    total_sessions = len(sessions)
    completed_sessions = len([s for s in sessions if s.status == "completed"])
    total_hours = sum(
        (s.end_time - s.start_time).total_seconds() / 3600 
        for s in sessions if s.status == "completed"
    )

    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "total_hours": round(total_hours, 2),
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    }

@router.get("/platform", response_model=Dict[str, Any])
async def get_platform_statistics(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Get platform-wide statistics.
    """
    # Verificar si el usuario es admin
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view platform statistics"
        )

    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Estadísticas básicas
    total_users = db.query(func.count(User.id)).scalar()
    total_mentors = db.query(func.count(User.id)).filter(User.role == "mentor").scalar()
    total_mentees = db.query(func.count(User.id)).filter(User.role == "mentee").scalar()
    
    # Estadísticas de sesiones
    sessions = db.query(Session).filter(
        Session.start_time.between(start_date, end_date)
    ).all()
    
    total_sessions = len(sessions)
    completed_sessions = len([s for s in sessions if s.status == "completed"])
    total_hours = sum(
        (s.end_time - s.start_time).total_seconds() / 3600 
        for s in sessions if s.status == "completed"
    )
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "users": {
            "total": total_users,
            "mentors": total_mentors,
            "mentees": total_mentees
        },
        "sessions": {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "total_hours": round(total_hours, 2)
        }
    }

@router.get("/top-mentors", response_model=List[Dict[str, Any]])
async def get_top_mentors(
    limit: int = 10,
    db: Session = Depends(get_db)
) -> List[Dict]:
    """
    Get top performing mentors based on completed sessions.
    """
    top_mentors = db.query(
        User,
        func.count(Session.id).label("total_sessions"),
        func.count(Session.id).filter(Session.status == "completed").label("completed_sessions")
    ).join(
        Session, User.id == Session.mentor_id
    ).filter(
        User.role == "mentor"
    ).group_by(
        User.id
    ).order_by(
        func.count(Session.id).filter(Session.status == "completed").desc()
    ).limit(limit).all()
    
    return [{
        "id": mentor.User.id,
        "name": mentor.User.name,
        "total_sessions": mentor.total_sessions,
        "completed_sessions": mentor.completed_sessions,
        "completion_rate": round(mentor.completed_sessions / mentor.total_sessions * 100, 2) if mentor.total_sessions > 0 else 0
    } for mentor in top_mentors]