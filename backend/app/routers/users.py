from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Mentor, Mentee
from app.schemas.user import (
    UserUpdate, UserComplete, 
    MentorProfileCreate, MentorProfileUpdate,
    MenteeProfileCreate, MenteeProfileUpdate
)

router = APIRouter()

@router.get("/me", response_model=UserComplete)
def read_user_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get current user.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=UserComplete)
def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update current user.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for field, value in user_in.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.post("/me/mentor-profile", response_model=UserComplete)
def create_mentor_profile(
    profile: MentorProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create mentor profile for current user.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.mentor:
        raise HTTPException(status_code=400, detail="Mentor profile already exists")
    
    mentor = Mentor(user_id=user.id, **profile.dict())
    db.add(mentor)
    db.commit()
    db.refresh(user)
    return user

@router.put("/me/mentor-profile", response_model=UserComplete)
def update_mentor_profile(
    profile: MentorProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update mentor profile for current user.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user or not user.mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    
    for field, value in profile.dict(exclude_unset=True).items():
        setattr(user.mentor, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.post("/me/mentee-profile", response_model=UserComplete)
def create_mentee_profile(
    profile: MenteeProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create mentee profile for current user.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.mentee:
        raise HTTPException(status_code=400, detail="Mentee profile already exists")
    
    mentee = Mentee(user_id=user.id, **profile.dict())
    db.add(mentee)
    db.commit()
    db.refresh(user)
    return user

@router.put("/me/mentee-profile", response_model=UserComplete)
def update_mentee_profile(
    profile: MenteeProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update mentee profile for current user.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user or not user.mentee:
        raise HTTPException(status_code=404, detail="Mentee profile not found")
    
    for field, value in profile.dict(exclude_unset=True).items():
        setattr(user.mentee, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.get("/mentors", response_model=List[UserComplete])
def list_mentors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve mentors.
    """
    mentors = db.query(User).join(Mentor).offset(skip).limit(limit).all()
    return mentors

@router.get("/mentees", response_model=List[UserComplete])
def list_mentees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve mentees.
    """
    mentees = db.query(User).join(Mentee).offset(skip).limit(limit).all()
    return mentees
