from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.services.analytics_service import AnalyticsService
from app.models.user import User

router = APIRouter()

@router.get("/platform-metrics")
async def get_platform_metrics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtiene métricas generales de la plataforma (solo admin)."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_platform_metrics(start_date, end_date)

@router.get("/user-engagement/{user_id}")
async def get_user_engagement(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene métricas de engagement para un usuario."""
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    analytics_service = AnalyticsService(db)
    return analytics_service.get_user_engagement_metrics(user_id)

@router.get("/trending-topics")
async def get_trending_topics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene los temas más populares en las mentorías."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_trending_topics()

@router.get("/success-factors")
async def get_success_factors(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Analiza factores que contribuyen al éxito de las mentorías (solo admin)."""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_success_factors()
