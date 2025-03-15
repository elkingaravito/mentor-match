from typing import List, Dict, Optional
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.models.user import User, Mentor, Mentee
from app.models.match_algorithm import MatchScore, MatchFeedback
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

class MatchingAlgorithm:
    def __init__(self, db: Session):
        self.db = db
        self.scaler = StandardScaler()

    def _extract_skills_vector(self, skills: List[str], all_skills: List[str]) -> np.ndarray:
        """Convierte una lista de habilidades en un vector binario."""
        return np.array([1 if skill in skills else 0 for skill in all_skills])

    def _calculate_availability_overlap(self, mentor_availability: List[Dict], mentee_availability: List[Dict]) -> float:
        """Calcula el solapamiento de disponibilidad horaria."""
        if not mentor_availability or not mentee_availability:
            return 0.0

        mentor_slots = set()
        mentee_slots = set()

        for slot in mentor_availability:
            start = datetime.fromisoformat(slot["start_time"])
            end = datetime.fromisoformat(slot["end_time"])
            while start < end:
                mentor_slots.add((start.weekday(), start.hour))
                start += timedelta(hours=1)

        for slot in mentee_availability:
            start = datetime.fromisoformat(slot["start_time"])
            end = datetime.fromisoformat(slot["end_time"])
            while start < end:
                mentee_slots.add((start.weekday(), start.hour))
                start += timedelta(hours=1)

        overlap = mentor_slots.intersection(mentee_slots)
        total_slots = mentor_slots.union(mentee_slots)

        return len(overlap) / len(total_slots) if total_slots else 0.0

    def _calculate_experience_match(self, mentor: Mentor, mentee: Mentee) -> float:
        """Calcula la compatibilidad basada en experiencia y objetivos."""
        if not mentor.experience_years or not mentee.career_stage:
            return 0.5

        # Mapeo de etapas de carrera a años de experiencia deseados
        stage_experience_map = {
            "student": (0, 3),
            "early-career": (2, 5),
            "mid-career": (4, 10),
            "senior": (8, float("inf"))
        }

        desired_range = stage_experience_map.get(mentee.career_stage, (0, float("inf")))
        if desired_range[0] <= mentor.experience_years <= (desired_range[1] if desired_range[1] != float("inf") else mentor.experience_years + 1):
            return 1.0
        return 0.5

    def _calculate_style_compatibility(self, mentor_style: str, mentee_style: str) -> float:
        """Calcula la compatibilidad de estilos de mentoría/aprendizaje."""
        compatibility_matrix = {
            "directive": {"structured": 0.9, "self_directed": 0.3, "collaborative": 0.6},
            "collaborative": {"structured": 0.6, "self_directed": 0.8, "collaborative": 0.9},
            "supportive": {"structured": 0.7, "self_directed": 0.7, "collaborative": 0.8}
        }
        return compatibility_matrix.get(mentor_style, {}).get(mentee_style, 0.5)

    def _calculate_goals_alignment(self, mentor: Mentor, mentee: Mentee) -> float:
        """Calcula la alineación entre las áreas de experiencia del mentor y los objetivos del mentee."""
        if not mentor.expertise_areas or not mentee.specific_goals:
            return 0.5

        mentor_areas = set(mentor.expertise_areas)
        mentee_goal_areas = set(goal["category"] for goal in mentee.specific_goals)

        matching_areas = mentor_areas.intersection(mentee_goal_areas)
        return len(matching_areas) / len(mentee_goal_areas)

    def _get_historical_success(self, mentor_id: int) -> float:
        """Obtiene la tasa de éxito histórica del mentor basada en feedback."""
        feedbacks = self.db.query(MatchFeedback).join(MatchScore).filter(
            MatchScore.mentor_id == mentor_id
        ).all()

        if not feedbacks:
            return 0.5

        avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks)
        return avg_rating / 5.0  # Normalizar a escala 0-1

    def _apply_feedback_adjustments(self, base_score: float, mentor_id: int, mentee_id: int) -> float:
        """Ajusta el score basado en feedback histórico y preferencias."""
        historical_success = self._get_historical_success(mentor_id)
        
        # Obtener preferencias de matching previas
        previous_matches = self.db.query(MatchScore).filter(
            ((MatchScore.mentor_id == mentor_id) & (MatchScore.mentee_id == mentee_id)) |
            ((MatchScore.mentor_id == mentee_id) & (MatchScore.mentee_id == mentor_id))
        ).all()

        # Ajustar score basado en matches previos
        if previous_matches:
            rejected_matches = sum(1 for m in previous_matches if m.status == "rejected")
            if rejected_matches > 0:
                base_score *= 0.8 ** rejected_matches

        # Combinar con éxito histórico
        adjusted_score = (base_score * 0.7) + (historical_success * 0.3)
        return min(max(adjusted_score, 0.0), 1.0)

    def generate_matches(self, user: User, limit: int = 5) -> List[Dict]:
        """Genera sugerencias de matching para un usuario."""
        if user.role == "mentor":
            potential_matches = self.db.query(User).join(Mentee).all()
            user_profile = user.mentor
        else:
            potential_matches = self.db.query(User).join(Mentor).all()
            user_profile = user.mentee

        matches = []
        for potential_match in potential_matches:
            # Evitar matches existentes o rechazados
            existing_match = self.db.query(MatchScore).filter(
                ((MatchScore.mentor_id == user.id) & (MatchScore.mentee_id == potential_match.id)) |
                ((MatchScore.mentor_id == potential_match.id) & (MatchScore.mentee_id == user.id))
            ).first()

            if existing_match and existing_match.status in ["active", "rejected"]:
                continue

            # Calcular componentes del score
            if user.role == "mentor":
                mentor, mentee = user_profile, potential_match.mentee
            else:
                mentor, mentee = potential_match.mentor, user_profile

            skill_score = self._calculate_skill_match(mentor, mentee)
            availability_score = self._calculate_availability_overlap(
                mentor.user.availability, mentee.user.availability
            )
            style_score = self._calculate_style_compatibility(
                mentor.mentoring_style, mentee.learning_style
            )
            goals_score = self._calculate_goals_alignment(mentor, mentee)
            experience_score = self._calculate_experience_match(mentor, mentee)

            # Calcular score base
            base_score = np.mean([
                skill_score * 0.3,
                availability_score * 0.2,
                style_score * 0.2,
                goals_score * 0.2,
                experience_score * 0.1
            ])

            # Ajustar score con feedback histórico
            final_score = self._apply_feedback_adjustments(
                base_score, mentor.user_id, mentee.user_id
            )

            matches.append({
                "mentor_id": mentor.user_id,
                "mentee_id": mentee.user_id,
                "total_score": final_score,
                "skill_match_score": skill_score,
                "availability_score": availability_score,
                "style_match_score": style_score,
                "goals_alignment_score": goals_score,
                "match_details": {
                    "matching_skills": list(set(s.name for s in mentor.skills) & 
                                         set(i.name for i in mentee.interests)),
                    "matching_availability": len(set(
                        (av.day_of_week, av.start_time.hour)
                        for av in mentor.user.availability
                    ) & set(
                        (av.day_of_week, av.start_time.hour)
                        for av in mentee.user.availability
                    )),
                    "experience_compatibility": experience_score
                },
                "status": "suggested"
            })

        # Ordenar por score y limitar resultados
        matches.sort(key=lambda x: x["total_score"], reverse=True)
        return matches[:limit]
