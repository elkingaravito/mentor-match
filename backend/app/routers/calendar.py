from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.auth import get_current_user, get_current_mentor
from app.models import User, Mentor
from app.services.calendar_integration import CalendarIntegrationService

router = APIRouter()

@router.get("/auth-url", response_model=Dict[str, str])
def get_calendar_auth_url(current_user: User = Depends(get_current_mentor)) -> Any:
    """
    Get the URL for authorizing calendar access.
    """
    auth_url = CalendarIntegrationService.get_auth_url()
    return {"auth_url": auth_url}

@router.post("/callback", response_model=Dict[str, str])
def calendar_auth_callback(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_mentor)
) -> Any:
    """
    Handle the callback from the calendar authorization.
    """
    # Obtener el código de autorización de los parámetros de la solicitud
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code is required",
        )
    
    # Intercambiar el código por tokens
    try:
        tokens = CalendarIntegrationService.exchange_code_for_tokens(code)
        CalendarIntegrationService.save_calendar_integration(current_user.id, tokens, db)
        
        return {"status": "success", "message": "Calendar integration successful"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during calendar integration: {str(e)}",
        )

@router.get("/events", response_model=List[Dict[str, Any]])
def get_calendar_events(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_mentor)
) -> Any:
    """
    Get calendar events for the current user.
    """
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor profile not found",
        )
    
    if not mentor.calendar_integration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Calendar not integrated",
        )
    
    start_date = datetime.now()
    end_date = start_date + timedelta(days=days)
    
    events = CalendarIntegrationService.get_calendar_events(current_user.id, start_date, end_date, db)
    return events

@router.get("/check-integration", response_model=Dict[str, bool])
def check_calendar_integration(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_mentor)
) -> Any:
    """
    Check if the user has integrated their calendar.
    """
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if not mentor:
        return {"integrated": False}
    
    return {"integrated": bool(mentor.calendar_integration)}
