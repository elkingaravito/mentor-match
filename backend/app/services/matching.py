from sqlalchemy.orm import Session
from app.models.user import User, Mentor, Mentee
from app.models.match_algorithm import MatchScore
from typing import List
import numpy as np

class MatchingService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_skill_match(self, mentor: Mentor, mentee: Mentee) -> float:
        """
        Calcula la compatibilidad de habilidades entre mentor y mentee.
        """
        mentor_skills = set(skill.name for skill in mentor.skills)
        mentee_interests = set(interest.name for interest in mentee.interests)
        
        if not mentor_skills or not mentee_interests:
            return 0.0
        
        matching_skills = mentor_skills.intersection(mentee_interests)
        return len(matching_skills) / max(len(mentor_skills), len(mentee_interests))

    def calculate_availability_match(self, mentor: Mentor, mentee: Mentee) -> float:
        """
        Calcula la compatibilidad de disponibilidad horaria.
        """
        mentor_availability = set(
            (av.day_of_week, av.start_time.hour)
            for av in mentor.user.availability
        )
        mentee_availability = set(
            (av.day_of_week, av.start_time.hour)
            for av in mentee.user.availability
        )
        
        if not mentor_availability or not mentee_availability:
            return 0.0
        
        matching_slots = mentor_availability.intersection(mentee_availability)
        return len(matching_slots) / max(len(mentor_availability), len(mentee_availability))

    def calculate_style_match(self, mentor: Mentor, mentee: Mentee) -> float:
        """
        Calcula la compatibilidad de estilos de mentoría.
        """
        if not mentor.mentoring_style or not mentee.learning_style:
            return 0.5  # valor neutral si no hay preferencias
        
        # Matriz de compatibilidad de estilos
        style_compatibility = {
            "directive": {
                "structured": 0.9,
                "self_directed": 0.3,
                "collaborative": 0.6
            },
            "collaborative": {
                "structured": 0.6,
                "self_directed": 0.8,
                "collaborative": 0.9
            },
            "supportive": {
                "structured": 0.7,
                "self_directed": 0.7,
                "collaborative": 0.8
            }
        }
        
        return style_compatibility.get(mentor.mentoring_style, {}).get(mentee.learning_style, 0.5)

    def calculate_goals_match(self, mentor: Mentor, mentee: Mentee) -> float:
        """
        Calcula la compatibilidad de objetivos.
        """
        if not mentee.specific_goals:
            return 0.5
        
        mentor_expertise = set(mentor.expertise_areas)
        goal_areas = set(goal["category"] for goal in mentee.specific_goals)
        
        if not mentor_expertise or not goal_areas:
            return 0.5
        
        matching_areas = mentor_expertise.intersection(goal_areas)
        return len(matching_areas) / len(goal_areas)

    def get_suggestions(self, user: User, limit: int = 5) -> List[MatchScore]:
        """
        Obtiene sugerencias de matching para un usuario.
        """
        if user.role == "mentor":
            potential_matches = self.db.query(User).join(Mentee).all()
            user_profile = user.mentor
        else:
            potential_matches = self.db.query(User).join(Mentor).all()
            user_profile = user.mentee
        
        match_scores = []
        for potential_match in potential_matches:
            # Evitar matches existentes o rechazados
            existing_match = self.db.query(MatchScore).filter(
                ((MatchScore.mentor_id == user.id) & (MatchScore.mentee_id == potential_match.id)) |
                ((MatchScore.mentor_id == potential_match.id) & (MatchScore.mentee_id == user.id))
            ).first()
            
            if existing_match and existing_match.status in ["active", "rejected"]:
                continue
            
            # Calcular scores
            if user.role == "mentor":
                mentor, mentee = user_profile, potential_match.mentee
            else:
                mentor, mentee = potential_match.mentor, user_profile
            
            skill_score = self.calculate_skill_match(mentor, mentee)
            availability_score = self.calculate_availability_match(mentor, mentee)
            style_score = self.calculate_style_match(mentor, mentee)
            goals_score = self.calculate_goals_match(mentor, mentee)
            
            # Pesos para cada componente
            weights = [0.3, 0.2, 0.2, 0.3]
            total_score = np.average(
                [skill_score, availability_score, style_score, goals_score],
                weights=weights
            )
            
            match_scores.append({
                "mentor_id": mentor.user_id,
                "mentee_id": mentee.user_id,
                "total_score": total_score,
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
                    ))
                },
                "status": "suggested"
            })
        
        # Ordenar por score y limitar resultados
        match_scores.sort(key=lambda x: x["total_score"], reverse=True)
        top_matches = match_scores[:limit]
        
        # Crear registros de MatchScore
        result = []
        for match in top_matches:
            db_match = MatchScore(**match)
            self.db.add(db_match)
            self.db.commit()
            self.db.refresh(db_match)
            result.append(db_match)
        
        return result
