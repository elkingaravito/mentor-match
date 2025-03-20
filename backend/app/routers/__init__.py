from fastapi import APIRouter

from app.routers import (
    auth, users, skills, sessions, availability, matchmaking,
    statistics, notifications, calendar, analytics
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(availability.router, prefix="/availability", tags=["availability"])
api_router.include_router(matchmaking.router, prefix="/matchmaking", tags=["matchmaking"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["statistics"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])