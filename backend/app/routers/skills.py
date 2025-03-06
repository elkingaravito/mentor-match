from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app import schemas
from app.core.database import get_db
from app.models import Skill, MentorSkill, MenteeInterest, Mentor, Mentee

router = APIRouter()

@router.get("/", response_model=List[schemas.Skill])
def read_skills(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve skills.
    """
    skills = db.query(Skill).offset(skip).limit(limit).all()
    return skills

@router.post("/", response_model=schemas.Skill)
def create_skill(
    skill_in: schemas.SkillCreate, db: Session = Depends(get_db)
) -> Any:
    """
    Create new skill.
    """
    skill = Skill(**skill_in.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@router.get("/{skill_id}", response_model=schemas.Skill)
def read_skill(
    skill_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific skill by id.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    return skill

@router.put("/{skill_id}", response_model=schemas.Skill)
def update_skill(
    skill_id: int, skill_in: schemas.SkillUpdate, db: Session = Depends(get_db)
) -> Any:
    """
    Update a skill.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    
    update_data = skill_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(skill, field, value)
    
    db.commit()
    db.refresh(skill)
    return skill

@router.delete("/{skill_id}", response_model=schemas.Skill)
def delete_skill(
    skill_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Delete a skill.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    
    db.delete(skill)
    db.commit()
    return skill

@router.get("/mentor/{mentor_id}", response_model=List[schemas.MentorSkillWithDetails])
def get_mentor_skills(
    mentor_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Get all skills for a specific mentor.
    """
    mentor = db.query(Mentor).filter(Mentor.user_id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found",
        )
    
    mentor_skills = db.query(MentorSkill).options(
        joinedload(MentorSkill.skill)
    ).filter(
        MentorSkill.mentor_id == mentor_id
    ).all()
    
    return mentor_skills

@router.get("/mentee/{mentee_id}", response_model=List[schemas.MenteeInterestWithDetails])
def get_mentee_interests(
    mentee_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Get all interests for a specific mentee.
    """
    mentee = db.query(Mentee).filter(Mentee.user_id == mentee_id).first()
    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentee not found",
        )
    
    mentee_interests = db.query(MenteeInterest).options(
        joinedload(MenteeInterest.skill)
    ).filter(
        MenteeInterest.mentee_id == mentee_id
    ).all()
    
    return mentee_interests

@router.post("/mentor/{mentor_id}", response_model=schemas.MentorSkill)
def add_mentor_skill(
    mentor_id: int, skill_in: schemas.MentorSkillCreate, db: Session = Depends(get_db)
) -> Any:
    """
    Add a skill to a mentor.
    """
    mentor = db.query(Mentor).filter(Mentor.user_id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found",
        )
    
    skill = db.query(Skill).filter(Skill.id == skill_in.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    
    # Check if the mentor already has this skill
    mentor_skill = db.query(MentorSkill).filter(
        MentorSkill.mentor_id == mentor_id,
        MentorSkill.skill_id == skill_in.skill_id
    ).first()
    
    if mentor_skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentor already has this skill",
        )
    
    mentor_skill = MentorSkill(
        mentor_id=mentor_id,
        skill_id=skill_in.skill_id,
        proficiency_level=skill_in.proficiency_level
    )
    db.add(mentor_skill)
    db.commit()
    db.refresh(mentor_skill)
    return mentor_skill

@router.put("/mentor/{mentor_id}/{skill_id}", response_model=schemas.MentorSkill)
def update_mentor_skill(
    mentor_id: int, skill_id: int, skill_in: schemas.MentorSkillUpdate, db: Session = Depends(get_db)
) -> Any:
    """
    Update a mentor's skill.
    """
    mentor_skill = db.query(MentorSkill).filter(
        MentorSkill.mentor_id == mentor_id,
        MentorSkill.skill_id == skill_id
    ).first()
    
    if not mentor_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor skill not found",
        )
    
    update_data = skill_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mentor_skill, field, value)
    
    db.commit()
    db.refresh(mentor_skill)
    return mentor_skill

@router.delete("/mentor/{mentor_id}/{skill_id}", response_model=schemas.MentorSkill)
def delete_mentor_skill(
    mentor_id: int, skill_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Delete a mentor's skill.
    """
    mentor_skill = db.query(MentorSkill).filter(
        MentorSkill.mentor_id == mentor_id,
        MentorSkill.skill_id == skill_id
    ).first()
    
    if not mentor_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor skill not found",
        )
    
    db.delete(mentor_skill)
    db.commit()
    return mentor_skill

@router.post("/mentee/{mentee_id}", response_model=schemas.MenteeInterest)
def add_mentee_interest(
    mentee_id: int, interest_in: schemas.MenteeInterestCreate, db: Session = Depends(get_db)
) -> Any:
    """
    Add an interest to a mentee.
    """
    mentee = db.query(Mentee).filter(Mentee.user_id == mentee_id).first()
    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentee not found",
        )
    
    skill = db.query(Skill).filter(Skill.id == interest_in.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    
    # Check if the mentee already has this interest
    mentee_interest = db.query(MenteeInterest).filter(
        MenteeInterest.mentee_id == mentee_id,
        MenteeInterest.skill_id == interest_in.skill_id
    ).first()
    
    if mentee_interest:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentee already has this interest",
        )
    
    mentee_interest = MenteeInterest(
        mentee_id=mentee_id,
        skill_id=interest_in.skill_id,
        interest_level=interest_in.interest_level
    )
    db.add(mentee_interest)
    db.commit()
    db.refresh(mentee_interest)
    return mentee_interest

@router.put("/mentee/{mentee_id}/{skill_id}", response_model=schemas.MenteeInterest)
def update_mentee_interest(
    mentee_id: int, skill_id: int, interest_in: schemas.MenteeInterestUpdate, db: Session = Depends(get_db)
) -> Any:
    """
    Update a mentee's interest.
    """
    mentee_interest = db.query(MenteeInterest).filter(
        MenteeInterest.mentee_id == mentee_id,
        MenteeInterest.skill_id == skill_id
    ).first()
    
    if not mentee_interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentee interest not found",
        )
    
    update_data = interest_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mentee_interest, field, value)
    
    db.commit()
    db.refresh(mentee_interest)
    return mentee_interest

@router.delete("/mentee/{mentee_id}/{skill_id}", response_model=schemas.MenteeInterest)
def delete_mentee_interest(
    mentee_id: int, skill_id: int, db: Session = Depends(get_db)
) -> Any:
    """
    Delete a mentee's interest.
    """
    mentee_interest = db.query(MenteeInterest).filter(
        MenteeInterest.mentee_id == mentee_id,
        MenteeInterest.skill_id == skill_id
    ).first()
    
    if not mentee_interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentee interest not found",
        )
    
    db.delete(mentee_interest)
    db.commit()
    return mentee_interest
