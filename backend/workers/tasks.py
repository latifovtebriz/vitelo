"""Celery background tasks — real CV generation pipeline.

Fix #5: Full async flow: AI generate → PDF render → R2 upload → DB update.
"""

import asyncio
import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from workers.celery_app import celery_app
from core.database import async_session
from models.cv import CVGeneration
from models.user import User
from services.ai_service import AIService
from services.pdf_service import PDFService
from services.storage_service import StorageService

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Helper to run an async coroutine inside a sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def generate_cv_task(self, cv_id: str):
    """
    Background CV generation pipeline:
    1. Load CV record from DB
    2. Call AI service (Gemini → Groq fallback)
    3. Generate PDF with Playwright
    4. Upload PDF to Cloudflare R2
    5. Update DB record with results
    6. On failure: mark as failed + refund credit
    """
    _run_async(_generate_cv_async(self, cv_id))


async def _generate_cv_async(task, cv_id: str):
    """Async implementation of the CV generation pipeline."""
    async with async_session() as db:
        # 1. Load CV record
        result = await db.execute(
            select(CVGeneration).where(CVGeneration.id == uuid.UUID(cv_id))
        )
        cv = result.scalar_one_or_none()
        if not cv:
            logger.error(f"CV {cv_id} not found")
            return

        try:
            # Mark as processing
            cv.status = "processing"
            await db.commit()

            # 2. Call AI service
            logger.info(f"[CV {cv_id}] Calling AI service...")
            ai_output = await AIService.generate_cv(cv.input_data)
            cv.ai_output = ai_output
            cv.ats_score = ai_output.get("ats_score", 0)

            # 3. Generate PDF
            logger.info(f"[CV {cv_id}] Generating PDF (template: {cv.template})...")
            pdf_bytes = await PDFService.generate_cv_pdf(cv.template, ai_output)

            # 4. Upload to R2
            logger.info(f"[CV {cv_id}] Uploading to R2...")
            filename = f"cv_{cv_id}.pdf"
            pdf_url = await StorageService.upload_pdf(pdf_bytes, filename)
            cv.pdf_url = pdf_url

            # 5. Mark as done
            cv.status = "done"
            await db.commit()
            logger.info(f"[CV {cv_id}] ✅ Complete — ATS score: {cv.ats_score}, URL: {pdf_url}")

        except Exception as e:
            logger.error(f"[CV {cv_id}] ❌ Failed: {e}")
            cv.status = "failed"

            # Refund credit
            user_result = await db.execute(
                select(User).where(User.id == cv.user_id)
            )
            user = user_result.scalar_one_or_none()
            if user:
                user.credits += 1
                logger.info(f"[CV {cv_id}] Credit refunded to {user.email}")

            await db.commit()

            # Retry via Celery if attempts remain
            try:
                task.retry(exc=e)
            except task.MaxRetriesExceededError:
                logger.error(f"[CV {cv_id}] Max retries exceeded, giving up")
