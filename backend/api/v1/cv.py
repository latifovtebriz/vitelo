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
from models.cv import (
    CVGeneration,
    CVPersonalInfo,
    CVExperience,
    CVExperienceHighlight,
    CVEducation,
    CVProject,
    CVCertification,
    CVSkill,
    CVLanguage,
    CVCustomSection,
)
from models.interview_prep import InterviewPrep
from models.user import User
from schemas.cv import (
    CVGenerateRequest,
    CVGenerateResponse,
    CVListItem,
    CVUnlockRequest,
    CVUnlockResponse,
    InterviewQA,
    BulletEnhanceRequest,
    BulletEnhanceResponse,
    SummaryGenerateRequest,
    SummaryGenerateResponse,
    ResumeParseRequest,
    JobMatchRequest,
    JobMatchResponse,
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
    Saves complete relational graph into PostgreSQL.
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

    # 5. Save main CV Generation record
    cv_title = body.personal.headline or f"{body.personal.name}'s Resume"
    cv = CVGeneration(
        user_id=current_user.id,
        title=cv_title,
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
    await db.flush()  # Generate cv.id

    # 5a. Save Personal Info
    p_info = ai_output.get("personal", {})
    personal_record = CVPersonalInfo(
        cv_id=cv.id,
        full_name=p_info.get("name") or body.personal.name,
        email=p_info.get("email") or body.personal.email,
        phone=p_info.get("phone") or body.personal.phone,
        location=p_info.get("location") or body.personal.location,
        linkedin_url=p_info.get("linkedin") or body.personal.linkedin,
        portfolio_url=p_info.get("portfolio") or body.personal.portfolio or body.personal.github,
        summary=ai_output.get("summary") or body.summary or body.personal.summary,
    )
    db.add(personal_record)

    # 5b. Save Experiences & Highlights
    exp_list = ai_output.get("experience", []) or input_data.get("experience", [])
    for idx, exp_data in enumerate(exp_list):
        exp_record = CVExperience(
            cv_id=cv.id,
            job_title=exp_data.get("title") or exp_data.get("job_title", "Software Engineer"),
            company=exp_data.get("company", ""),
            location=exp_data.get("location"),
            start_date=exp_data.get("period", "").split("–")[0].strip() if "–" in exp_data.get("period", "") else exp_data.get("start_date", ""),
            end_date=exp_data.get("period", "").split("–")[1].strip() if "–" in exp_data.get("period", "") else exp_data.get("end_date"),
            is_current=exp_data.get("is_current", False) or "Present" in str(exp_data.get("period", "")),
            display_order=idx,
        )
        db.add(exp_record)
        await db.flush()

        bullets = exp_data.get("bullets", []) or exp_data.get("achievements", [])
        if not bullets and exp_data.get("description"):
            bullets = [exp_data.get("description")]

        for b_idx, bullet in enumerate(bullets):
            if bullet:
                db.add(CVExperienceHighlight(
                    experience_id=exp_record.id,
                    highlight_text=bullet,
                    display_order=b_idx,
                ))

    # 5c. Save Education
    edu_list = ai_output.get("education", []) or input_data.get("education", [])
    for idx, edu_data in enumerate(edu_list):
        edu_record = CVEducation(
            cv_id=cv.id,
            institution=edu_data.get("institution", ""),
            degree=edu_data.get("degree", ""),
            graduation_year=str(edu_data.get("year") or edu_data.get("graduation_year", "")),
            gpa=str(edu_data.get("gpa")) if edu_data.get("gpa") else None,
            display_order=idx,
        )
        db.add(edu_record)

    # 5d. Save Projects & Research
    proj_list = ai_output.get("projects", []) or input_data.get("projects", [])
    for idx, proj_data in enumerate(proj_list):
        db.add(CVProject(
            cv_id=cv.id,
            title=proj_data.get("title", ""),
            role=proj_data.get("role"),
            description=proj_data.get("description", "") or proj_data.get("role", ""),
            project_url=proj_data.get("url") or proj_data.get("project_url"),
            display_order=idx,
        ))

    # 5e. Save Skills
    skills_obj = ai_output.get("skills", {})
    skill_order = 0
    if isinstance(skills_obj, dict):
        for cat_name, skill_items in skills_obj.items():
            if isinstance(skill_items, list):
                for skill_name in skill_items:
                    if skill_name:
                        db.add(CVSkill(
                            cv_id=cv.id,
                            name=str(skill_name).strip(),
                            category=cat_name,
                            display_order=skill_order,
                        ))
                        skill_order += 1
    elif isinstance(skills_obj, list):
        for s in skills_obj:
            if s:
                db.add(CVSkill(cv_id=cv.id, name=str(s).strip(), category="General", display_order=skill_order))
                skill_order += 1

    # 5f. Save Languages
    lang_list = ai_output.get("languages", []) or input_data.get("languages", [])
    if isinstance(skills_obj, dict) and skills_obj.get("languages"):
        for l in skills_obj["languages"]:
            if l:
                db.add(CVLanguage(cv_id=cv.id, name=str(l).strip(), proficiency="Professional"))
    for l_item in lang_list:
        if isinstance(l_item, dict):
            db.add(CVLanguage(cv_id=cv.id, name=l_item.get("name", ""), proficiency=l_item.get("proficiency", "Professional")))
        elif isinstance(l_item, str) and l_item:
            db.add(CVLanguage(cv_id=cv.id, name=l_item, proficiency="Professional"))

    # 5g. Save Volunteering & Leadership as Custom Sections
    vol_list = ai_output.get("volunteering", []) or input_data.get("volunteering", [])
    for idx, vol_data in enumerate(vol_list):
        org = vol_data.get("organization", "")
        role = vol_data.get("role", "")
        loc = vol_data.get("location", "")
        period = vol_data.get("period", "")
        desc = vol_data.get("description", "")
        full_content = f"{role} at {org}"
        if loc:
            full_content += f" ({loc})"
        if period:
            full_content += f" | {period}"
        if desc:
            full_content += f" — {desc}"
        db.add(CVCustomSection(
            cv_id=cv.id,
            section_title="Volunteering & Leadership",
            content=full_content,
            display_order=idx,
        ))

    # 5h. Save Certifications
    certs = ai_output.get("certifications", []) or input_data.get("certifications", [])
    for idx, cert_name in enumerate(certs):
        if cert_name:
            db.add(CVCertification(
                cv_id=cv.id,
                name=str(cert_name).strip(),
                display_order=idx,
            ))

    await db.commit()
    await db.refresh(cv)

    logger.info(f"CV generated & stored in relational database: id={cv.id} ats_score={ats_score}")

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


@router.post("/ai/enhance-bullet", response_model=BulletEnhanceResponse)
async def enhance_bullet(body: BulletEnhanceRequest):
    """AI endpoint to convert rough bullet into 3 action-verb + metric driven options."""
    bullets = await ai_service.enhance_bullet_point(
        raw_bullet=body.bullet,
        job_title=body.job_title or "",
        company=body.company or "",
    )
    return BulletEnhanceResponse(bullets=bullets)


@router.post("/ai/generate-summary", response_model=SummaryGenerateResponse)
async def generate_summary(body: SummaryGenerateRequest):
    """AI endpoint to generate 3 tailored professional summary options."""
    summaries = await ai_service.generate_summary_options(
        headline=body.headline or "",
        skills=body.skills or [],
        experiences=body.experiences or [],
    )
    return SummaryGenerateResponse(summaries=summaries)


@router.post("/ai/parse-resume")
async def parse_resume(body: ResumeParseRequest):
    """AI endpoint to parse raw resume text into structured builder data."""
    parsed_data = await ai_service.parse_resume_text(body.text)
    return parsed_data


@router.post("/ai/match-job", response_model=JobMatchResponse)
async def match_job_description(body: JobMatchRequest, db: AsyncSession = Depends(get_db)):
    """AI endpoint to match a CV against a job description and return missing skills/gaps."""
    cv_data = body.cv_data
    if not cv_data and body.cv_id:
        result = await db.execute(select(CVGeneration).where(CVGeneration.id == body.cv_id))
        cv_record = result.scalar_one_or_none()
        if cv_record:
            cv_data = cv_record.ai_output
    if not cv_data:
        cv_data = {}
    analysis = await ai_service.analyze_job_match(cv_data=cv_data, job_desc=body.job_description)
    return JobMatchResponse(
        match_score=analysis.get("match_score", 75),
        matched_skills=analysis.get("matched_skills", []),
        missing_skills=analysis.get("missing_skills", []),
        gap_analysis=analysis.get("gap_analysis", ""),
        recommendation=analysis.get("recommendation", "")
    )


# ── Delete CV ─────────────────────────────────────────────────────────────────

@router.delete("/{cv_id}", status_code=204)
async def delete_cv(
    cv_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Permanently delete a CV and all its relational data."""
    result = await db.execute(
        select(CVGeneration).where(
            CVGeneration.id == cv_id,
            CVGeneration.user_id == current_user.id,
        )
    )
    cv = result.scalar_one_or_none()
    if not cv:
        raise NotFoundError("CV")
    await db.delete(cv)
    await db.commit()
    return None


# ── Rename CV ─────────────────────────────────────────────────────────────────

class CVRenameRequest(_BaseModel):
    title: str


@router.patch("/{cv_id}/title", response_model=CVListItem)
async def rename_cv(
    cv_id: uuid.UUID,
    body: CVRenameRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Rename a CV."""
    result = await db.execute(
        select(CVGeneration).where(
            CVGeneration.id == cv_id,
            CVGeneration.user_id == current_user.id,
        )
    )
    cv = result.scalar_one_or_none()
    if not cv:
        raise NotFoundError("CV")
    cv.title = body.title.strip()[:100]
    await db.commit()
    await db.refresh(cv)
    return cv


# ── Deep ATS Diagnostics Endpoint ───────────────────────────────────────────

class ATSDiagnosticsRequest(_BaseModel):
    cv_id: uuid.UUID | None = None
    cv_data: dict | None = None
    job_description: str | None = None


@router.post("/ai/ats-diagnostics")
async def get_ats_diagnostics(
    body: ATSDiagnosticsRequest,
    db: AsyncSession = Depends(get_db),
):
    """Deep ATS Diagnostic Scan evaluating 5 core dimensions, missing keywords, and action items."""
    cv_data = body.cv_data
    if not cv_data and body.cv_id:
        result = await db.execute(select(CVGeneration).where(CVGeneration.id == body.cv_id))
        cv_record = result.scalar_one_or_none()
        if cv_record:
            cv_data = cv_record.ai_output
    if not cv_data:
        cv_data = {}
    report = await ai_service.diagnose_ats_deep(cv_data=cv_data, job_desc=body.job_description or "")
    return report


# ── Public Shareable Web CV Endpoint ─────────────────────────────────────────

@router.get("/public/{cv_id}")
async def get_public_cv(
    cv_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Fetch public CV details for shareable web CV view (no auth required)."""
    result = await db.execute(select(CVGeneration).where(CVGeneration.id == cv_id))
    cv = result.scalar_one_or_none()
    if not cv:
        raise NotFoundError("CV not found or link has expired")

    return {
        "id": str(cv.id),
        "title": cv.title,
        "template": cv.template or "modern",
        "ats_score": cv.ats_score,
        "created_at": cv.created_at.isoformat() if cv.created_at else None,
        "clean_pdf_url": cv.clean_pdf_url,
        "watermarked_pdf_url": cv.watermarked_pdf_url,
        "cv_data": cv.ai_output or cv.input_data or {},
    }


# ── AI CV Translation & LinkedIn Optimization Endpoints ──────────────────────

class CVTranslateRequest(_BaseModel):
    cv_id: uuid.UUID | None = None
    cv_data: dict | None = None
    target_language: str = "en"  # "en", "az", "tr", "de", "ru"


@router.post("/ai/translate")
async def translate_cv_endpoint(
    body: CVTranslateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Translate CV to target language using Gemini AI with technical preservation."""
    cv_data = body.cv_data
    if not cv_data and body.cv_id:
        result = await db.execute(select(CVGeneration).where(CVGeneration.id == body.cv_id))
        cv_record = result.scalar_one_or_none()
        if cv_record:
            cv_data = cv_record.ai_output or cv_record.input_data
    if not cv_data:
        cv_data = {}
    translated = await ai_service.translate_cv(cv_data=cv_data, target_language=body.target_language)
    return {"translated_cv": translated, "target_language": body.target_language}


class LinkedInOptimizeRequest(_BaseModel):
    cv_id: uuid.UUID | None = None
    cv_data: dict | None = None


@router.post("/ai/linkedin-optimize")
async def optimize_linkedin_endpoint(
    body: LinkedInOptimizeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate high-conversion LinkedIn headline, About section, and experience bullets from CV."""
    cv_data = body.cv_data
    if not cv_data and body.cv_id:
        result = await db.execute(select(CVGeneration).where(CVGeneration.id == body.cv_id))
        cv_record = result.scalar_one_or_none()
        if cv_record:
            cv_data = cv_record.ai_output or cv_record.input_data
    if not cv_data:
        cv_data = {}
    optimized = await ai_service.optimize_linkedin_profile(cv_data=cv_data)
    return optimized


