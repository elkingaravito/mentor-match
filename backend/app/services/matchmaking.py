from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Mentor, Mentee, MentorSkill, MenteeInterest, Availability, User

class MatchmakingService:
    """
    Servicio para emparejar mentores y mentiles basado en compatibilidad de perfiles y disponibilidad.
    """
    
    @staticmethod
    def calculate_profile_compatibility(mentor_id: int, mentee_id: int, db: Session) -> float:
        """
        Calcula la compatibilidad entre un mentor y un mentil basado en sus habilidades e intereses.
        Retorna un valor entre 0 y 1, donde 1 es la máxima compatibilidad.
        """
        # Obtener habilidades del mentor
        mentor_skills = db.query(MentorSkill).filter(MentorSkill.mentor_id == mentor_id).all()
        mentor_skill_dict = {skill.skill_id: skill.proficiency_level for skill in mentor_skills}
        
        # Obtener intereses del mentil
        mentee_interests = db.query(MenteeInterest).filter(MenteeInterest.mentee_id == mentee_id).all()
        mentee_interest_dict = {interest.skill_id: interest.interest_level for interest in mentee_interests}
        
        # Si no hay habilidades o intereses, la compatibilidad es 0
        if not mentor_skill_dict or not mentee_interest_dict:
            return 0.0
        
        # Calcular compatibilidad basada en habilidades e intereses coincidentes
        total_score = 0
        max_possible_score = 0
        
        # Para cada interés del mentil, verificar si el mentor tiene la habilidad
        for skill_id, interest_level in mentee_interest_dict.items():
            max_possible_score += interest_level * 5  # 5 es el nivel máximo de habilidad
            
            if skill_id in mentor_skill_dict:
                mentor_level = mentor_skill_dict[skill_id]
                # La puntuación es el producto del nivel de interés y el nivel de habilidad
                total_score += interest_level * mentor_level
        
        # Normalizar la puntuación a un valor entre 0 y 1
        if max_possible_score == 0:
            return 0.0
        
        return total_score / max_possible_score
    
    @staticmethod
    def check_schedule_compatibility(mentor_id: int, mentee_id: int, db: Session) -> float:
        """
        Verifica la compatibilidad de horarios entre un mentor y un mentil.
        Retorna un valor entre 0 y 1, donde 1 significa que tienen muchos horarios compatibles.
        """
        # Obtener disponibilidad del mentor
        mentor_availability = db.query(Availability).join(User).join(Mentor).filter(Mentor.user_id == mentor_id).all()
        
        # Obtener disponibilidad del mentil
        mentee_availability = db.query(Availability).join(User).join(Mentee).filter(Mentee.user_id == mentee_id).all()
        
        # Si alguno no tiene disponibilidad, la compatibilidad es 0
        if not mentor_availability or not mentee_availability:
            return 0.0
        
        # Contar cuántos slots de tiempo se solapan
        overlapping_slots = 0
        total_slots = len(mentor_availability) * len(mentee_availability)
        
        for mentor_slot in mentor_availability:
            for mentee_slot in mentee_availability:
                # Verificar si los días coinciden
                if mentor_slot.day_of_week == mentee_slot.day_of_week:
                    # Convertir horas a minutos para facilitar la comparación
                    mentor_start = MatchmakingService._time_to_minutes(mentor_slot.start_time)
                    mentor_end = MatchmakingService._time_to_minutes(mentor_slot.end_time)
                    mentee_start = MatchmakingService._time_to_minutes(mentee_slot.start_time)
                    mentee_end = MatchmakingService._time_to_minutes(mentee_slot.end_time)
                    
                    # Verificar si hay solapamiento
                    if max(mentor_start, mentee_start) < min(mentor_end, mentee_end):
                        overlapping_slots += 1
        
        # Normalizar el resultado
        if total_slots == 0:
            return 0.0
        
        return overlapping_slots / min(len(mentor_availability), len(mentee_availability))
    
    @staticmethod
    def _time_to_minutes(time_str: str) -> int:
        """Convierte una hora en formato HH:MM a minutos desde medianoche."""
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes
    
    @staticmethod
    def find_matches_for_mentee(mentee_id: int, db: Session, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Encuentra los mejores mentores para un mentil específico.
        Retorna una lista de diccionarios con información del mentor y puntuación de compatibilidad.
        """
        # Obtener todos los mentores
        mentors = db.query(Mentor).all()
        
        matches = []
        for mentor in mentors:
            # Calcular compatibilidad de perfil
            profile_score = MatchmakingService.calculate_profile_compatibility(mentor.user_id, mentee_id, db)
            
            # Calcular compatibilidad de horario
            schedule_score = MatchmakingService.check_schedule_compatibility(mentor.user_id, mentee_id, db)
            
            # Calcular puntuación total (70% perfil, 30% horario)
            total_score = (profile_score * 0.7) + (schedule_score * 0.3)
            
            # Obtener información del usuario del mentor
            mentor_user = db.query(User).filter(User.id == mentor.user_id).first()
            
            matches.append({
                "mentor_id": mentor.user_id,
                "name": mentor_user.name,
                "position": mentor.position,
                "company": mentor.company,
                "experience_years": mentor.experience_years,
                "profile_compatibility": profile_score,
                "schedule_compatibility": schedule_score,
                "total_score": total_score
            })
        
        # Ordenar por puntuación total y limitar resultados
        matches.sort(key=lambda x: x["total_score"], reverse=True)
        return matches[:limit]
    
    @staticmethod
    def find_matches_for_mentor(mentor_id: int, db: Session, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Encuentra los mejores mentiles para un mentor específico.
        Retorna una lista de diccionarios con información del mentil y puntuación de compatibilidad.
        """
        # Obtener todos los mentiles
        mentees = db.query(Mentee).all()
        
        matches = []
        for mentee in mentees:
            # Calcular compatibilidad de perfil
            profile_score = MatchmakingService.calculate_profile_compatibility(mentor_id, mentee.user_id, db)
            
            # Calcular compatibilidad de horario
            schedule_score = MatchmakingService.check_schedule_compatibility(mentor_id, mentee.user_id, db)
            
            # Calcular puntuación total (70% perfil, 30% horario)
            total_score = (profile_score * 0.7) + (schedule_score * 0.3)
            
            # Obtener información del usuario del mentil
            mentee_user = db.query(User).filter(User.id == mentee.user_id).first()
            
            matches.append({
                "mentee_id": mentee.user_id,
                "name": mentee_user.name,
                "current_position": mentee.current_position,
                "goals": mentee.goals,
                "profile_compatibility": profile_score,
                "schedule_compatibility": schedule_score,
                "total_score": total_score
            })
        
        # Ordenar por puntuación total y limitar resultados
        matches.sort(key=lambda x: x["total_score"], reverse=True)
        return matches[:limit]
