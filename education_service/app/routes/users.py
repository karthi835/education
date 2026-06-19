# ============================================================
# routes/users.py - User Management Routes
# List and manage admin user accounts
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.schemas.user import UserUpdate, UserResponse

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all registered users."""
    users = db.query(User).order_by(desc(User.created_at)).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user account (cannot delete self)."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully", "id": user_id}


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user account information."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check if username exists
    if user_data.username and user_data.username != user.username:
        existing = db.query(User).filter(User.username == user_data.username).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
        user.username = user_data.username
        
    # Check if email exists
    if user_data.email and user_data.email != user.email:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken",
            )
        user.email = user_data.email
        
    # Update password if provided
    if user_data.password:
        from app.utils.auth import hash_password
        user.password_hash = hash_password(user_data.password)
        
    db.commit()
    db.refresh(user)
    return user

