from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models.base import Base
from app.routers import users, auth, matching, calendar, statistics

app = FastAPI(
    title="Mentor Match API",
    description="API para el sistema de matching de mentores y mentees",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(matching.router, prefix="/api/matching", tags=["Matching"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["Statistics"])

# Create database tables
Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Bienvenido a Mentor Match API"}
