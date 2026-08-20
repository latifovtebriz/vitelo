"""System & Application Telemetry Logging API — captures frontend clicks, errors & API diagnostics."""

import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Union
from pydantic import BaseModel, Field

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import select, func, desc, delete
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user_optional
from models.log import AppLog
from models.user import User

logger = logging.getLogger("vitelo.telemetry")
router = APIRouter()


# ── Schemas ──

class LogEntryCreate(BaseModel):
    level: str = Field(default="INFO", pattern="^(INFO|WARN|ERROR|ACTION|DEBUG)$")
    source: str = Field(default="frontend")
    category: str = Field(default="ui_action")
    message: str
    page_url: Optional[str] = None
    component: Optional[str] = None
    user_id: Optional[uuid.UUID] = None
    user_email: Optional[str] = None
    payload: Optional[dict] = None


class BatchLogCreate(BaseModel):
    logs: List[LogEntryCreate]


class LogResponse(BaseModel):
    id: uuid.UUID
    level: str
    source: str
    category: str
    message: str
    page_url: Optional[str]
    component: Optional[str]
    user_id: Optional[uuid.UUID]
    user_email: Optional[str]
    payload: Optional[dict]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class LogListResponse(BaseModel):
    items: List[LogResponse]
    total: int


@router.post("/", status_code=201)
async def ingest_logs(
    body: Union[LogEntryCreate, BatchLogCreate],
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Ingest frontend button clicks, user telemetry, and error logs into PostgreSQL."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    entries = body.logs if isinstance(body, BatchLogCreate) else [body]
    db_records = []

    for item in entries:
        uid = item.user_id or (current_user.id if current_user else None)
        uemail = item.user_email or (current_user.email if current_user else None)

        record = AppLog(
            level=item.level.upper(),
            source=item.source,
            category=item.category,
            message=item.message,
            page_url=item.page_url,
            component=item.component,
            user_id=uid,
            user_email=uemail,
            payload=item.payload,
            ip_address=client_ip,
            user_agent=user_agent,
            created_at=datetime.now(timezone.utc),
        )
        db_records.append(record)
        db.add(record)

        # Mirror high-priority logs to backend stdout
        if item.level in ["ERROR", "WARN"]:
            logger.warning(f"[{item.level}] {item.component or 'App'}: {item.message} | User: {uemail} | Page: {item.page_url}")
        else:
            logger.info(f"[{item.level}] {item.category}: {item.message} | Page: {item.page_url}")

    # Stream to Centralized Logs (Better Stack)
    try:
        from core.telemetry import telemetry
        await telemetry._send_to_betterstack([
            {
                "level": r.level,
                "category": r.category,
                "message": r.message,
                "component": r.component,
                "page_url": r.page_url,
                "user_id": r.user_id,
                "user_email": r.user_email,
                "source": r.source,
                "payload": r.payload,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in db_records
        ])
    except Exception:
        pass

    # Auto-retention: Automatically prune logs older than 5 days
    cutoff_5_days = datetime.now(timezone.utc) - timedelta(days=5)
    await db.execute(delete(AppLog).where(AppLog.created_at < cutoff_5_days))

    await db.commit()
    return {"success": True, "ingested_count": len(db_records)}


@router.get("/", response_model=LogListResponse)
async def list_logs(
    level: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Query recent logs with filters for rapid debugging and issue resolution."""
    stmt = select(AppLog)
    count_stmt = select(func.count(AppLog.id))

    if level:
        stmt = stmt.where(AppLog.level == level.upper())
        count_stmt = count_stmt.where(AppLog.level == level.upper())
    if source:
        stmt = stmt.where(AppLog.source == source)
        count_stmt = count_stmt.where(AppLog.source == source)
    if category:
        stmt = stmt.where(AppLog.category == category)
        count_stmt = count_stmt.where(AppLog.category == category)
    if search:
        search_filter = AppLog.message.ilike(f"%{search}%") | AppLog.component.ilike(f"%{search}%")
        stmt = stmt.where(search_filter)
        count_stmt = count_stmt.where(search_filter)

    stmt = stmt.order_by(desc(AppLog.created_at)).offset(offset).limit(limit)

    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    logs_res = await db.execute(stmt)
    items = logs_res.scalars().all()

    return LogListResponse(items=list(items), total=total)


@router.post("/cleanup")
async def cleanup_old_logs(
    days: int = Query(5, ge=1),
    db: AsyncSession = Depends(get_db),
):
    """Purge logs older than specified number of days (default 5 days)."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(delete(AppLog).where(AppLog.created_at < cutoff))
    await db.commit()
    return {"success": True, "purged_before": cutoff.isoformat(), "rows_affected": result.rowcount}


@router.delete("/clear")
async def clear_logs(
    db: AsyncSession = Depends(get_db),
):
    """Clear logs table."""
    await db.execute(delete(AppLog))
    await db.commit()
    return {"cleared": True}
