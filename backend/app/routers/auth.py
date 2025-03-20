from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
from app.core.security import create_access_token, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES, get_password_hash
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserInDB, Token, LoginResponse
from typing import Any
from app.core.auth import get_current_user  # Importamos get_current_user de app.core.auth

router = APIRouter()

@router.post("/register", response_model=UserInDB)
def signup(user: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Crear un nuevo usuario.
    """
    # Verificar si el usuario ya existe
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Crear nuevo usuario
    db_user = User(
        email=user.email,
        name=user.name,
        password_hash=get_password_hash(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Login endpoint that accepts JSON instead of form-data
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        user=user
    )

@router.post("/test-token", response_model=UserInDB)
def test_token(current_user: User = Depends(get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user
