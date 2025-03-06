from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.core.database import get_db
from app.core.auth import get_current_active_user, get_current_admin
from app.models import User, Mentor, Mentee

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Retrieve users. Only for admins.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=schemas.UserWithProfile)
def read_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/{user_id}", response_model=schemas.UserWithProfile)
def read_user(
    user_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get a specific user by id.
    """
    # Solo los administradores pueden ver cualquier usuario
    # Los usuarios normales solo pueden verse a sí mismos
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_in: schemas.UserUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update own user.
    """
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int, user_in: schemas.UserUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Update a user. Only for admins.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(
    user_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Delete a user. Only for admins.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    db.delete(user)
    db.commit()
    return user

@router.post("/me/mentor", response_model=schemas.Mentor)
def create_mentor_profile_me(
    mentor_in: schemas.MentorCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Create a mentor profile for current user.
    """
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a mentor",
        )
    
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if mentor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentor profile already exists",
        )
    
    mentor = Mentor(
        user_id=current_user.id,
        **mentor_in.model_dump(),
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor

@router.post("/{user_id}/mentor", response_model=schemas.Mentor)
def create_mentor_profile(
    user_id: int, mentor_in: schemas.MentorCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Create a mentor profile for a user. Only for admins.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a mentor",
        )
    
    mentor = db.query(Mentor).filter(Mentor.user_id == user_id).first()
    if mentor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentor profile already exists",
        )
    
    mentor = Mentor(
        user_id=user_id,
        **mentor_in.model_dump(),
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor

@router.put("/me/mentor", response_model=schemas.Mentor)
def update_mentor_profile_me(
    mentor_in: schemas.MentorUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update own mentor profile.
    """
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a mentor",
        )
    
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor profile not found",
        )
    
    update_data = mentor_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mentor, field, value)
    
    db.commit()
    db.refresh(mentor)
    return mentor

@router.put("/{user_id}/mentor", response_model=schemas.Mentor)
def update_mentor_profile(
    user_id: int, mentor_in: schemas.MentorUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Update a mentor profile. Only for admins.
    """
    mentor = db.query(Mentor).filter(Mentor.user_id == user_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor profile not found",
        )
    
    update_data = mentor_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mentor, field, value)
    
    db.commit()
    db.refresh(mentor)
    return mentor

@router.post("/me/mentee", response_model=schemas.Mentee)
def create_mentee_profile_me(
    mentee_in: schemas.MenteeCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Create a mentee profile for current user.
    """
    if current_user.role != "mentee":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a mentee",
        )
    
    mentee = db.query(Mentee).filter(Mentee.user_id == current_user.id).first()
    if mentee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentee profile already exists",
        )
    
    mentee = Mentee(
        user_id=current_user.id,
        **mentee_in.model_dump(),
    )
    db.add(mentee)
    db.commit()
    db.refresh(mentee)
    return mentee

@router.post("/{user_id}/mentee", response_model=schemas.Mentee)
def create_mentee_profile(
    user_id: int, mentee_in: schemas.MenteeCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Create a mentee profile for a user. Only for admins.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user.role != "mentee":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a mentee",
        )
    
    mentee = db.query(Mentee).filter(Mentee.user_id == user_id).first()
    if mentee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentee profile already exists",
        )
    
    mentee = Mentee(
        user_id=user_id,
        **mentee_in.model_dump(),
    )
    db.add(mentee)
    db.commit()
    db.refresh(mentee)
    return mentee

@router.put("/me/mentee", response_model=schemas.Mentee)
def update_mentee_profile_me(
    mentee_in: schemas.MenteeUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update own mentee profile.
    """
    if current_user.role != "mentee":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a mentee",
        )
    
    mentee = db.query(Mentee).filter(Mentee.user_id == current_user.id).first()
    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentee profile not found",
        )
    
    update_data = mentee_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mentee, field, value)
    
    db.commit()
    db.refresh(mentee)
    return mentee

@router.put("/{user_id}/mentee", response_model=schemas.Mentee)
def update_mentee_profile(
    user_id: int, mentee_in: schemas.MenteeUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Update a mentee profile. Only for admins.
    """
    mentee = db.query(Mentee).filter(Mentee.user_id == user_id).first()
    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentee profile not found",
        )
    
    update_data = mentee_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mentee, field, value)
    
    db.commit()
    db.refresh(mentee)
    return mentee
