"""CV endpoints — generate (free, watermarked) + unlock (paid, clean PDF).

POST /generate       — FREE, creates watermarked PDF
POST /unlock/{cv_id} — requires 1 credit, returns clean PDF (+ CL / interview prep)
GET  /               — user CV list
GET  /{id}           — CV detail
"""

import logging
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.errors import InsufficientCreditsError, NotFoundError
from core.security import get_current_user
from models.cover_letter import CoverLetter
from models.cv import CVGeneration
from models.interview_prep import InterviewPrep
from models.user import User
from schemas.cv import (
    CVGenerateRequest,
    CVGenerateResponse,
    CVListItem,
    CVUnlockRequest,
    CVUnlockResponse,
    InterviewQA,
)
from services.ai_service import ai_service
from services.pdf_service import generate_cv_pdf, generate_cover_letter_pdf
from services.storage_service import generate_filename, upload_pdf

logger = logging.getLogger("vitelo.cv")
router = APIRouter()


@router.post("/generate", response_model=CVGenerateResponse, status_code=201)
async def generate_cv(
    body: CVGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    FREE endpoint — generates AI CV + watermarked PDF.
    No credit check. Returns watermarked PDF URL immediately.
    """
    # 1. Build input dict for AI
    input_data = body.model_dump(mode="python")

    # 2. Call AI
    logger.info(f"CV generation started: user={current_user.email}")
    ai_output = await ai_service.generate_cv(input_data)
    ats_score = ai_output.get("ats_score", 0)
    ats_tips = ai_output.get("ats_tips", [])

    # 3. Generate watermarked PDF
    pdf_bytes = await generate_cv_pdf(
        cv_data=ai_output,
        template_name=body.template if body.template else "cv_modern",
        watermark=True,
        language=body.language,
    )

    # 4. Upload to R2 / tmp
    filename = generate_filename(str(current_user.id), "watermarked")
    watermarked_url = await upload_pdf(pdf_bytes, filename)

    # 5. Save to DB
    cv = CVGeneration(
        user_id=current_user.id,
        status="done",
        input_data=input_data,
        ai_output=ai_output,
        ats_score=ats_score,
        watermarked_pdf_url=watermarked_url,
        clean_pdf_url=None,
        tier=None,
        template=body.template or "modern",
        language=body.language,
    )
    db.add(cv)
    await db.commit()
    await db.refresh(cv)

    logger.info(f"CV generated: id={cv.id} ats_score={ats_score}")

    return CVGenerateResponse(
        cv_id=cv.id,
        ats_score=ats_score,
        ats_tips=ats_tips,
        watermarked_pdf_url=watermarked_url,
        ai_output=ai_output,
    )


@router.post("/unlock/{cv_id}", response_model=CVUnlockResponse)
async def unlock_cv(
    cv_id: uuid.UUID,
    body: CVUnlockRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    PAID endpoint — requires 1 credit.
    - basic:    clean CV PDF only
    - pro:      clean CV PDF + Cover Letter PDF
    - ultimate: clean CV PDF + Cover Letter PDF + 5 Interview Q&A
    """
    # 1. Load CV record (must belong to current user)
    result = await db.execute(
        select(CVGeneration).where(
            CVGeneration.id == cv_id,
            CVGeneration.user_id == current_user.id,
        )
    )
    cv = result.scalar_one_or_none()
    if not cv:
        raise NotFoundError("CV")

    # 2. Check credits
    if current_user.credits < 1:
        raise InsufficientCreditsError()

    # 3. Deduct credit
    current_user.credits -= 1

    # 4. Generate clean PDF (no watermark)
    pdf_bytes = await generate_cv_pdf(
        cv_data=cv.ai_output,
        template_name=cv.template or "cv_modern",
        watermark=False,
        language=cv.language,
    )
    clean_filename = generate_filename(str(current_user.id), "clean")
    clean_url = await upload_pdf(pdf_bytes, clean_filename)

    # 5. Update CV record
    cv.clean_pdf_url = clean_url
    cv.tier = body.tier

    cover_letter_url: str | None = None
    interview_prep_result: list[InterviewQA] | None = None

    # 6. Pro/Ultimate: Cover Letter
    if body.tier in ("pro", "ultimate"):
        job_desc = body.job_description or "Software Engineer role"
        cl_text = await ai_service.generate_cover_letter(
            cv.ai_output, job_desc, tone="formal"
        )

        # Generate Cover Letter PDF
        cl_pdf_bytes = await generate_cover_letter_pdf(
            cover_letter_text=cl_text,
            personal=cv.ai_output.get("personal", {}),
            watermark=False,
        )
        cl_filename = generate_filename(str(current_user.id), "cover_letter")
        cover_letter_url = await upload_pdf(cl_pdf_bytes, cl_filename)

        # Save to DB
        cl_record = CoverLetter(
            user_id=current_user.id,
            cv_id=cv.id,
            job_description=job_desc,
            tone="formal",
            ai_output=cl_text,
            pdf_url=cover_letter_url,
        )
        db.add(cl_record)

    # 7. Ultimate: Interview Prep
    if body.tier == "ultimate":
        job_desc = body.job_description or "Software Engineer role"
        qa_list = await ai_service.generate_interview_prep(cv.ai_output, job_desc)

        ip_record = InterviewPrep(
            user_id=current_user.id,
            cv_id=cv.id,
            questions=qa_list,
        )
        db.add(ip_record)
        interview_prep_result = [InterviewQA(**qa) for qa in qa_list]

    await db.commit()
    logger.info(f"CV unlocked: id={cv_id} tier={body.tier} user={current_user.email}")

    return CVUnlockResponse(
        cv_id=cv.id,
        tier=body.tier,
        clean_pdf_url=clean_url,
        cover_letter_url=cover_letter_url,
        interview_prep=interview_prep_result,
    )


@router.get("/", response_model=list[CVListItem])
async def list_cvs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return all CVs for the current user, newest first."""
    result = await db.execute(
        select(CVGeneration)
        .where(CVGeneration.user_id == current_user.id)
        .order_by(CVGeneration.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{cv_id}", response_model=CVListItem)
async def get_cv(
    cv_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return a single CV detail."""
    result = await db.execute(
        select(CVGeneration).where(
            CVGeneration.id == cv_id,
            CVGeneration.user_id == current_user.id,
        )
    )
    cv = result.scalar_one_or_none()
    if not cv:
        raise NotFoundError("CV")
    return cv


# ── Tailor CV to Job Description ─────────────────────────────────────────────

from pydantic import BaseModel as _BaseModel

class TailorRequest(_BaseModel):
    job_url: str | None = None
    job_description: str | None = None


@router.post("/tailor/{cv_id}")
async def tailor_cv(
    cv_id: uuid.UUID,
    body: TailorRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Tailor an existing CV to a specific job description.
    Rewrites summary and experience bullets. Saves as new CV record.
    """
    # 1. Load original CV
    result = await db.execute(
        select(CVGeneration).where(
            CVGeneration.id == cv_id,
            CVGeneration.user_id == current_user.id,
        )
    )
    original_cv = result.scalar_one_or_none()
    if not original_cv:
        raise NotFoundError("CV")

    if not body.job_description:
        return {"error": "job_description is required"}

    # 2. Build tailor prompt
    import json
    tailor_prompt = (
        "Given this CV data and this job description, rewrite ONLY the "
        "professional summary and experience bullet points to better match the job. "
        "Keep all facts true — only rephrase and emphasize relevant skills. "
        "Return ONLY valid JSON with the SAME full structure as the input CV data, "
        "but with updated 'summary' and 'experience[].bullets' fields."
    )
    user_content = (
        f"CV DATA:\n{json.dumps(original_cv.ai_output, ensure_ascii=False, indent=2)}\n\n"
        f"JOB DESCRIPTION:\n{body.job_description}"
    )

    # 3. Call AI
    tailored_output = await ai_service._call_ai(tailor_prompt, user_content)
    tailored_data = ai_service._parse_json(tailored_output)

    # 4. Generate watermarked PDF
    pdf_bytes = await generate_cv_pdf(
        cv_data=tailored_data,
        template_name=original_cv.template or "cv_modern",
        watermark=True,
        language=original_cv.language,
    )
    filename = generate_filename(str(current_user.id), "tailored_watermarked")
    watermarked_url = await upload_pdf(pdf_bytes, filename)

    # 5. Save new CV record
    new_cv = CVGeneration(
        user_id=current_user.id,
        status="done",
        input_data={**original_cv.input_data, "tailored_from": str(cv_id), "job_url": body.job_url},
        ai_output=tailored_data,
        ats_score=tailored_data.get("ats_score", original_cv.ats_score),
        watermarked_pdf_url=watermarked_url,
        clean_pdf_url=None,
        tier=None,
        template=original_cv.template,
        language=original_cv.language,
    )
    db.add(new_cv)
    await db.commit()
    await db.refresh(new_cv)

    logger.info(f"CV tailored: original={cv_id} new={new_cv.id}")

    return {
        "cv_id": str(new_cv.id),
        "ai_output": tailored_data,
        "watermarked_pdf_url": watermarked_url,
    }
