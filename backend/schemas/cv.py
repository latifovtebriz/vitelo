"""CV request/response schemas."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ── Requests ──

class CVPersonalInfo(BaseModel):
    full_name: str = Field(max_length=255)
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


class CVGenerateRequest(BaseModel):
    personal: CVPersonalInfo
    experience: list[CVExperience] = []
    education: list[CVEducation] = []
    skills: list[str] = []
    languages: list[str] = []
    certifications: list[str] = []
    template: str = Field(default="modern", pattern="^(modern|minimal|professional)$")
    language: str = Field(default="en", pattern="^(en|az|tr)$")


# ── Responses ──

class CVResponse(BaseModel):
    id: uuid.UUID
    status: str
    ats_score: int | None = None
    pdf_url: str | None = None
    ai_output: dict[str, Any] | None = None
    template: str
    language: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CVListResponse(BaseModel):
    items: list[CVResponse]
    total: int
