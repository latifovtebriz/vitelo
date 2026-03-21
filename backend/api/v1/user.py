"""User profile endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.auth import get_current_user
from core.database import get_db
from models.user import User
from schemas.auth import UserResponse

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    full_name: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile."""
    if full_name is not None:
        current_user.full_name = full_name
    return current_user
