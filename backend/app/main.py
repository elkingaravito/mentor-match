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
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",  # Vite alternate
    "http://localhost:3000",  # React default
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Version prefix
api_v1_prefix = "/api/v1"

# Include routers
app.include_router(auth.router, prefix=f"{api_v1_prefix}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{api_v1_prefix}/users", tags=["Users"])
app.include_router(matching.router, prefix=f"{api_v1_prefix}/matching", tags=["Matching"])
app.include_router(calendar.router, prefix=f"{api_v1_prefix}/calendar", tags=["Calendar"])
app.include_router(statistics.router, prefix=f"{api_v1_prefix}/statistics", tags=["Statistics"])

# Create database tables
Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Bienvenido a Mentor Match API"}

@app.get(f"{api_v1_prefix}/health-check")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
