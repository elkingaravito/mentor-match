from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_, case
from sqlalchemy.orm import Session
from app.models.session import Session
from app.models.user import User, Mentor, Mentee
from app.models.match_algorithm import MatchScore, MatchFeedback
import pandas as pd
import numpy as np

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_platform_metrics(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict:
        """Obtiene métricas generales de la plataforma."""
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()

        # Métricas de usuarios
        total_users = self.db.query(func.count(User.id)).scalar()
        active_mentors = self.db.query(func.count(Mentor.user_id)).scalar()
        active_mentees = self.db.query(func.count(Mentee.user_id)).scalar()

        # Métricas de sesiones
        sessions_query = self.db.query(Session).filter(
            Session.start_time.between(start_date, end_date)
        )
        
        total_sessions = sessions_query.count()
        completed_sessions = sessions_query.filter(Session.status == "completed").count()
        cancelled_sessions = sessions_query.filter(Session.status == "cancelled").count()
        
        # Calcular duración promedio de sesiones
        completed_sessions_data = sessions_query.filter(Session.status == "completed").all()
        if completed_sessions_data:
            avg_duration = sum(
                (session.end_time - session.start_time).total_seconds() / 3600
                for session in completed_sessions_data
            ) / len(completed_sessions_data)
        else:
            avg_duration = 0

        # Métricas de matching
        matches_query = self.db.query(MatchScore).filter(
            MatchScore.created_at.between(start_date, end_date)
        )
        
        total_matches = matches_query.count()
        successful_matches = matches_query.filter(MatchScore.status == "active").count()
        match_success_rate = successful_matches / total_matches if total_matches > 0 else 0

        return {
            "users": {
                "total": total_users,
                "active_mentors": active_mentors,
                "active_mentees": active_mentees,
                "mentor_mentee_ratio": active_mentors / active_mentees if active_mentees > 0 else 0
            },
            "sessions": {
                "total": total_sessions,
                "completed": completed_sessions,
                "cancelled": cancelled_sessions,
                "completion_rate": completed_sessions / total_sessions if total_sessions > 0 else 0,
                "avg_duration": avg_duration
            },
            "matching": {
                "total_matches": total_matches,
                "successful_matches": successful_matches,
                "success_rate": match_success_rate
            },
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }

    def get_user_engagement_metrics(self, user_id: int) -> Dict:
        """Obtiene métricas de engagement para un usuario específico."""
        user = self.db.query(User).get(user_id)
        if not user:
            return {}

        # Sesiones del usuario
        sessions = self.db.query(Session).filter(
            or_(Session.mentor_id == user_id, Session.mentee_id == user_id)
        ).all()

        # Calcular métricas
        total_sessions = len(sessions)
        completed_sessions = sum(1 for s in sessions if s.status == "completed")
        cancelled_sessions = sum(1 for s in sessions if s.status == "cancelled")
        total_hours = sum(
            (s.end_time - s.start_time).total_seconds() / 3600
            for s in sessions if s.status == "completed"
        )

        # Feedback recibido
        feedback_received = self.db.query(MatchFeedback).join(MatchScore).filter(
            or_(MatchScore.mentor_id == user_id, MatchScore.mentee_id == user_id)
        ).all()

        avg_rating = sum(f.rating for f in feedback_received) / len(feedback_received) if feedback_received else 0

        return {
            "sessions": {
                "total": total_sessions,
                "completed": completed_sessions,
                "cancelled": cancelled_sessions,
                "completion_rate": completed_sessions / total_sessions if total_sessions > 0 else 0,
                "total_hours": total_hours
            },
            "feedback": {
                "average_rating": avg_rating,
                "total_feedback": len(feedback_received)
            },
            "engagement_score": self._calculate_engagement_score(
                total_sessions,
                completed_sessions,
                cancelled_sessions,
                avg_rating
            )
        }

    def get_trending_topics(self) -> List[Dict]:
        """Identifica los temas más populares en las mentorías."""
        # Obtener todas las sesiones completadas con sus temas
        sessions = self.db.query(Session).filter(Session.status == "completed").all()
        
        # Extraer y contar temas
        topics = {}
        for session in sessions:
            session_topics = session.topics if hasattr(session, 'topics') else []
            for topic in session_topics:
                topics[topic] = topics.get(topic, 0) + 1

        # Ordenar por popularidad
        sorted_topics = sorted(topics.items(), key=lambda x: x[1], reverse=True)
        
        return [
            {"topic": topic, "count": count, "percentage": count / len(sessions) * 100}
            for topic, count in sorted_topics[:10]
        ]

    def get_success_factors(self) -> Dict:
        """Analiza factores que contribuyen al éxito de las mentorías."""
        # Obtener matches exitosos y no exitosos
        successful_matches = self.db.query(MatchScore).filter(MatchScore.status == "active").all()
        unsuccessful_matches = self.db.query(MatchScore).filter(MatchScore.status == "rejected").all()

        # Crear DataFrames para análisis
        successful_df = pd.DataFrame([{
            'skill_match': m.skill_match_score,
            'availability': m.availability_score,
            'style_match': m.style_match_score,
            'goals_alignment': m.goals_alignment_score,
            'success': 1
        } for m in successful_matches])

        unsuccessful_df = pd.DataFrame([{
            'skill_match': m.skill_match_score,
            'availability': m.availability_score,
            'style_match': m.style_match_score,
            'goals_alignment': m.goals_alignment_score,
            'success': 0
        } for m in unsuccessful_matches])

        df = pd.concat([successful_df, unsuccessful_df])

        # Calcular correlaciones con el éxito
        correlations = df.corr()['success'].drop('success')

        return {
            "success_factors": {
                factor: {
                    "correlation": corr,
                    "importance": abs(corr) / sum(abs(correlations))
                }
                for factor, corr in correlations.items()
            },
            "recommendations": self._generate_recommendations(correlations)
        }

    def _calculate_engagement_score(
        self,
        total_sessions: int,
        completed_sessions: int,
        cancelled_sessions: int,
        avg_rating: float
    ) -> float:
        """Calcula un score de engagement basado en varios factores."""
        if total_sessions == 0:
            return 0

        completion_rate = completed_sessions / total_sessions
        cancellation_penalty = cancelled_sessions / total_sessions
        rating_factor = avg_rating / 5.0

        # Pesos para cada factor
        weights = {
            "completion_rate": 0.4,
            "cancellation_penalty": 0.3,
            "rating_factor": 0.3
        }

        score = (
            completion_rate * weights["completion_rate"] +
            (1 - cancellation_penalty) * weights["cancellation_penalty"] +
            rating_factor * weights["rating_factor"]
        )

        return min(max(score, 0), 1)  # Normalizar entre 0 y 1

    def _generate_recommendations(self, correlations: pd.Series) -> List[str]:
        """Genera recomendaciones basadas en el análisis de correlaciones."""
        recommendations = []
        
        # Ordenar factores por importancia
        sorted_factors = correlations.abs().sort_values(ascending=False)

        for factor, correlation in sorted_factors.items():
            if correlation > 0.3:
                recommendations.append(
                    f"Aumentar el énfasis en {factor} podría mejorar el éxito de los matches"
                )
            elif correlation < -0.3:
                recommendations.append(
                    f"Reducir la dependencia en {factor} podría ser beneficioso"
                )

        return recommendations
