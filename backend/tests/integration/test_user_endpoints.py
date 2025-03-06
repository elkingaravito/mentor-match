import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import User, Mentor, Mentee
from app.core.security import get_password_hash

class TestUserEndpoints:
    
    def test_read_users(self, client: TestClient, test_db: Session):
        # Crear algunos usuarios para la prueba
        user1 = User(
            email="user1@example.com",
            name="User One",
            password_hash=get_password_hash("password"),
            role="mentor"
        )
        user2 = User(
            email="user2@example.com",
            name="User Two",
            password_hash=get_password_hash("password"),
            role="mentee"
        )
        test_db.add(user1)
        test_db.add(user2)
        test_db.commit()
        
        # Enviar solicitud para obtener usuarios
        response = client.get("/api/v1/users/")
        
        # Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
        
        # Verificar que los usuarios creados están en la respuesta
        emails = [user["email"] for user in data]
        assert "user1@example.com" in emails
        assert "user2@example.com" in emails
    
    def test_read_user(self, client: TestClient, test_db: Session):
        # Crear un usuario para la prueba
        user = User(
            id=100,
            email="specific@example.com",
            name="Specific User",
            password_hash=get_password_hash("password"),
            role="mentor"
        )
        test_db.add(user)
        test_db.commit()
        
        # Enviar solicitud para obtener el usuario específico
        response = client.get(f"/api/v1/users/{user.id}")
        
        # Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user.id
        assert data["email"] == user.email
        assert data["name"] == user.name
        assert data["role"] == user.role
    
    def test_update_user(self, client: TestClient, test_db: Session):
        # Crear un usuario para la prueba
        user = User(
            id=101,
            email="update@example.com",
            name="Update User",
            password_hash=get_password_hash("password"),
            role="mentee"
        )
        test_db.add(user)
        test_db.commit()
        
        # Datos para actualizar
        update_data = {
            "name": "Updated Name"
        }
        
        # Enviar solicitud para actualizar el usuario
        response = client.put(f"/api/v1/users/{user.id}", json=update_data)
        
        # Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user.id
        assert data["name"] == update_data["name"]
        assert data["email"] == user.email  # No debería cambiar
        
        # Verificar que el usuario se actualizó en la base de datos
        updated_user = test_db.query(User).filter(User.id == user.id).first()
        assert updated_user.name == update_data["name"]
    
    def test_create_mentor_profile(self, client: TestClient, test_db: Session):
        # Crear un usuario mentor para la prueba
        user = User(
            id=102,
            email="mentor@example.com",
            name="Mentor User",
            password_hash=get_password_hash("password"),
            role="mentor"
        )
        test_db.add(user)
        test_db.commit()
        
        # Datos para el perfil de mentor
        profile_data = {
            "bio": "Experienced developer with 5 years in the industry",
            "experience_years": 5,
            "company": "Tech Company",
            "position": "Senior Developer",
            "linkedin_url": "https://linkedin.com/in/mentor"
        }
        
        # Enviar solicitud para crear el perfil de mentor
        response = client.post(f"/api/v1/users/{user.id}/mentor", json=profile_data)
        
        # Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user.id
        assert data["bio"] == profile_data["bio"]
        assert data["experience_years"] == profile_data["experience_years"]
        assert data["company"] == profile_data["company"]
        assert data["position"] == profile_data["position"]
        assert data["linkedin_url"] == profile_data["linkedin_url"]
        
        # Verificar que el perfil se creó en la base de datos
        mentor = test_db.query(Mentor).filter(Mentor.user_id == user.id).first()
        assert mentor is not None
        assert mentor.bio == profile_data["bio"]
        assert mentor.experience_years == profile_data["experience_years"]
    
    def test_create_mentee_profile(self, client: TestClient, test_db: Session):
        # Crear un usuario mentil para la prueba
        user = User(
            id=103,
            email="mentee@example.com",
            name="Mentee User",
            password_hash=get_password_hash("password"),
            role="mentee"
        )
        test_db.add(user)
        test_db.commit()
        
        # Datos para el perfil de mentil
        profile_data = {
            "bio": "Computer science student looking to improve programming skills",
            "goals": "Learn web development and machine learning",
            "current_position": "Student",
            "linkedin_url": "https://linkedin.com/in/mentee"
        }
        
        # Enviar solicitud para crear el perfil de mentil
        response = client.post(f"/api/v1/users/{user.id}/mentee", json=profile_data)
        
        # Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user.id
        assert data["bio"] == profile_data["bio"]
        assert data["goals"] == profile_data["goals"]
        assert data["current_position"] == profile_data["current_position"]
        assert data["linkedin_url"] == profile_data["linkedin_url"]
        
        # Verificar que el perfil se creó en la base de datos
        mentee = test_db.query(Mentee).filter(Mentee.user_id == user.id).first()
        assert mentee is not None
        assert mentee.bio == profile_data["bio"]
        assert mentee.goals == profile_data["goals"]
