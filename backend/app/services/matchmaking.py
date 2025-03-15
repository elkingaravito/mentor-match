from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Mentor, Mentee, MentorSkill, MenteeInterest, Availability, User

class MatchmakingService:
    """
    Servicio para emparejar mentores y mentiles basado en compatibilidad de perfiles y disponibilidad.
    """
    
    @staticmethod
    def calculate_profile_compatibility(mentor_id: int, mentee_id: int, db: Session) -> Dict[str, float]:
        """
        Calculate comprehensive compatibility between a mentor and mentee.
        Returns a dictionary with detailed compatibility scores.
        """
        # Get base compatibility scores (skills, language, career)
        base_scores = MatchmakingService._calculate_base_compatibility(mentor_id, mentee_id, db)
        
        # Calculate industry experience compatibility
        industry_score = MatchmakingService._calculate_industry_compatibility(mentor_id, mentee_id, db)
        
        # Calculate mentoring style compatibility
        style_score = MatchmakingService._calculate_mentoring_style_compatibility(mentor_id, mentee_id, db)
        
        # Calculate goals alignment
        goals_score = MatchmakingService._calculate_goals_alignment(mentor_id, mentee_id, db)
        
        # Calculate weighted total score
        weights = {
            "skills": 0.25,
            "language": 0.15,
            "career": 0.15,
            "industry": 0.20,
            "style": 0.15,
            "goals": 0.10
        }
        
        total_score = sum(
            score * weights[key]
            for key, score in {
                "skills": base_scores["skills_compatibility"],
                "language": base_scores["language_compatibility"],
                "career": base_scores["career_compatibility"],
                "industry": industry_score,
                "style": style_score,
                "goals": goals_score
            }.items()
        )

        return {
            "total": total_score,
            "skills_compatibility": base_scores["skills_compatibility"],
            "language_compatibility": base_scores["language_compatibility"],
            "career_compatibility": base_scores["career_compatibility"],
            "industry_compatibility": industry_score,
            "style_compatibility": style_score,
            "goals_alignment": goals_score
        }

    @staticmethod
    def _calculate_industry_compatibility(mentor_id: int, mentee_id: int, db: Session) -> float:
        """Calculate compatibility based on industry experience."""
        mentor_exp = db.query(UserIndustryExperience).filter(
            UserIndustryExperience.user_id == mentor_id
        ).all()
        
        mentee_goals = db.query(MentorshipGoal).filter(
            MentorshipGoal.user_id == mentee_id
        ).all()
        
        if not mentor_exp or not mentee_goals:
            return 0.0
            
        # Create industry experience map for mentor
        mentor_industries = {
            exp.industry_id: {
                "years": exp.years_experience,
                "is_current": exp.is_current,
                "level": exp.position_level
            }
            for exp in mentor_exp
        }
        
        # Calculate relevance score for each mentee goal
        total_score = 0
        max_score = len(mentee_goals)
        
        for goal in mentee_goals:
            # Find relevant industry experience
            relevant_exp = next(
                (exp for exp in mentor_exp if exp.industry.category == goal.category),
                None
            )
            
            if relevant_exp:
                # Base score for having relevant experience
                goal_score = 0.5
                
                # Bonus for current industry experience
                if relevant_exp.is_current:
                    goal_score += 0.2
                    
                # Bonus for years of experience (max bonus at 10 years)
                exp_bonus = min(relevant_exp.years_experience / 10, 0.3)
                goal_score += exp_bonus
                
                total_score += goal_score * goal.priority / 5  # Weight by goal priority
                
        return total_score / max_score if max_score > 0 else 0.0

    @staticmethod
    def _calculate_mentoring_style_compatibility(mentor_id: int, mentee_id: int, db: Session) -> float:
        """Calculate compatibility based on mentoring style and preferences."""
        mentor_prefs = db.query(MentoringPreference).filter(
            MentoringPreference.user_id == mentor_id
        ).first()
        
        mentee_prefs = db.query(MentoringPreference).filter(
            MentoringPreference.user_id == mentee_id
        ).first()
        
        if not mentor_prefs or not mentee_prefs:
            return 0.0
            
        score = 0.0
        
        # Style compatibility
        style_match = {
            # Mentee preferred -> Compatible mentor styles
            "directive": ["directive", "challenging"],
            "collaborative": ["collaborative", "supportive"],
            "supportive": ["supportive", "collaborative"],
            "challenging": ["challenging", "directive"]
        }
        if mentor_prefs.preferred_style in style_match.get(mentee_prefs.preferred_style, []):
            score += 0.4
            
        # Session structure compatibility
        if mentor_prefs.structured_sessions == mentee_prefs.structured_sessions:
            score += 0.2
            
        # Meeting frequency compatibility
        freq_diff = abs(mentor_prefs.meeting_frequency - mentee_prefs.meeting_frequency)
        score += 0.2 * (1 - min(freq_diff / 4, 1))  # Max difference of 4 meetings/month
        
        # Session duration compatibility
        duration_diff = abs(mentor_prefs.session_duration - mentee_prefs.session_duration)
        score += 0.2 * (1 - min(duration_diff / 60, 1))  # Max difference of 60 minutes
        
        return score

    @staticmethod
    def _calculate_goals_alignment(mentor_id: int, mentee_id: int, db: Session) -> float:
        """Calculate compatibility based on mentorship goals alignment."""
        mentee_goals = db.query(MentorshipGoal).filter(
            MentorshipGoal.user_id == mentee_id
        ).all()
        
        mentor_exp = db.query(UserIndustryExperience).filter(
            UserIndustryExperience.user_id == mentor_id
        ).all()
        
        if not mentee_goals or not mentor_exp:
            return 0.0
            
        total_score = 0
        max_score = sum(goal.priority for goal in mentee_goals)
        
        for goal in mentee_goals:
            # Find relevant mentor experience for this goal
            relevant_exp = next(
                (exp for exp in mentor_exp if exp.industry.category == goal.category),
                None
            )
            
            if relevant_exp:
                goal_score = 0.0
                
                # Base score for category match
                goal_score += 0.4
                
                # Bonus for experience level
                if relevant_exp.position_level in ["Senior", "Lead", "Manager"]:
                    goal_score += 0.3
                
                # Bonus for timeline alignment
                if relevant_exp.years_experience >= goal.timeline_months / 12:
                    goal_score += 0.3
                
                total_score += goal_score * goal.priority
                
        return total_score / max_score if max_score > 0 else 0.0

        # Language compatibility
        mentor_languages = db.query(UserLanguage).filter(UserLanguage.user_id == mentor_id).all()
        mentee_languages = db.query(UserLanguage).filter(UserLanguage.user_id == mentee_id).all()
        
        language_score = 0.0
        if mentor_languages and mentee_languages:
            common_languages = set(m.language_code for m in mentor_languages) & set(m.language_code for m in mentee_languages)
            if common_languages:
                # Find the best matching language proficiency
                best_match = 0
                for lang in common_languages:
                    mentor_prof = next(m.proficiency for m in mentor_languages if m.language_code == lang)
                    mentee_prof = next(m.proficiency for m in mentee_languages if m.language_code == lang)
                    prof_values = {"basic": 1, "intermediate": 2, "advanced": 3, "native": 4}
                    match = min(prof_values[mentor_prof], prof_values[mentee_prof]) / 4
                    best_match = max(best_match, match)
                language_score = best_match

        # Career path alignment
        mentor_paths = db.query(UserCareerPath).filter(UserCareerPath.user_id == mentor_id).all()
        mentee_paths = db.query(UserCareerPath).filter(UserCareerPath.user_id == mentee_id).all()
        
        career_score = 0.0
        if mentor_paths and mentee_paths:
            mentor_path_ids = set(p.career_path_id for p in mentor_paths)
            mentee_path_ids = set(p.career_path_id for p in mentee_paths)
            matching_paths = mentor_path_ids & mentee_path_ids
            
            if matching_paths:
                # Consider experience in matching paths
                total_exp = 0
                for path_id in matching_paths:
                    mentor_exp = next(p.years_experience for p in mentor_paths if p.career_path_id == path_id)
                    total_exp += min(mentor_exp, 10)  # Cap at 10 years
                career_score = min(total_exp / 10, 1.0)  # Normalize to 0-1

        # Calculate weighted total score
        weights = {
            "skills": 0.4,
            "language": 0.3,
            "career": 0.3
        }
        
        total_score = (
            skills_score * weights["skills"] +
            language_score * weights["language"] +
            career_score * weights["career"]
        )

        return {
            "total": total_score,
            "skills_compatibility": skills_score,
            "language_compatibility": language_score,
            "career_compatibility": career_score
        }
    
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
        Find the best mentors for a specific mentee with comprehensive matching criteria.
        """
        mentors = db.query(Mentor).all()
        mentee = db.query(Mentee).filter(Mentee.user_id == mentee_id).first()
        
        if not mentee:
            return []
            
        matches = []
        for mentor in mentors:
            # Calculate comprehensive compatibility scores
            profile_scores = MatchmakingService.calculate_profile_compatibility(mentor.user_id, mentee_id, db)
            schedule_score = MatchmakingService.check_schedule_compatibility(mentor.user_id, mentee_id, db)
            
            # Calculate final score (70% profile, 30% schedule)
            total_score = (profile_scores["total"] * 0.7) + (schedule_score * 0.3)
            
            # Get mentor details
            mentor_user = db.query(User).filter(User.id == mentor.user_id).first()
            
            # Get mentor's industry experience
            industry_exp = db.query(UserIndustryExperience).join(Industry).filter(
                UserIndustryExperience.user_id == mentor.user_id
            ).all()
            
            industry_info = [
                {
                    "industry": exp.industry.name,
                    "years": exp.years_experience,
                    "position": exp.position_level,
                    "is_current": exp.is_current
                }
                for exp in industry_exp
            ]
            
            # Get mentoring preferences
            mentor_prefs = db.query(MentoringPreference).filter(
                MentoringPreference.user_id == mentor.user_id
            ).first()
            
            mentoring_style = {
                "style": mentor_prefs.preferred_style if mentor_prefs else None,
                "session_structure": mentor_prefs.structured_sessions if mentor_prefs else None,
                "meeting_frequency": mentor_prefs.meeting_frequency if mentor_prefs else None,
                "session_duration": mentor_prefs.session_duration if mentor_prefs else None,
                "goals_focus": mentor_prefs.goals_focus if mentor_prefs else None
            }
            
            # Get languages and career paths (from previous implementation)
            languages = db.query(UserLanguage).filter(UserLanguage.user_id == mentor.user_id).all()
            language_info = [{"code": lang.language_code, "level": lang.proficiency} for lang in languages]
            
            career_paths = db.query(UserCareerPath).join(CareerPath).filter(
                UserCareerPath.user_id == mentor.user_id
            ).all()
            career_info = [
                {
                    "name": path.career_path.name,
                    "years": path.years_experience,
                    "is_current": path.is_current
                }
                for path in career_paths
            ]
            
            matches.append({
                "mentor_id": mentor.user_id,
                "name": mentor_user.name,
                "position": mentor.position,
                "company": mentor.company,
                "experience_years": mentor.experience_years,
                "industry_experience": industry_info,
                "mentoring_style": mentoring_style,
                "languages": language_info,
                "career_paths": career_info,
                "compatibility_scores": {
                    "skills": profile_scores["skills_compatibility"],
                    "language": profile_scores["language_compatibility"],
                    "career": profile_scores["career_compatibility"],
                    "industry": profile_scores["industry_compatibility"],
                    "style": profile_scores["style_compatibility"],
                    "goals": profile_scores["goals_alignment"],
                    "schedule": schedule_score,
                    "total": total_score
                }
            })
        
        # Sort by total score and limit results
        matches.sort(key=lambda x: x["compatibility_scores"]["total"], reverse=True)
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
