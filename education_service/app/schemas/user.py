# ============================================================
# schemas/user.py - User Pydantic Schemas
# Request/Response validation for authentication endpoints
# ============================================================

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    """Schema for user registration request."""
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    """Schema for user login request."""
    username: str
    password: str


class UserResponse(BaseModel):
    """Schema for user data in responses."""
    id: int
    username: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    """Schema for updating user data."""
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

