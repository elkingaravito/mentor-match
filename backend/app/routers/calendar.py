from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.availability import Availability, CalendarIntegration
from app.services.calendar import CalendarService

router = APIRouter()

@router.post("/availability")
def create_availability(
    start_time: datetime,
    end_time: datetime,
    recurrence: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create availability slot for current user.
    """
    availability = Availability(
        user_id=current_user["user_id"],
        start_time=start_time,
        end_time=end_time,
        recurrence=recurrence
    )
    db.add(availability)
    db.commit()
    db.refresh(availability)
    return availability

@router.delete("/availability/{availability_id}")
def delete_availability(
    availability_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Delete availability slot.
    """
    availability = db.query(Availability).filter(
        Availability.id == availability_id,
        Availability.user_id == current_user["user_id"]
    ).first()
    
    if not availability:
        raise HTTPException(status_code=404, detail="Availability not found")
    
    db.delete(availability)
    db.commit()
    return {"status": "success"}

@router.post("/integrate/{provider}")
async def integrate_calendar(
    provider: str,
    auth_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Integrate external calendar (Google Calendar, Outlook, etc.).
    """
    calendar_service = CalendarService()
    credentials = await calendar_service.get_credentials(provider, auth_code)
    
    calendar_integration = CalendarIntegration(
        user_id=current_user["user_id"],
        provider=provider,
        credentials=credentials,
        is_active=True
    )
    
    db.add(calendar_integration)
    db.commit()
    db.refresh(calendar_integration)
    return {"status": "success", "provider": provider}

@router.get("/sync")
async def sync_calendar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Sync calendar with external provider.
    """
    integration = db.query(CalendarIntegration).filter(
        CalendarIntegration.user_id == current_user["user_id"],
        CalendarIntegration.is_active == True
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=400,
            detail="No active calendar integration found"
        )
    
    calendar_service = CalendarService()
    events = await calendar_service.sync_events(integration)
    
    integration.last_sync = datetime.utcnow()
    db.commit()
    
    return {"status": "success", "events_synced": len(events)}

@router.get("/availability/{user_id}")
def get_user_availability(
    user_id: int,
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get user's availability slots.
    """
    availability = db.query(Availability).filter(
        Availability.user_id == user_id,
        Availability.start_time >= start_date,
        Availability.end_time <= end_date
    ).all()
    
    return availability
