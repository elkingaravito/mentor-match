from typing import Optional, List
from pydantic import BaseModel

# Esquemas base
class SkillBase(BaseModel):
    name: str
    category: str

class MentorSkillBase(BaseModel):
    skill_id: int
    proficiency_level: int  # 1-5

class MenteeInterestBase(BaseModel):
    skill_id: int
    interest_level: int  # 1-5

# Esquemas para creación
class SkillCreate(SkillBase):
    pass

class MentorSkillCreate(MentorSkillBase):
    pass

class MenteeInterestCreate(MenteeInterestBase):
    pass

# Esquemas para actualización
class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None

class MentorSkillUpdate(BaseModel):
    proficiency_level: Optional[int] = None

class MenteeInterestUpdate(BaseModel):
    interest_level: Optional[int] = None

# Esquemas para respuesta
class Skill(SkillBase):
    id: int
    
    class Config:
        from_attributes = True

class MentorSkill(MentorSkillBase):
    mentor_id: int
    
    class Config:
        from_attributes = True

class MenteeInterest(MenteeInterestBase):
    mentee_id: int
    
    class Config:
        from_attributes = True

# Esquema con detalles de la habilidad
class MentorSkillWithDetails(MentorSkill):
    skill: Skill
    
    class Config:
        from_attributes = True

class MenteeInterestWithDetails(MenteeInterest):
    skill: Skill
    
    class Config:
        from_attributes = True

# Esquemas para listas
class SkillList(BaseModel):
    skills: List[Skill]
