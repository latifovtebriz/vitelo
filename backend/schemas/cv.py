"""CV request/response Pydantic schemas — comprehensive enterprise implementation."""

import uuid
from datetime import datetime
from typing import Any, List, Optional, Union, Dict

from pydantic import BaseModel, Field


# ── Sub-models for request ──

class CVPersonalInfo(BaseModel):
    name: str = Field(max_length=255)
    headline: Optional[str] = Field(default=None, max_length=255)  # e.g. "Software and DevOps Engineer"
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None


class CVExperience(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None  # None or "Present"
    is_current: bool = False
    description: str = ""
    achievements: List[str] = []


class CVEducation(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None


class CVProject(BaseModel):
    title: str  # e.g. "IAC 2025 Sydney"
    role: Optional[str] = None  # e.g. "Scientific Researcher – The role of Software Architectures in Space Systems"
    period: Optional[str] = None  # e.g. "Jan 2025 – Sep 2025"
    description: Optional[str] = None
    project_url: Optional[str] = None


class CVVolunteering(BaseModel):
    organization: str  # e.g. "EUROPEAN SOLIDARITY CORPS (ESC)"
    role: str  # e.g. "Leader Youth Worker & International Volunteer"
    location: Optional[str] = None  # e.g. "Ankara, Türkiye"
    period: Optional[str] = None  # e.g. "Aug 2025 – Sep 2025"
    description: Optional[str] = None


class CVCategorizedSkills(BaseModel):
    languages_frameworks: List[str] = []  # C#, .NET Core, ASP.NET MVC, Web API, JavaScript, React.js...
    devops_cloud: List[str] = []          # Azure DevOps, Docker, Kubernetes, Terraform, Prometheus...
    databases: List[str] = []             # Microsoft SQL Server, PostgreSQL, Redis, Oracle...
    concepts_tools: List[str] = []        # Microservices, Clean Architecture, CQRS, RabbitMQ, Git...
    soft_skills: List[str] = []           # Problem Solving, Analytical Thinking, Communication...


class CVLanguageItem(BaseModel):
    name: str
    proficiency: str = "Professional"  # Native, Fluent, Professional, Intermediate, Basic


# ── Main Request ──

class CVGenerateRequest(BaseModel):
    personal: CVPersonalInfo
    summary: Optional[str] = None
    experience: List[CVExperience] = []
    education: List[CVEducation] = []
    projects: List[CVProject] = []
    volunteering: List[CVVolunteering] = []
    # Accept either categorized skills or a flat list of strings
    skills: Union[CVCategorizedSkills, List[str], dict] = []
    languages: Union[List[CVLanguageItem], List[str]] = []
    certifications: List[str] = []
    target_job: Optional[str] = None           # Optional: "Senior Backend Engineer"
    template: str = Field(default="modern", pattern="^(modern|minimal)$")
    language: str = Field(default="en", pattern="^(en|az|tr)$")


# ── Unlock Request ──

class CVUnlockRequest(BaseModel):
    tier: str = Field(pattern="^(basic|pro|ultimate)$")
    job_description: Optional[str] = None     # Needed for cover letter + interview prep


# ── AI Assistants Requests & Responses ──

class BulletEnhanceRequest(BaseModel):
    bullet: str
    job_title: Optional[str] = ""
    company: Optional[str] = ""


class BulletEnhanceResponse(BaseModel):
    bullets: List[str]


class SummaryGenerateRequest(BaseModel):
    headline: Optional[str] = ""
    skills: List[str] = []
    experiences: List[Dict[str, Any]] = []


class SummaryItem(BaseModel):
    type: str
    title: str
    text: str


class SummaryGenerateResponse(BaseModel):
    summaries: List[SummaryItem]


class ResumeParseRequest(BaseModel):
    text: str


class JobMatchRequest(BaseModel):
    cv_id: Optional[uuid.UUID] = None
    cv_data: Optional[Dict[str, Any]] = None
    job_description: str


class JobMatchResponse(BaseModel):
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    gap_analysis: str
    recommendation: str


# ── Responses ──

class CVGenerateResponse(BaseModel):
    cv_id: uuid.UUID
    ats_score: Optional[int] = None
    ats_tips: List[str] = []
    watermarked_pdf_url: str
    ai_output: dict[str, Any]


class InterviewQA(BaseModel):
    q: str
    a: str


class CVUnlockResponse(BaseModel):
    cv_id: uuid.UUID
    tier: str
    clean_pdf_url: str
    cover_letter_url: Optional[str] = None
    interview_prep: Optional[List[InterviewQA]] = None


class CVListItem(BaseModel):
    id: uuid.UUID
    status: str
    tier: Optional[str] = None
    ats_score: Optional[int] = None
    watermarked_pdf_url: Optional[str] = None
    clean_pdf_url: Optional[str] = None
    created_at: datetime
    title: Optional[str] = None
    template: Optional[str] = None

    model_config = {"from_attributes": True}
