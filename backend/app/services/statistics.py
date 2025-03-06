from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session

from app.models import Session, SessionFeedback, User, Mentor, Mentee, Skill, MentorSkill, MenteeInterest

class StatisticsService:
    """
    Servicio para generar estadísticas sobre las sesiones de mentoría.
    """
    
    @staticmethod
    def get_global_statistics(db: Session) -> Dict[str, Any]:
        """
        Obtiene estadísticas globales del sistema.
        """
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
    def get_user_statistics(user_id: int, db: Session) -> Dict[str, Any]:
        """
        Obtiene estadísticas para un usuario específico.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        result = {
            "user_id": user_id,
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
        
        # Estadísticas específicas según el rol
        if user.role == "mentor":
            # Total de sesiones
            total_sessions = db.query(func.count(Session.id)).filter(Session.mentor_id == user_id).scalar()
            completed_sessions = db.query(func.count(Session.id)).filter(
                Session.mentor_id == user_id,
                Session.status == "completed"
            ).scalar()
            cancelled_sessions = db.query(func.count(Session.id)).filter(
                Session.mentor_id == user_id,
                Session.status == "cancelled"
            ).scalar()
            upcoming_sessions = db.query(func.count(Session.id)).filter(
                Session.mentor_id == user_id,
                Session.status == "scheduled",
                Session.start_time > datetime.now()
            ).scalar()
            
            # Tiempo total de mentoría (en horas)
            total_hours = db.query(
                func.sum(
                    func.extract('epoch', Session.end_time) - func.extract('epoch', Session.start_time)
                ) / 3600
            ).filter(
                Session.mentor_id == user_id,
                Session.status == "completed"
            ).scalar() or 0
            
            # Promedio de calificación de sesiones
            avg_rating = db.query(func.avg(SessionFeedback.rating)).join(Session).filter(
                Session.mentor_id == user_id
            ).scalar() or 0
            
            result["sessions"]["total"] = total_sessions
            result["sessions"]["completed"] = completed_sessions
            result["sessions"]["cancelled"] = cancelled_sessions
            result["sessions"]["upcoming"] = upcoming_sessions
            result["mentoring_hours"] = round(total_hours, 2)
            result["average_rating"] = round(avg_rating, 2)
            
        elif user.role == "mentee":
            # Total de sesiones
            total_sessions = db.query(func.count(Session.id)).filter(Session.mentee_id == user_id).scalar()
            completed_sessions = db.query(func.count(Session.id)).filter(
                Session.mentee_id == user_id,
                Session.status == "completed"
            ).scalar()
            cancelled_sessions = db.query(func.count(Session.id)).filter(
                Session.mentee_id == user_id,
                Session.status == "cancelled"
            ).scalar()
            upcoming_sessions = db.query(func.count(Session.id)).filter(
                Session.mentee_id == user_id,
                Session.status == "scheduled",
                Session.start_time > datetime.now()
            ).scalar()
            
            # Tiempo total de mentoría (en horas)
            total_hours = db.query(
                func.sum(
                    func.extract('epoch', Session.end_time) - func.extract('epoch', Session.start_time)
                ) / 3600
            ).filter(
                Session.mentee_id == user_id,
                Session.status == "completed"
            ).scalar() or 0
            
            # Promedio de calificación de sesiones
            avg_rating = db.query(func.avg(SessionFeedback.rating)).join(Session).filter(
                Session.mentee_id == user_id,
                SessionFeedback.created_by == user_id
            ).scalar() or 0
            
            result["sessions"]["total"] = total_sessions
            result["sessions"]["completed"] = completed_sessions
            result["sessions"]["cancelled"] = cancelled_sessions
            result["sessions"]["upcoming"] = upcoming_sessions
            result["mentoring_hours"] = round(total_hours, 2)
            result["average_rating"] = round(avg_rating, 2)
        
        return result
    
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
    
    @staticmethod
    def get_session_trends(db: Session, days: int = 30) -> Dict[str, Any]:
        """
        Obtiene tendencias de sesiones en los últimos X días.
        """
        start_date = datetime.now() - timedelta(days=days)
        
        # Sesiones por día
        sessions_by_day = db.query(
            func.date_trunc('day', Session.start_time).label("day"),
            func.count(Session.id).label("count")
        ).filter(
            Session.start_time >= start_date
        ).group_by(
            func.date_trunc('day', Session.start_time)
        ).order_by(
            func.date_trunc('day', Session.start_time)
        ).all()
        
        # Sesiones por estado
        sessions_by_status = db.query(
            Session.status,
            func.count(Session.id).label("count")
        ).filter(
            Session.start_time >= start_date
        ).group_by(
            Session.status
        ).all()
        
        # Formatear resultados
        days_data = []
        for day_data in sessions_by_day:
            days_data.append({
                "day": day_data.day.strftime("%Y-%m-%d"),
                "count": day_data.count
            })
        
        status_data = []
        for status_data in sessions_by_status:
            status_data.append({
                "status": status_data.status,
                "count": status_data.count
            })
        
        return {
            "by_day": days_data,
            "by_status": status_data
        }
