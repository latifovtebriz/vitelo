"""Job Tracker Kanban API endpoints backed by PostgreSQL relational models."""

import logging
import uuid
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.tracker import (
    JobTracker,
    JobTrackerColumn,
    JobTrackerApplication,
    JobTrackerActivity,
    JobTrackerNote,
    JobTrackerReminder,
)
from models.user import User

logger = logging.getLogger("vitelo.tracker")
router = APIRouter()

DEFAULT_COLUMNS = [
    {"key": "Wishlist", "label": "Wishlist", "display_order": 0},
    {"key": "Applied", "label": "Applied", "display_order": 1},
    {"key": "Interview", "label": "Interview", "display_order": 2},
    {"key": "Offer", "label": "Offer", "display_order": 3},
    {"key": "Rejected", "label": "Rejected", "display_order": 4},
]


# ── Schemas ──

class ApplicationCreate(BaseModel):
    company: str
    role: str
    status: str = "Wishlist"  # Wishlist, Applied, Interview, Offer, Rejected
    notes: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM-DD


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[str] = None


class ApplicationMove(BaseModel):
    target_status: str  # e.g. "Interview"


class NoteCreate(BaseModel):
    note_text: str


class ReminderCreate(BaseModel):
    title: str
    remind_at: datetime


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    column_key: str
    company: str
    role: str
    notes: Optional[str]
    date: date
    created_at: datetime

    model_config = {"from_attributes": True}


class ColumnResponse(BaseModel):
    id: uuid.UUID
    key: str
    label: str
    display_order: int
    applications: List[ApplicationResponse]


class TrackerBoardResponse(BaseModel):
    id: uuid.UUID
    title: str
    columns: List[ColumnResponse]


async def _get_or_create_tracker(user_id: uuid.UUID, db: AsyncSession) -> JobTracker:
    """Ensure user has a tracker board with default columns initialized."""
    stmt = (
        select(JobTracker)
        .where(JobTracker.user_id == user_id)
        .options(
            selectinload(JobTracker.columns).selectinload(JobTrackerColumn.applications)
        )
    )
    result = await db.execute(stmt)
    tracker = result.scalar_one_or_none()

    if not tracker:
        tracker = JobTracker(user_id=user_id, title="Board")
        db.add(tracker)
        await db.flush()

        for col_def in DEFAULT_COLUMNS:
            col = JobTrackerColumn(
                tracker_id=tracker.id,
                key=col_def["key"],
                label=col_def["label"],
                display_order=col_def["display_order"],
            )
            db.add(col)

        await db.commit()
        # Re-fetch populated tracker
        result = await db.execute(stmt)
        tracker = result.scalar_one()

    return tracker


@router.get("/", response_model=TrackerBoardResponse)
async def get_tracker_board(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch the current user's complete Kanban board with all columns and applications."""
    tracker = await _get_or_create_tracker(current_user.id, db)

    col_responses = []
    for col in sorted(tracker.columns, key=lambda c: c.display_order):
        app_responses = [
            ApplicationResponse(
                id=app.id,
                column_key=col.key,
                company=app.company,
                role=app.role,
                notes=app.notes,
                date=app.date or date.today(),
                created_at=app.created_at or datetime.utcnow(),
            )
            for app in sorted(col.applications, key=lambda a: a.created_at or datetime.utcnow(), reverse=True)
        ]
        col_responses.append(
            ColumnResponse(
                id=col.id,
                key=col.key,
                label=col.label,
                display_order=col.display_order,
                applications=app_responses,
            )
        )

    return TrackerBoardResponse(
        id=tracker.id,
        title=tracker.title,
        columns=col_responses,
    )


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    body: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a new job application card to a column in the user's Kanban board."""
    tracker = await _get_or_create_tracker(current_user.id, db)

    target_col = next((c for c in tracker.columns if c.key.lower() == body.status.lower()), None)
    if not target_col:
        target_col = tracker.columns[0]

    app_date = date.today()
    if body.date:
        try:
            app_date = date.fromisoformat(body.date)
        except ValueError:
            pass

    app = JobTrackerApplication(
        column_id=target_col.id,
        company=body.company.strip(),
        role=body.role.strip(),
        notes=body.notes.strip() if body.notes else None,
        date=app_date,
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)

    return ApplicationResponse(
        id=app.id,
        column_key=target_col.key,
        company=app.company,
        role=app.role,
        notes=app.notes,
        date=app.date,
        created_at=app.created_at,
    )


@router.put("/applications/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: uuid.UUID,
    body: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update job application details."""
    tracker = await _get_or_create_tracker(current_user.id, db)

    stmt = select(JobTrackerApplication).where(JobTrackerApplication.id == app_id)
    res = await db.execute(stmt)
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if body.company is not None:
        app.company = body.company.strip()
    if body.role is not None:
        app.role = body.role.strip()
    if body.notes is not None:
        app.notes = body.notes.strip()
    if body.date:
        try:
            app.date = date.fromisoformat(body.date)
        except ValueError:
            pass

    if body.status:
        target_col = next((c for c in tracker.columns if c.key.lower() == body.status.lower()), None)
        if target_col and target_col.id != app.column_id:
            # record activity
            db.add(JobTrackerActivity(application_id=app.id, from_column_id=app.column_id, to_column_id=target_col.id))
            app.column_id = target_col.id

    await db.commit()
    await db.refresh(app)

    # find current col key
    col_stmt = select(JobTrackerColumn).where(JobTrackerColumn.id == app.column_id)
    col_res = await db.execute(col_stmt)
    current_col = col_res.scalar_one()

    return ApplicationResponse(
        id=app.id,
        column_key=current_col.key,
        company=app.company,
        role=app.role,
        notes=app.notes,
        date=app.date,
        created_at=app.created_at,
    )


@router.patch("/applications/{app_id}/move", response_model=ApplicationResponse)
async def move_application(
    app_id: uuid.UUID,
    body: ApplicationMove,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Quickly move an application to another status column."""
    tracker = await _get_or_create_tracker(current_user.id, db)

    stmt = select(JobTrackerApplication).where(JobTrackerApplication.id == app_id)
    res = await db.execute(stmt)
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    target_col = next((c for c in tracker.columns if c.key.lower() == body.target_status.lower()), None)
    if not target_col:
        raise HTTPException(status_code=400, detail="Invalid target column status")

    if target_col.id != app.column_id:
        db.add(JobTrackerActivity(application_id=app.id, from_column_id=app.column_id, to_column_id=target_col.id))
        app.column_id = target_col.id
        await db.commit()
        await db.refresh(app)

    return ApplicationResponse(
        id=app.id,
        column_key=target_col.key,
        company=app.company,
        role=app.role,
        notes=app.notes,
        date=app.date,
        created_at=app.created_at,
    )


@router.delete("/applications/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    app_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a job application from the board."""
    stmt = select(JobTrackerApplication).where(JobTrackerApplication.id == app_id)
    res = await db.execute(stmt)
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    await db.delete(app)
    await db.commit()
    return None
