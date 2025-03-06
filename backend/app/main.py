from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine
from app.models.base import Base
from app.routers import api_router
from app.routers.websockets import router as websocket_router

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configurar CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Incluir rutas de la API
app.include_router(api_router, prefix=settings.API_V1_STR)

# Incluir rutas de WebSockets
app.include_router(websocket_router)

@app.get("/")
def root():
    return {"message": "Welcome to Mentor Match API"}
