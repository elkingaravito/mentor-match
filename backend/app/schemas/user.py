from typing import Optional, List
from pydantic import BaseModel, EmailStr

# Esquemas base
class UserBase(BaseModel):
    email: EmailStr
    name: str

class MentorBase(BaseModel):
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    company: Optional[str] = None
    position: Optional[str] = None
    linkedin_url: Optional[str] = None

class MenteeBase(BaseModel):
    bio: Optional[str] = None
    goals: Optional[str] = None
    current_position: Optional[str] = None
    linkedin_url: Optional[str] = None

# Esquemas para creación
class UserCreate(UserBase):
    password: str
    role: str

class MentorCreate(MentorBase):
    pass

class MenteeCreate(MenteeBase):
    pass

# Esquemas para actualización
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None

class MentorUpdate(MentorBase):
    pass

class MenteeUpdate(MenteeBase):
    pass

# Esquemas para respuesta
class User(UserBase):
    id: int
    role: str
    
    class Config:
        from_attributes = True

class Mentor(MentorBase):
    user_id: int
    
    class Config:
        from_attributes = True

class Mentee(MenteeBase):
    user_id: int
    
    class Config:
        from_attributes = True

class UserWithProfile(User):
    mentor: Optional[Mentor] = None
    mentee: Optional[Mentee] = None
    
    class Config:
        from_attributes = True

# Esquema para autenticación
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
