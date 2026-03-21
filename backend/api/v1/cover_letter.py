"""Cover Letter endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.auth import get_current_user
from core.database import get_db
from core.errors import InsufficientCreditsError
from models.cover_letter import CoverLetter
from models.user import User

router = APIRouter()


@router.post("/generate", status_code=202)
async def generate_cover_letter(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a cover letter — costs 1 credit. (Phase 2)"""
    raise HTTPException(status_code=501, detail="Cover Letter generation coming in Phase 2")


@router.get("/")
async def list_cover_letters(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all cover letters for the current user."""
    result = await db.execute(
        select(CoverLetter)
        .where(CoverLetter.user_id == current_user.id)
        .order_by(CoverLetter.created_at.desc())
    )
    return {"items": result.scalars().all(), "total": 0}
