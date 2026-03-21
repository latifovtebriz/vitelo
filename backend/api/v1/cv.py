"""CV endpoints — generate, list, get, download."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.auth import get_current_user
from core.database import get_db

limiter = Limiter(key_func=get_remote_address)
from core.errors import InsufficientCreditsError
from models.cv import CVGeneration
from models.user import User
from schemas.cv import CVGenerateRequest, CVListResponse, CVResponse

router = APIRouter()


@router.post("/generate", response_model=CVResponse, status_code=202)
@limiter.limit("10/minute")
async def generate_cv(
    request: Request,
    body: CVGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start CV generation — deducts 1 credit, queues background task."""
    if current_user.credits < 1:
        raise InsufficientCreditsError()

    # Deduct credit
    current_user.credits -= 1

    cv = CVGeneration(
        user_id=current_user.id,
        status="pending",
        input_data=body.model_dump(),
        template=body.template,
        language=body.language,
    )
    db.add(cv)
    await db.flush()

    # TODO: Dispatch Celery task → workers/tasks.py generate_cv_task.delay(str(cv.id))
    # from workers.tasks import generate_cv_task
    # generate_cv_task.delay(str(cv.id))

    return cv


@router.get("/", response_model=CVListResponse)
async def list_cvs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all CVs for the current user."""
    result = await db.execute(
        select(CVGeneration)
        .where(CVGeneration.user_id == current_user.id)
        .order_by(CVGeneration.created_at.desc())
    )
    items = result.scalars().all()
    return CVListResponse(items=items, total=len(items))


@router.get("/{cv_id}", response_model=CVResponse)
async def get_cv(
    cv_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single CV by ID."""
    result = await db.execute(
        select(CVGeneration).where(
            CVGeneration.id == cv_id,
            CVGeneration.user_id == current_user.id,
        )
    )
    cv = result.scalar_one_or_none()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv


@router.get("/{cv_id}/download")
async def download_cv(
    cv_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the download URL for a CV PDF."""
    result = await db.execute(
        select(CVGeneration).where(
            CVGeneration.id == cv_id,
            CVGeneration.user_id == current_user.id,
        )
    )
    cv = result.scalar_one_or_none()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    if cv.status != "done" or not cv.pdf_url:
        raise HTTPException(status_code=400, detail="PDF not ready yet")
    return {"download_url": cv.pdf_url}
