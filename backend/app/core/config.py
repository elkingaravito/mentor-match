import os
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

class Settings(BaseModel):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Mentor Match"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5174", "http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:5174"]
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mentor_match.db")
    
    # Google Calendar API
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: Optional[str] = os.getenv("GOOGLE_REDIRECT_URI")

settings = Settings()

# Imprimir configuración para depuración
print(f"GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")
print(f"GOOGLE_CLIENT_SECRET: {settings.GOOGLE_CLIENT_SECRET}")
print(f"GOOGLE_REDIRECT_URI: {settings.GOOGLE_REDIRECT_URI}")
