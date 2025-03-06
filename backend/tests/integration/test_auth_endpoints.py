import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import User
from app.core.security import get_password_hash

class TestAuthEndpoints:
    
    def test_register_user(self, client: TestClient, test_db: Session):
        # Datos para el registro
        user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "password123",
            "role": "mentee"
        }
        
        # Enviar solicitud de registro
        response = client.post("/api/v1/auth/register", json=user_data)
        
        # Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["name"] == user_data["name"]
        assert data["role"] == user_data["role"]
        
        # Verificar que el usuario se creó en la base de datos
        user = test_db.query(User).filter(User.email == user_data["email"]).first()
        assert user is not None
        assert user.name == user_data["name"]
        assert user.role == user_data["role"]
    
    def test_login_success(self, client: TestClient, test_db: Session):
        # Crear un usuario para la prueba
        password = "password123"
        user = User(
            email="login@example.com",
            name="Login Test",
            password_hash=get_password_hash(password),
            role="mentor"
        )
        test_db.add(user)
        test_db.commit()
        
        # Datos para el login
        login_data = {
            "username": "login@example.com",
            "password": password
        }
        
        # Enviar solicitud de login
        response = client.post("/api/v1/auth/login", data=login_data)
        
        # Verificar respuesta
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, client: TestClient, test_db: Session):
        # Crear un usuario para la prueba
        user = User(
            email="invalid@example.com",
            name="Invalid Test",
            password_hash=get_password_hash("correctpassword"),
            role="mentee"
        )
        test_db.add(user)
        test_db.commit()
        
        # Datos para el login con contraseña incorrecta
        login_data = {
            "username": "invalid@example.com",
            "password": "wrongpassword"
        }
        
        # Enviar solicitud de login
        response = client.post("/api/v1/auth/login", data=login_data)
        
        # Verificar respuesta
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "Incorrect email or password" in data["detail"]
