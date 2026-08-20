"""Centralized Telemetry & Dual-Sink Logging Engine.

Writes logs simultaneously to:
1. Supabase PostgreSQL `app_logs` table (persists in DB for query & auto-cleanup).
2. Better Stack Logs / Logtail HTTP Ingestion (real-time live cloud dashboard).
3. Formatted JSON / colored terminal stdout.
"""

import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Union

import httpx
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.database import async_session_factory
from models.log import AppLog

logger = logging.getLogger("vitelo.central_logs")
settings = get_settings()

BETTERSTACK_INGEST_URL = "https://in.logs.betterstack.com"


class CentralTelemetry:
    def __init__(self):
        self.logtail_token = settings.LOGTAIL_SOURCE_TOKEN or settings.BETTERSTACK_TOKEN
        self._http_client = httpx.AsyncClient(timeout=4.0)

    async def _send_to_betterstack(self, logs: List[Dict[str, Any]]) -> None:
        """Stream logs asynchronously to Better Stack Logs / Logtail."""
        token = settings.LOGTAIL_SOURCE_TOKEN or settings.BETTERSTACK_TOKEN
        if not token:
            return

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        try:
            # Better Stack accepts single object or array of objects with dt, message, and metadata
            payload = []
            for entry in logs:
                payload.append({
                    "dt": entry.get("created_at") or datetime.now(timezone.utc).isoformat(),
                    "level": entry.get("level", "INFO"),
                    "message": entry.get("message", ""),
                    "category": entry.get("category", "general"),
                    "component": entry.get("component", "system"),
                    "page_url": entry.get("page_url"),
                    "user_id": str(entry.get("user_id")) if entry.get("user_id") else None,
                    "user_email": entry.get("user_email"),
                    "source": entry.get("source", "backend"),
                    "payload": entry.get("payload") or {},
                    "app": "vitelo",
                    "environment": settings.ENVIRONMENT,
                })

            response = await self._http_client.post(
                BETTERSTACK_INGEST_URL,
                headers=headers,
                json=payload if len(payload) > 1 else payload[0],
            )
            if response.status_code >= 400:
                logger.warning(f"BetterStack log ingest response status: {response.status_code}")
        except Exception as e:
            logger.debug(f"Failed to stream log to BetterStack: {e}")

    async def log(
        self,
        level: str = "INFO",
        category: str = "system",
        message: str = "",
        component: Optional[str] = None,
        page_url: Optional[str] = None,
        user_id: Optional[Union[uuid.UUID, str]] = None,
        user_email: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        source: str = "backend",
        db: Optional[AsyncSession] = None,
    ) -> Optional[AppLog]:
        """Record log in Supabase PostgreSQL AND Better Stack Cloud."""
        level_normalized = level.upper()
        user_uuid = None
        if user_id:
            try:
                user_uuid = uuid.UUID(str(user_id))
            except Exception:
                user_uuid = None

        log_data = {
            "level": level_normalized,
            "category": category,
            "message": message,
            "component": component,
            "page_url": page_url,
            "user_id": user_uuid,
            "user_email": user_email,
            "payload": payload,
            "source": source,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        # 1. Output to local logger
        if level_normalized in ["ERROR", "CRITICAL"]:
            logger.error(f"[{level_normalized}] {component or 'App'}: {message} | {payload or ''}")
        elif level_normalized == "WARN":
            logger.warning(f"[{level_normalized}] {component or 'App'}: {message} | {payload or ''}")
        else:
            logger.info(f"[{level_normalized}] {component or 'App'}: {message}")

        # 2. Async stream to Better Stack
        try:
            await self._send_to_betterstack([log_data])
        except Exception:
            pass

        # 3. Persist in Supabase DB
        app_log_record = AppLog(
            level=level_normalized,
            source=source,
            category=category,
            message=message,
            page_url=page_url,
            component=component,
            user_id=user_uuid,
            user_email=user_email,
            payload=payload,
            created_at=datetime.now(timezone.utc),
        )

        if db:
            db.add(app_log_record)
            try:
                await db.commit()
            except Exception:
                pass
        else:
            try:
                async with async_session_factory() as session:
                    session.add(app_log_record)
                    # Auto-retention: clean logs older than 5 days
                    cutoff = datetime.now(timezone.utc) - timedelta(days=5)
                    await session.execute(delete(AppLog).where(AppLog.created_at < cutoff))
                    await session.commit()
            except Exception as e:
                logger.error(f"Failed to persist AppLog to database: {e}")

        return app_log_record


# Singleton instance
telemetry = CentralTelemetry()
