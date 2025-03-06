from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.core.database import get_db
from app.models import Availability, User

router = APIRouter()

@router.get("/user/{user_id}", response_model=List[schemas.Availability])
def read_user_availability(
    user_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve availability for a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    availability = db.query(Availability).filter(Availability.user_id == user_id).all()
    return availability

@router.post("/user/{user_id}", response_model=schemas.Availability)
def create_user_availability(
    user_id: int, availability_in: schemas.AvailabilityCreate, db: Session = Depends(get_db)
) -> Any:
    """
    Create new availability for a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Verificar que no exista una disponibilidad para el mismo día y hora
    existing_availability = db.query(Availability).filter(
        Availability.user_id == user_id,
        Availability.day_of_week == availability_in.day_of_week,
        Availability.start_time == availability_in.start_time
    ).first()
    
    if existing_availability:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Availability already exists for this day and time",
        )
    
    availability = Availability(
        user_id=user_id,
        **availability_in.dict()
    )
    db.add(availability)
    db.commit()
    db.refresh(availability)
    return availability

@router.put("/{availability_id}", response_model=schemas.Availability)
def update_availability(
    availability_id: int, availability_in: schemas.AvailabilityUpdate, db: Session = Depends(get_db)
) -> Any:
    """
    Update an availability.
    """
    availability = db.query(Availability).filter(Availability.id == availability_id).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found",
        )
    
    update_data = availability_in.dict(exclude_unset=True)
    
    # Si se está actualizando el día o la hora de inicio, verificar que no exista otra disponibilidad
    if "day_of_week" in update_data or "start_time" in update_data:
        day_of_week = update_data.get("day_of_week", availability.day_of_week)
        start_time = update_data.get("start_time", availability.start_time)
        
        existing_availability = db.query(Availability).filter(
            Availability.user_id == availability.user_id,
            Availability.day_of_week == day_of_week,
            Availability.start_time == start_time,
            Availability.id != availability_id
        ).first()
        
        if existing_availability:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Availability already exists for this day and time",
            )
    
    for field, value in update_data.items():
        setattr(availability, field, value)
    
    db.commit()
    db.refresh(availability)
    return availability

@router.delete("/{availability_id}", response_model=schemas.Availability)
def delete_availability(
    availability_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Delete an availability.
    """
    availability = db.query(Availability).filter(Availability.id == availability_id).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found",
        )
    
    db.delete(availability)
    db.commit()
    return availability
