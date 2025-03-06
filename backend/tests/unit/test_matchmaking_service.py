import pytest
from sqlalchemy.orm import Session

from app.models import User, Mentor, Mentee, Skill, MentorSkill, MenteeInterest, Availability
from app.services.matchmaking import MatchmakingService

class TestMatchmakingService:
    
    def test_calculate_profile_compatibility(self, test_db: Session):
        # Crear usuarios de prueba
        mentor_user = User(id=1, email="mentor@example.com", name="Mentor Test", password_hash="hash", role="mentor")
        mentee_user = User(id=2, email="mentee@example.com", name="Mentee Test", password_hash="hash", role="mentee")
        test_db.add(mentor_user)
        test_db.add(mentee_user)
        
        # Crear perfiles
        mentor = Mentor(user_id=1, bio="Test bio", experience_years=5, company="Test Company", position="Developer")
        mentee = Mentee(user_id=2, bio="Test bio", goals="Learn programming", current_position="Student")
        test_db.add(mentor)
        test_db.add(mentee)
        
        # Crear habilidades
        skill1 = Skill(id=1, name="Python", category="Programming")
        skill2 = Skill(id=2, name="JavaScript", category="Programming")
        skill3 = Skill(id=3, name="SQL", category="Database")
        test_db.add(skill1)
        test_db.add(skill2)
        test_db.add(skill3)
        
        # Asignar habilidades al mentor
        mentor_skill1 = MentorSkill(mentor_id=1, skill_id=1, proficiency_level=5)  # Python - Experto
        mentor_skill2 = MentorSkill(mentor_id=1, skill_id=2, proficiency_level=3)  # JavaScript - Intermedio
        test_db.add(mentor_skill1)
        test_db.add(mentor_skill2)
        
        # Asignar intereses al mentil
        mentee_interest1 = MenteeInterest(mentee_id=2, skill_id=1, interest_level=5)  # Python - Muy interesado
        mentee_interest2 = MenteeInterest(mentee_id=2, skill_id=3, interest_level=3)  # SQL - Interés medio
        test_db.add(mentee_interest1)
        test_db.add(mentee_interest2)
        
        test_db.commit()
        
        # Calcular compatibilidad
        compatibility = MatchmakingService.calculate_profile_compatibility(1, 2, test_db)
        
        # Verificar resultado
        # El mentil está interesado en Python (5) y SQL (3)
        # El mentor es experto en Python (5) y no conoce SQL (0)
        # Compatibilidad esperada: (5*5 + 3*0) / (5*5 + 3*5) = 25 / 40 = 0.625
        assert compatibility == pytest.approx(0.625, 0.01)
    
    def test_check_schedule_compatibility(self, test_db: Session):
        # Crear usuarios de prueba
        mentor_user = User(id=1, email="mentor@example.com", name="Mentor Test", password_hash="hash", role="mentor")
        mentee_user = User(id=2, email="mentee@example.com", name="Mentee Test", password_hash="hash", role="mentee")
        test_db.add(mentor_user)
        test_db.add(mentee_user)
        
        # Crear perfiles
        mentor = Mentor(user_id=1, bio="Test bio", experience_years=5, company="Test Company", position="Developer")
        mentee = Mentee(user_id=2, bio="Test bio", goals="Learn programming", current_position="Student")
        test_db.add(mentor)
        test_db.add(mentee)
        
        # Crear disponibilidad para el mentor
        mentor_avail1 = Availability(user_id=1, day_of_week=1, start_time="09:00", end_time="12:00", recurrence="weekly")
        mentor_avail2 = Availability(user_id=1, day_of_week=3, start_time="14:00", end_time="17:00", recurrence="weekly")
        test_db.add(mentor_avail1)
        test_db.add(mentor_avail2)
        
        # Crear disponibilidad para el mentil
        mentee_avail1 = Availability(user_id=2, day_of_week=1, start_time="10:00", end_time="13:00", recurrence="weekly")
        mentee_avail2 = Availability(user_id=2, day_of_week=5, start_time="14:00", end_time="17:00", recurrence="weekly")
        test_db.add(mentee_avail1)
        test_db.add(mentee_avail2)
        
        test_db.commit()
        
        # Calcular compatibilidad de horarios
        compatibility = MatchmakingService.check_schedule_compatibility(1, 2, test_db)
        
        # Verificar resultado
        # El mentor tiene disponibilidad los lunes 9-12 y miércoles 14-17
        # El mentil tiene disponibilidad los lunes 10-13 y viernes 14-17
        # Hay solapamiento los lunes de 10-12 (2 horas)
        # Compatibilidad esperada: 1 slot solapado / 2 slots totales = 0.5
        assert compatibility == pytest.approx(0.5, 0.01)
    
    def test_find_matches_for_mentee(self, test_db: Session):
        # Crear usuarios de prueba
        mentor1_user = User(id=1, email="mentor1@example.com", name="Mentor 1", password_hash="hash", role="mentor")
        mentor2_user = User(id=2, email="mentor2@example.com", name="Mentor 2", password_hash="hash", role="mentor")
        mentee_user = User(id=3, email="mentee@example.com", name="Mentee Test", password_hash="hash", role="mentee")
        test_db.add(mentor1_user)
        test_db.add(mentor2_user)
        test_db.add(mentee_user)
        
        # Crear perfiles
        mentor1 = Mentor(user_id=1, bio="Test bio", experience_years=5, company="Company A", position="Developer")
        mentor2 = Mentor(user_id=2, bio="Test bio", experience_years=3, company="Company B", position="Designer")
        mentee = Mentee(user_id=3, bio="Test bio", goals="Learn programming", current_position="Student")
        test_db.add(mentor1)
        test_db.add(mentor2)
        test_db.add(mentee)
        
        # Crear habilidades
        skill1 = Skill(id=1, name="Python", category="Programming")
        skill2 = Skill(id=2, name="JavaScript", category="Programming")
        skill3 = Skill(id=3, name="Design", category="UX/UI")
        test_db.add(skill1)
        test_db.add(skill2)
        test_db.add(skill3)
        
        # Asignar habilidades a los mentores
        mentor1_skill1 = MentorSkill(mentor_id=1, skill_id=1, proficiency_level=5)  # Python - Experto
        mentor1_skill2 = MentorSkill(mentor_id=1, skill_id=2, proficiency_level=3)  # JavaScript - Intermedio
        mentor2_skill1 = MentorSkill(mentor_id=2, skill_id=2, proficiency_level=4)  # JavaScript - Avanzado
        mentor2_skill2 = MentorSkill(mentor_id=2, skill_id=3, proficiency_level=5)  # Design - Experto
        test_db.add(mentor1_skill1)
        test_db.add(mentor1_skill2)
        test_db.add(mentor2_skill1)
        test_db.add(mentor2_skill2)
        
        # Asignar intereses al mentil
        mentee_interest1 = MenteeInterest(mentee_id=3, skill_id=1, interest_level=5)  # Python - Muy interesado
        mentee_interest2 = MenteeInterest(mentee_id=3, skill_id=2, interest_level=3)  # JavaScript - Interés medio
        test_db.add(mentee_interest1)
        test_db.add(mentee_interest2)
        
        # Crear disponibilidad
        mentor1_avail = Availability(user_id=1, day_of_week=1, start_time="09:00", end_time="12:00", recurrence="weekly")
        mentor2_avail = Availability(user_id=2, day_of_week=3, start_time="14:00", end_time="17:00", recurrence="weekly")
        mentee_avail = Availability(user_id=3, day_of_week=1, start_time="10:00", end_time="13:00", recurrence="weekly")
        test_db.add(mentor1_avail)
        test_db.add(mentor2_avail)
        test_db.add(mentee_avail)
        
        test_db.commit()
        
        # Buscar matches para el mentil
        matches = MatchmakingService.find_matches_for_mentee(3, test_db)
        
        # Verificar resultados
        assert len(matches) == 2
        
        # El mentor 1 debería tener mayor compatibilidad (Python + horario solapado)
        assert matches[0]["mentor_id"] == 1
        assert matches[1]["mentor_id"] == 2
        
        # Verificar que la puntuación total del mentor 1 es mayor que la del mentor 2
        assert matches[0]["total_score"] > matches[1]["total_score"]
