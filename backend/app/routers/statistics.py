from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, Dict, List
from datetime import datetime, timedelta
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.statistics import SessionStatistics, MentorshipMetrics, PlatformStatistics
from app.models.match_algorithm import MatchScore

router = APIRouter()

@router.get("/platform")
def get_platform_statistics(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get platform-wide statistics.
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Estadísticas básicas
    total_users = db.query(func.count(User.id)).scalar()
    total_mentors = db.query(func.count(User.id)).filter(User.role == "mentor").scalar()
    total_mentees = db.query(func.count(User.id)).filter(User.role == "mentee").scalar()
    
    # Estadísticas de matching
    matches = db.query(MatchScore).filter(
        MatchScore.created_at.between(start_date, end_date)
    ).all()
    
    total_matches = len(matches)
    successful_matches = len([m for m in matches if m.status == "active"])
    match_rate = successful_matches / total_matches if total_matches > 0 else 0
    
    # Estadísticas de sesiones
    sessions = db.query(SessionStatistics).filter(
        SessionStatistics.start_time.between(start_date, end_date)
    ).all()
    
    total_sessions = len(sessions)
    total_hours = sum(s.actual_duration for s in sessions) / 60  # convertir a horas
    avg_session_duration = total_hours / total_sessions if total_sessions > 0 else 0
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "users": {
            "total": total_users,
            "mentors": total_mentors,
            "mentees": total_mentees
        },
        "matching": {
            "total_matches": total_matches,
            "successful_matches": successful_matches,
            "match_rate": match_rate
        },
        "sessions": {
            "total_sessions": total_sessions,
            "total_hours": total_hours,
            "avg_session_duration": avg_session_duration
        }
    }

@router.get("/user/{user_id}")
def get_user_statistics(
    user_id: int,
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get statistics for a specific user.
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar permisos
    if current_user["user_id"] != user_id and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Obtener métricas de mentoría
    metrics = db.query(MentorshipMetrics).filter(
        (MentorshipMetrics.mentor_id == user_id) |
        (MentorshipMetrics.mentee_id == user_id)
    ).first()
    
    # Obtener estadísticas de sesiones
    sessions = db.query(SessionStatistics).join(Session).filter(
        ((Session.mentor_id == user_id) | (Session.mentee_id == user_id)) &
        (SessionStatistics.start_time.between(start_date, end_date))
    ).all()
    
    total_sessions = len(sessions)
    completed_sessions = len([s for s in sessions if s.mentor_attended and s.mentee_attended])
    total_hours = sum(s.actual_duration for s in sessions) / 60
    
    return {
        "user_id": user_id,
        "role": user.role,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "sessions": {
            "total": total_sessions,
            "completed": completed_sessions,
            "total_hours": total_hours,
            "attendance_rate": completed_sessions / total_sessions if total_sessions > 0 else 0
        },
        "metrics": {
            "goals_completed": metrics.goals_completed if metrics else 0,
            "skills_improved": metrics.skills_improved if metrics else [],
            "satisfaction_score": metrics.satisfaction_score if metrics else 0
        }
    }

@router.get("/top-mentors")
def get_top_mentors(
    limit: int = 10,
    db: Session = Depends(get_db)
) -> List[Dict]:
    """
    Get top performing mentors based on various metrics.
    """
    mentors = db.query(
        User,
        func.count(SessionStatistics.id).label("total_sessions"),
        func.avg(SessionStatistics.engagement_score).label("avg_engagement"),
        func.count(MentorshipMetrics.goals_completed).label("goals_completed")
    ).join(Mentor).join(Session).join(SessionStatistics).join(MentorshipMetrics).group_by(
        User.id
    ).order_by(
        func.avg(SessionStatistics.engagement_score).desc()
    ).limit(limit).all()
    
    return [{
        "id": mentor.User.id,
        "name": mentor.User.name,
        "total_sessions": mentor.total_sessions,
        "avg_engagement": float(mentor.avg_engagement),
        "goals_completed": mentor.goals_completed
    } for mentor in mentors]

@router.get("/popular-topics")
def get_popular_topics(
    start_date: datetime = None,
    end_date: datetime = None,
    limit: int = 10,
    db: Session = Depends(get_db)
) -> List[Dict]:
    """
    Get most popular mentoring topics/skills.
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Análisis de skills más solicitados
    skills = db.query(
        MentorSkill.name,
        func.count(MenteeInterest.id).label("interest_count")
    ).join(
        MenteeInterest, MentorSkill.name == MenteeInterest.name
    ).group_by(
        MentorSkill.name
    ).order_by(
        func.count(MenteeInterest.id).desc()
    ).limit(limit).all()
    
    return [{
        "topic": skill.name,
        "interest_count": skill.interest_count,
    } for skill in skills]
