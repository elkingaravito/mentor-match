from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models import Session as SessionModel
from app.models import SessionFeedback, User, Mentor, Mentee, Skill, MentorSkill, MenteeInterest

logger = logging.getLogger(__name__)

class StatisticsService:
    """Service for generating mentoring session statistics."""
    """
    Servicio para generar estadísticas sobre las sesiones de mentoría.
    """
    
    def get_global_statistics(self, db: Session) -> Dict[str, Any]:
        """Get global system statistics."""
        try:
            return {
                "users": self._get_user_counts(db),
                "sessions": self._get_session_counts(db),
                "mentoring_hours": self._get_total_mentoring_hours(db),
                "average_rating": self._get_average_rating(db)
            }
        except SQLAlchemyError as e:
            logger.error(f"Database error in global statistics: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in global statistics: {str(e)}")
            raise

    def _get_user_counts(self, db: Session) -> Dict[str, int]:
        # Total de usuarios
        total_users = db.query(func.count(User.id)).scalar()
        total_mentors = db.query(func.count(Mentor.user_id)).scalar()
        total_mentees = db.query(func.count(Mentee.user_id)).scalar()
        
        # Total de sesiones
        total_sessions = db.query(func.count(Session.id)).scalar()
        completed_sessions = db.query(func.count(Session.id)).filter(Session.status == "completed").scalar()
        cancelled_sessions = db.query(func.count(Session.id)).filter(Session.status == "cancelled").scalar()
        
        # Tiempo total de mentoría (en horas)
        total_hours = db.query(
            func.sum(
                func.extract('epoch', Session.end_time) - func.extract('epoch', Session.start_time)
            ) / 3600
        ).filter(Session.status == "completed").scalar() or 0
        
        # Promedio de calificación de sesiones
        avg_rating = db.query(func.avg(SessionFeedback.rating)).scalar() or 0
        
        return {
            "users": {
                "total": total_users,
                "mentors": total_mentors,
                "mentees": total_mentees
            },
            "sessions": {
                "total": total_sessions,
                "completed": completed_sessions,
                "cancelled": cancelled_sessions,
                "completion_rate": (completed_sessions / total_sessions) if total_sessions > 0 else 0
            },
            "mentoring_hours": round(total_hours, 2),
            "average_rating": round(avg_rating, 2)
        }
    
    @staticmethod
    def get_user_statistics(self, user_id: int, db: Session) -> Dict[str, Any]:
        """Get statistics for a specific user."""
        try:
            user = self._get_user(db, user_id)
            if not user:
                logger.warning(f"User not found: {user_id}")
                return {}

            return {
                **self._get_base_user_stats(user),
                **self._get_session_stats(db, user),
                **self._get_rating_stats(db, user)
            }
        except SQLAlchemyError as e:
            logger.error(f"Database error in user statistics: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in user statistics: {str(e)}")
            raise

    def _get_user(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    def _get_base_user_stats(self, user: User) -> Dict[str, Any]:
        """Get basic user information."""
        return {
            "user_id": user.id,
            "name": user.name,
            "role": user.role,
            "sessions": {
                "total": 0,
                "completed": 0,
                "cancelled": 0,
                "upcoming": 0
            },
            "mentoring_hours": 0,
            "average_rating": 0
        }

    def _get_session_stats(self, db: Session, user: User) -> Dict[str, Any]:
        """Calculate session statistics for a user."""
        id_filter = Session.mentor_id if user.role == "mentor" else Session.mentee_id
        base_query = db.query(Session).filter(id_filter == user.id)
        
        stats = {
            "sessions": {
                "total": base_query.count(),
                "completed": base_query.filter(Session.status == "completed").count(),
                "cancelled": base_query.filter(Session.status == "cancelled").count(),
                "upcoming": base_query.filter(
                    Session.status == "scheduled",
                    Session.start_time > datetime.now()
                ).count()
            }
        }
        
        stats["mentoring_hours"] = self._calculate_mentoring_hours(db, user)
        return stats

    def _calculate_mentoring_hours(self, db: Session, user: User) -> float:
        """Calculate total mentoring hours for a user."""
        id_filter = Session.mentor_id if user.role == "mentor" else Session.mentee_id
        
        total_hours = db.query(
            func.sum(
                func.extract('epoch', Session.end_time) - func.extract('epoch', Session.start_time)
            ) / 3600
        ).filter(
            id_filter == user.id,
            Session.status == "completed"
        ).scalar() or 0
        
        return round(total_hours, 2)

    def _get_rating_stats(self, db: Session, user: User) -> Dict[str, float]:
        """Calculate rating statistics for a user."""
        id_filter = Session.mentor_id if user.role == "mentor" else Session.mentee_id
        
        query = db.query(func.avg(SessionFeedback.rating)).join(Session)
        if user.role == "mentee":
            query = query.filter(
                id_filter == user.id,
                SessionFeedback.created_by == user.id
            )
        else:
            query = query.filter(id_filter == user.id)
            
        avg_rating = query.scalar() or 0
        return {"average_rating": round(avg_rating, 2)}
    
    @staticmethod
    def get_top_mentors(db: Session, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Obtiene los mentores más activos basado en número de sesiones completadas.
        """
        top_mentors = db.query(
            User.id,
            User.name,
            Mentor.position,
            Mentor.company,
            func.count(Session.id).label("session_count"),
            func.avg(SessionFeedback.rating).label("avg_rating")
        ).join(
            Mentor, User.id == Mentor.user_id
        ).outerjoin(
            Session, Mentor.user_id == Session.mentor_id
        ).outerjoin(
            SessionFeedback, Session.id == SessionFeedback.session_id
        ).filter(
            Session.status == "completed"
        ).group_by(
            User.id, User.name, Mentor.position, Mentor.company
        ).order_by(
            func.count(Session.id).desc()
        ).limit(limit).all()
        
        result = []
        for mentor in top_mentors:
            result.append({
                "id": mentor.id,
                "name": mentor.name,
                "position": mentor.position,
                "company": mentor.company,
                "completed_sessions": mentor.session_count,
                "average_rating": round(mentor.avg_rating, 2) if mentor.avg_rating else 0
            })
        
        return result
    
    @staticmethod
    def get_popular_skills(db: Session, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Obtiene las habilidades más populares basado en intereses de mentiles.
        """
        popular_skills = db.query(
            Skill.id,
            Skill.name,
            Skill.category,
            func.count(MenteeInterest.mentee_id).label("interest_count")
        ).join(
            MenteeInterest, Skill.id == MenteeInterest.skill_id
        ).group_by(
            Skill.id, Skill.name, Skill.category
        ).order_by(
            func.count(MenteeInterest.mentee_id).desc()
        ).limit(limit).all()
        
        result = []
        for skill in popular_skills:
            result.append({
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
                "interest_count": skill.interest_count
            })
        
        return result
    
    def get_session_trends(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """Get session trends for the last X days."""
        try:
            start_date = datetime.now() - timedelta(days=days)
            return {
                "by_day": self._get_daily_session_trends(db, start_date),
                "by_status": self._get_status_session_trends(db, start_date),
                "by_hour": self._get_hourly_session_trends(db, start_date),
                "completion_rate": self._get_completion_rate(db, start_date)
            }
        except SQLAlchemyError as e:
            logger.error(f"Database error in session trends: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in session trends: {str(e)}")
            raise

    def _get_daily_session_trends(self, db: Session, start_date: datetime) -> List[Dict[str, Any]]:
        """Get daily session counts."""
        sessions = db.query(
            func.date_trunc('day', Session.start_time).label("day"),
            func.count(Session.id).label("count")
        ).filter(
            Session.start_time >= start_date
        ).group_by(
            func.date_trunc('day', Session.start_time)
        ).order_by(
            func.date_trunc('day', Session.start_time)
        ).all()

        return [
            {"day": day.strftime("%Y-%m-%d"), "count": count}
            for day, count in sessions
        ]

    def _get_status_session_trends(self, db: Session, start_date: datetime) -> List[Dict[str, Any]]:
        """Get session counts by status."""
        sessions = db.query(
            Session.status,
            func.count(Session.id).label("count")
        ).filter(
            Session.start_time >= start_date
        ).group_by(
            Session.status
        ).all()

        return [
            {"status": status, "count": count}
            for status, count in sessions
        ]

    def _get_hourly_session_trends(self, db: Session, start_date: datetime) -> List[Dict[str, Any]]:
        """Get session counts by hour of day."""
        sessions = db.query(
            func.extract('hour', Session.start_time).label("hour"),
            func.count(Session.id).label("count")
        ).filter(
            Session.start_time >= start_date
        ).group_by(
            func.extract('hour', Session.start_time)
        ).order_by(
            func.extract('hour', Session.start_time)
        ).all()

        return [
            {"hour": int(hour), "count": count}
            for hour, count in sessions
        ]

    def _get_completion_rate(self, db: Session, start_date: datetime) -> float:
        """Calculate session completion rate."""
        total = db.query(func.count(Session.id)).filter(
            Session.start_time >= start_date
        ).scalar()

        if not total:
            return 0.0

        completed = db.query(func.count(Session.id)).filter(
            Session.start_time >= start_date,
            Session.status == "completed"
        ).scalar()

        return round(completed / total * 100, 2)
