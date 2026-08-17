"""User profile endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.auth import get_current_user
from core.database import get_db
from models.user import User
from schemas.auth import UserResponse

router = APIRouter()


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None


@router.get("/me", response_model=UserResponse)
@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    body: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile."""
    if body.full_name is not None:
        current_user.full_name = body.full_name.strip()
    await db.commit()
    await db.refresh(current_user)
    return current_user
