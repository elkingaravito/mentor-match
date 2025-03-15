from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.match_algorithm import MatchScore, MatchFeedback
from app.models.user import User, Mentor, Mentee
from datetime import datetime, timedelta
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class FeedbackAnalysisService:
    def __init__(self, db: Session):
        self.db = db
        self.vectorizer = TfidfVectorizer()

    def analyze_mentor_performance(self, mentor_id: int) -> Dict:
        """Analiza el rendimiento histórico de un mentor."""
        matches = self.db.query(MatchScore).filter(
            MatchScore.mentor_id == mentor_id
        ).all()

        feedbacks = self.db.query(MatchFeedback).join(MatchScore).filter(
            MatchScore.mentor_id == mentor_id
        ).all()

        total_matches = len(matches)
        active_matches = sum(1 for m in matches if m.status == "active")
        completed_matches = sum(1 for m in matches if m.status == "completed")
        avg_rating = np.mean([f.rating for f in feedbacks]) if feedbacks else 0

        # Análisis de feedback textual
        feedback_texts = [f.feedback for f in feedbacks if f.feedback]
        common_themes = self._analyze_feedback_themes(feedback_texts) if feedback_texts else []

        return {
            "total_matches": total_matches,
            "active_matches": active_matches,
            "completed_matches": completed_matches,
            "success_rate": completed_matches / total_matches if total_matches > 0 else 0,
            "average_rating": avg_rating,
            "common_themes": common_themes,
            "strengths": self._identify_strengths(feedbacks),
            "areas_for_improvement": self._identify_improvements(feedbacks)
        }

    def _analyze_feedback_themes(self, feedback_texts: List[str]) -> List[Dict]:
        """Analiza temas comunes en el feedback usando TF-IDF."""
        if not feedback_texts:
            return []

        # Vectorizar el texto
        tfidf_matrix = self.vectorizer.fit_transform(feedback_texts)
        feature_names = self.vectorizer.get_feature_names_out()

        # Identificar términos más relevantes
        importance = np.asarray(tfidf_matrix.sum(axis=0)).ravel()
        top_indices = importance.argsort()[-5:][::-1]  # Top 5 términos

        return [
            {"term": feature_names[i], "importance": float(importance[i])}
            for i in top_indices
        ]

    def _identify_strengths(self, feedbacks: List[MatchFeedback]) -> List[Dict]:
        """Identifica puntos fuertes basados en feedback positivo."""
        positive_feedbacks = [f for f in feedbacks if f.rating >= 4]
        return self._analyze_feedback_themes([f.feedback for f in positive_feedbacks if f.feedback])

    def _identify_improvements(self, feedbacks: List[MatchFeedback]) -> List[Dict]:
        """Identifica áreas de mejora basadas en feedback negativo."""
        negative_feedbacks = [f for f in feedbacks if f.rating <= 3]
        return self._analyze_feedback_themes([f.feedback for f in negative_feedbacks if f.feedback])

    def get_matching_insights(self, user_id: int) -> Dict:
        """Obtiene insights sobre los matches exitosos para un usuario."""
        user = self.db.query(User).get(user_id)
        matches = self.db.query(MatchScore).filter(
            ((MatchScore.mentor_id == user_id) | (MatchScore.mentee_id == user_id)) &
            (MatchScore.status.in_(["completed", "active"]))
        ).all()

        successful_matches = []
        for match in matches:
            feedback = self.db.query(MatchFeedback).filter(
                MatchFeedback.match_id == match.id
            ).first()

            if feedback and feedback.rating >= 4:
                successful_matches.append({
                    "match_id": match.id,
                    "skill_match_score": match.skill_match_score,
                    "availability_score": match.availability_score,
                    "style_match_score": match.style_match_score,
                    "goals_alignment_score": match.goals_alignment_score
                })

        if not successful_matches:
            return {
                "message": "No hay suficientes datos para generar insights",
                "recommendations": []
            }

        # Analizar patrones en matches exitosos
        avg_scores = {
            "skill_match": np.mean([m["skill_match_score"] for m in successful_matches]),
            "availability": np.mean([m["availability_score"] for m in successful_matches]),
            "style_match": np.mean([m["style_match_score"] for m in successful_matches]),
            "goals_alignment": np.mean([m["goals_alignment_score"] for m in successful_matches])
        }

        recommendations = []
        if user.role == "mentor":
            if avg_scores["skill_match"] > 0.8:
                recommendations.append(
                    "Sus matches más exitosos son con mentees que buscan sus habilidades principales"
                )
            if avg_scores["availability"] > 0.7:
                recommendations.append(
                    "La flexibilidad en su horario contribuye significativamente al éxito de las mentorías"
                )
        else:
            if avg_scores["goals_alignment"] > 0.8:
                recommendations.append(
                    "Los mejores resultados se obtienen cuando hay clara alineación con los objetivos del mentor"
                )

        return {
            "success_patterns": avg_scores,
            "recommendations": recommendations
        }

    def update_matching_weights(self, user_id: int) -> Dict[str, float]:
        """Actualiza los pesos del algoritmo de matching basado en feedback histórico."""
        insights = self.get_matching_insights(user_id)
        
        if "success_patterns" not in insights:
            return {
                "skill_weight": 0.3,
                "availability_weight": 0.2,
                "style_weight": 0.2,
                "goals_weight": 0.3
            }

        patterns = insights["success_patterns"]
        total = sum(patterns.values())
        
        if total == 0:
            return {
                "skill_weight": 0.3,
                "availability_weight": 0.2,
                "style_weight": 0.2,
                "goals_weight": 0.3
            }

        # Normalizar los pesos
        weights = {
            "skill_weight": patterns["skill_match"] / total,
            "availability_weight": patterns["availability"] / total,
            "style_weight": patterns["style_match"] / total,
            "goals_weight": patterns["goals_alignment"] / total
        }

        return weights
