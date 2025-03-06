import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models import User, Mentor, Mentee, Session as SessionModel, SessionFeedback
from app.services.statistics import StatisticsService

class TestStatisticsService:
    
    def test_get_global_statistics(self, test_db: Session):
        # Crear usuarios de prueba
        mentor1 = User(id=1, email="mentor1@example.com", name="Mentor 1", password_hash="hash", role="mentor")
        mentor2 = User(id=2, email="mentor2@example.com", name="Mentor 2", password_hash="hash", role="mentor")
        mentee1 = User(id=3, email="mentee1@example.com", name="Mentee 1", password_hash="hash", role="mentee")
        mentee2 = User(id=4, email="mentee2@example.com", name="Mentee 2", password_hash="hash", role="mentee")
        test_db.add(mentor1)
        test_db.add(mentor2)
        test_db.add(mentee1)
        test_db.add(mentee2)
        
        # Crear perfiles
        mentor1_profile = Mentor(user_id=1, bio="Test bio", experience_years=5, company="Company A", position="Developer")
        mentor2_profile = Mentor(user_id=2, bio="Test bio", experience_years=3, company="Company B", position="Designer")
        mentee1_profile = Mentee(user_id=3, bio="Test bio", goals="Learn programming", current_position="Student")
        mentee2_profile = Mentee(user_id=4, bio="Test bio", goals="Improve design skills", current_position="Junior Designer")
        test_db.add(mentor1_profile)
        test_db.add(mentor2_profile)
        test_db.add(mentee1_profile)
        test_db.add(mentee2_profile)
        
        # Crear sesiones
        now = datetime.now()
        
        # Sesiones completadas
        session1 = SessionModel(
            id=1,
            mentor_id=1,
            mentee_id=3,
            start_time=now - timedelta(days=5, hours=2),
            end_time=now - timedelta(days=5, hours=1),
            status="completed"
        )
        session2 = SessionModel(
            id=2,
            mentor_id=2,
            mentee_id=4,
            start_time=now - timedelta(days=3, hours=2),
            end_time=now - timedelta(days=3, hours=1),
            status="completed"
        )
        
        # Sesión cancelada
        session3 = SessionModel(
            id=3,
            mentor_id=1,
            mentee_id=4,
            start_time=now - timedelta(days=1, hours=2),
            end_time=now - timedelta(days=1, hours=1),
            status="cancelled"
        )
        
        # Sesión programada
        session4 = SessionModel(
            id=4,
            mentor_id=2,
            mentee_id=3,
            start_time=now + timedelta(days=1, hours=2),
            end_time=now + timedelta(days=1, hours=3),
            status="scheduled"
        )
        
        test_db.add(session1)
        test_db.add(session2)
        test_db.add(session3)
        test_db.add(session4)
        
        # Crear feedback
        feedback1 = SessionFeedback(
            id=1,
            session_id=1,
            rating=5,
            comments="Great session!",
            created_by=3
        )
        feedback2 = SessionFeedback(
            id=2,
            session_id=2,
            rating=4,
            comments="Good session",
            created_by=4
        )
        
        test_db.add(feedback1)
        test_db.add(feedback2)
        
        test_db.commit()
        
        # Obtener estadísticas globales
        stats = StatisticsService.get_global_statistics(test_db)
        
        # Verificar resultados
        assert stats["users"]["total"] == 4
        assert stats["users"]["mentors"] == 2
        assert stats["users"]["mentees"] == 2
        
        assert stats["sessions"]["total"] == 4
        assert stats["sessions"]["completed"] == 2
        assert stats["sessions"]["cancelled"] == 1
        assert stats["sessions"]["completion_rate"] == 0.5  # 2/4
        
        # Verificar horas de mentoría (2 sesiones de 1 hora cada una)
        assert stats["mentoring_hours"] == pytest.approx(2.0, 0.1)
        
        # Verificar calificación promedio (5 + 4) / 2 = 4.5
        assert stats["average_rating"] == pytest.approx(4.5, 0.1)
    
    def test_get_user_statistics_mentor(self, test_db: Session):
        # Crear usuarios de prueba
        mentor = User(id=1, email="mentor@example.com", name="Mentor Test", password_hash="hash", role="mentor")
        mentee1 = User(id=2, email="mentee1@example.com", name="Mentee 1", password_hash="hash", role="mentee")
        mentee2 = User(id=3, email="mentee2@example.com", name="Mentee 2", password_hash="hash", role="mentee")
        test_db.add(mentor)
        test_db.add(mentee1)
        test_db.add(mentee2)
        
        # Crear perfiles
        mentor_profile = Mentor(user_id=1, bio="Test bio", experience_years=5, company="Company A", position="Developer")
        mentee1_profile = Mentee(user_id=2, bio="Test bio", goals="Learn programming", current_position="Student")
        mentee2_profile = Mentee(user_id=3, bio="Test bio", goals="Improve coding skills", current_position="Junior Developer")
        test_db.add(mentor_profile)
        test_db.add(mentee1_profile)
        test_db.add(mentee2_profile)
        
        # Crear sesiones
        now = datetime.now()
        
        # Sesiones completadas
        session1 = SessionModel(
            id=1,
            mentor_id=1,
            mentee_id=2,
            start_time=now - timedelta(days=5, hours=2),
            end_time=now - timedelta(days=5, hours=1),
            status="completed"
        )
        session2 = SessionModel(
            id=2,
            mentor_id=1,
            mentee_id=3,
            start_time=now - timedelta(days=3, hours=2),
            end_time=now - timedelta(days=3, hours=1),
            status="completed"
        )
        
        # Sesión cancelada
        session3 = SessionModel(
            id=3,
            mentor_id=1,
            mentee_id=2,
            start_time=now - timedelta(days=1, hours=2),
            end_time=now - timedelta(days=1, hours=1),
            status="cancelled"
        )
        
        # Sesión programada
        session4 = SessionModel(
            id=4,
            mentor_id=1,
            mentee_id=3,
            start_time=now + timedelta(days=1, hours=2),
            end_time=now + timedelta(days=1, hours=3),
            status="scheduled"
        )
        
        test_db.add(session1)
        test_db.add(session2)
        test_db.add(session3)
        test_db.add(session4)
        
        # Crear feedback
        feedback1 = SessionFeedback(
            id=1,
            session_id=1,
            rating=5,
            comments="Great session!",
            created_by=2
        )
        feedback2 = SessionFeedback(
            id=2,
            session_id=2,
            rating=4,
            comments="Good session",
            created_by=3
        )
        
        test_db.add(feedback1)
        test_db.add(feedback2)
        
        test_db.commit()
        
        # Obtener estadísticas del mentor
        stats = StatisticsService.get_user_statistics(1, test_db)
        
        # Verificar resultados
        assert stats["user_id"] == 1
        assert stats["name"] == "Mentor Test"
        assert stats["role"] == "mentor"
        
        assert stats["sessions"]["total"] == 4
        assert stats["sessions"]["completed"] == 2
        assert stats["sessions"]["cancelled"] == 1
        assert stats["sessions"]["upcoming"] == 1
        
        # Verificar horas de mentoría (2 sesiones de 1 hora cada una)
        assert stats["mentoring_hours"] == pytest.approx(2.0, 0.1)
        
        # Verificar calificación promedio (5 + 4) / 2 = 4.5
        assert stats["average_rating"] == pytest.approx(4.5, 0.1)
    
    def test_get_top_mentors(self, test_db: Session):
        # Crear usuarios de prueba
        mentor1 = User(id=1, email="mentor1@example.com", name="Mentor 1", password_hash="hash", role="mentor")
        mentor2 = User(id=2, email="mentor2@example.com", name="Mentor 2", password_hash="hash", role="mentor")
        mentor3 = User(id=3, email="mentor3@example.com", name="Mentor 3", password_hash="hash", role="mentor")
        mentee = User(id=4, email="mentee@example.com", name="Mentee Test", password_hash="hash", role="mentee")
        test_db.add(mentor1)
        test_db.add(mentor2)
        test_db.add(mentor3)
        test_db.add(mentee)
        
        # Crear perfiles
        mentor1_profile = Mentor(user_id=1, bio="Test bio", experience_years=5, company="Company A", position="Developer")
        mentor2_profile = Mentor(user_id=2, bio="Test bio", experience_years=3, company="Company B", position="Designer")
        mentor3_profile = Mentor(user_id=3, bio="Test bio", experience_years=7, company="Company C", position="Manager")
        mentee_profile = Mentee(user_id=4, bio="Test bio", goals="Learn various skills", current_position="Student")
        test_db.add(mentor1_profile)
        test_db.add(mentor2_profile)
        test_db.add(mentor3_profile)
        test_db.add(mentee_profile)
        
        # Crear sesiones
        now = datetime.now()
        
        # Mentor 1: 3 sesiones completadas
        for i in range(3):
            session = SessionModel(
                id=i+1,
                mentor_id=1,
                mentee_id=4,
                start_time=now - timedelta(days=10-i, hours=2),
                end_time=now - timedelta(days=10-i, hours=1),
                status="completed"
            )
            test_db.add(session)
            
            # Feedback con calificación 5
            feedback = SessionFeedback(
                id=i+1,
                session_id=i+1,
                rating=5,
                comments="Excellent!",
                created_by=4
            )
            test_db.add(feedback)
        
        # Mentor 2: 2 sesiones completadas
        for i in range(2):
            session = SessionModel(
                id=i+4,
                mentor_id=2,
                mentee_id=4,
                start_time=now - timedelta(days=8-i, hours=2),
                end_time=now - timedelta(days=8-i, hours=1),
                status="completed"
            )
            test_db.add(session)
            
            # Feedback con calificación 4
            feedback = SessionFeedback(
                id=i+4,
                session_id=i+4,
                rating=4,
                comments="Good!",
                created_by=4
            )
            test_db.add(feedback)
        
        # Mentor 3: 1 sesión completada
        session = SessionModel(
            id=6,
            mentor_id=3,
            mentee_id=4,
            start_time=now - timedelta(days=6, hours=2),
            end_time=now - timedelta(days=6, hours=1),
            status="completed"
        )
        test_db.add(session)
        
        # Feedback con calificación 3
        feedback = SessionFeedback(
            id=6,
            session_id=6,
            rating=3,
            comments="Average",
            created_by=4
        )
        test_db.add(feedback)
        
        test_db.commit()
        
        # Obtener top mentores
        top_mentors = StatisticsService.get_top_mentors(test_db, limit=3)
        
        # Verificar resultados
        assert len(top_mentors) == 3
        
        # Verificar orden (por número de sesiones completadas)
        assert top_mentors[0]["id"] == 1  # Mentor 1: 3 sesiones
        assert top_mentors[1]["id"] == 2  # Mentor 2: 2 sesiones
        assert top_mentors[2]["id"] == 3  # Mentor 3: 1 sesión
        
        # Verificar conteo de sesiones
        assert top_mentors[0]["completed_sessions"] == 3
        assert top_mentors[1]["completed_sessions"] == 2
        assert top_mentors[2]["completed_sessions"] == 1
        
        # Verificar calificaciones promedio
        assert top_mentors[0]["average_rating"] == 5.0
        assert top_mentors[1]["average_rating"] == 4.0
        assert top_mentors[2]["average_rating"] == 3.0
