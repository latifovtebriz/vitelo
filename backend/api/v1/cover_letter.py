"""Cover Letter endpoints — AI generation, listing, editing and deletion."""

import uuid
import json
import logging
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.errors import NotFoundError
from core.security import get_current_user
from models.cover_letter import CoverLetter
from models.cv import CVGeneration
from models.user import User
from services.ai_service import ai_service

logger = logging.getLogger("vitelo.cover_letter")
router = APIRouter()


# ── Pydantic Schemas ──

class GenerateCoverLetterRequest(BaseModel):
    cv_id: Optional[uuid.UUID] = None
    company_name: str = Field(..., max_length=255)
    job_title: str = Field(..., max_length=255)
    job_description: Optional[str] = None
    tone: str = Field(default="formal", pattern="^(formal|confident|creative|enthusiastic)$")
    applicant_name: Optional[str] = None


class UpdateCoverLetterRequest(BaseModel):
    title: Optional[str] = None
    content: str
    company_name: Optional[str] = None
    job_title: Optional[str] = None


class CoverLetterResponse(BaseModel):
    id: uuid.UUID
    title: str
    job_title: Optional[str]
    company_name: Optional[str]
    tone: str
    content: str
    pdf_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/generate", response_model=CoverLetterResponse, status_code=status.HTTP_201_CREATED)
async def generate_cover_letter(
    body: GenerateCoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a personalized AI cover letter tailored to a specific company and role."""
    cv_data = {}
    if body.cv_id:
        result = await db.execute(
            select(CVGeneration).where(
                CVGeneration.id == body.cv_id,
                CVGeneration.user_id == current_user.id,
            )
        )
        cv = result.scalar_one_or_none()
        if cv and cv.ai_output:
            cv_data = cv.ai_output

    if not cv_data:
        cv_data = {
            "personal": {
                "name": body.applicant_name or current_user.full_name or "Applicant",
                "email": current_user.email,
            }
        }

    # Generate text with Gemini
    job_desc = body.job_description or f"Role: {body.job_title} at {body.company_name}"
    generated_text = await ai_service.generate_cover_letter(
        cv_data=cv_data,
        job_desc=job_desc,
        tone=body.tone,
    )

    # Save to database
    cover_letter = CoverLetter(
        user_id=current_user.id,
        cv_id=body.cv_id,
        title=f"Cover Letter — {body.company_name}",
        job_title=body.job_title,
        company_name=body.company_name,
        job_description=body.job_description,
        tone=body.tone,
        content=generated_text,
        ai_output=generated_text,
    )
    db.add(cover_letter)
    await db.commit()
    await db.refresh(cover_letter)

    logger.info(f"Cover letter created: user={current_user.id} id={cover_letter.id}")
    return cover_letter


@router.get("/", response_model=List[CoverLetterResponse])
async def list_cover_letters(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all saved cover letters for current user."""
    result = await db.execute(
        select(CoverLetter)
        .where(CoverLetter.user_id == current_user.id)
        .order_by(CoverLetter.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
    letter_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single cover letter details."""
    result = await db.execute(
        select(CoverLetter).where(
            CoverLetter.id == letter_id,
            CoverLetter.user_id == current_user.id,
        )
    )
    letter = result.scalar_one_or_none()
    if not letter:
        raise NotFoundError("Cover Letter")
    return letter


@router.put("/{letter_id}", response_model=CoverLetterResponse)
async def update_cover_letter(
    letter_id: uuid.UUID,
    body: UpdateCoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update cover letter content and metadata."""
    result = await db.execute(
        select(CoverLetter).where(
            CoverLetter.id == letter_id,
            CoverLetter.user_id == current_user.id,
        )
    )
    letter = result.scalar_one_or_none()
    if not letter:
        raise NotFoundError("Cover Letter")

    if body.title:
        letter.title = body.title
    letter.content = body.content
    letter.ai_output = body.content
    if body.company_name:
        letter.company_name = body.company_name
    if body.job_title:
        letter.job_title = body.job_title

    await db.commit()
    await db.refresh(letter)
    return letter


@router.delete("/{letter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cover_letter(
    letter_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a cover letter."""
    result = await db.execute(
        select(CoverLetter).where(
            CoverLetter.id == letter_id,
            CoverLetter.user_id == current_user.id,
        )
    )
    letter = result.scalar_one_or_none()
    if not letter:
        raise NotFoundError("Cover Letter")

    await db.delete(letter)
    await db.commit()
    return None
