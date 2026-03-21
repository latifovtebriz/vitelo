"""CV request/response Pydantic schemas — full implementation."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ── Sub-models for request ──

class CVPersonalInfo(BaseModel):
    name: str = Field(max_length=255)
    email: str
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    website: str | None = None


class CVExperience(BaseModel):
    job_title: str
    company: str
    start_date: str
    end_date: str | None = None  # None = "Present"
    description: str
    achievements: list[str] = []


class CVEducation(BaseModel):
    degree: str
    institution: str
    graduation_year: str
    gpa: str | None = None


# ── Main Request ──

class CVGenerateRequest(BaseModel):
    personal: CVPersonalInfo
    experience: list[CVExperience] = []
    education: list[CVEducation] = []
    skills: list[str] = []
    languages: list[str] = []
    certifications: list[str] = []
    target_job: str | None = None           # Optional: "Senior Backend Engineer at Google"
    template: str = Field(default="modern", pattern="^(modern|minimal)$")
    language: str = Field(default="en", pattern="^(en|az|tr)$")


# ── Unlock Request ──

class CVUnlockRequest(BaseModel):
    tier: str = Field(pattern="^(basic|pro|ultimate)$")
    job_description: str | None = None     # Needed for cover letter + interview prep


# ── Responses ──

class CVGenerateResponse(BaseModel):
    cv_id: uuid.UUID
    ats_score: int | None = None
    ats_tips: list[str] = []
    watermarked_pdf_url: str
    ai_output: dict[str, Any]


class InterviewQA(BaseModel):
    q: str
    a: str


class CVUnlockResponse(BaseModel):
    cv_id: uuid.UUID
    tier: str
    clean_pdf_url: str
    cover_letter_url: str | None = None
    interview_prep: list[InterviewQA] | None = None


class CVListItem(BaseModel):
    id: uuid.UUID
    status: str
    tier: str | None
    ats_score: int | None
    watermarked_pdf_url: str | None
    clean_pdf_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
