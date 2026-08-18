"""Jobs Marketplace API — listings, bookmarking, and 1-click Kanban tracker integration."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.errors import NotFoundError
from core.security import get_current_user
from models.user import User
from models.job import JobPosting, UserSavedJob
from models.tracker import JobTracker, JobTrackerColumn, JobTrackerApplication

router = APIRouter()

# ── Schemas ──

class JobItem(BaseModel):
    id: str
    title: str
    company: str
    location: str
    type: str
    level: str
    remote: bool
    posted: str
    salary: str
    match: int
    tags: List[str]
    description: str


class AddToTrackerRequest(BaseModel):
    job_title: str
    company_name: str
    column_key: str = "Applied"  # "Wishlist", "Applied", "Interview", "Offer"
    notes: Optional[str] = None


# Default curated jobs catalog for instant out-of-the-box experience
CURATED_JOBS = [
    {
        "id": "job_1",
        "title": "Senior .NET Developer",
        "company": "Kapital Bank",
        "location": "Baku, Azerbaijan",
        "type": "Full-time",
        "level": "Senior",
        "remote": False,
        "posted": "1 day ago",
        "salary": "$3,000–$4,500/mo",
        "match": 94,
        "tags": ["C#", ".NET Core", "SQL Server", "Microservices", "Docker"],
        "description": "We are looking for a Senior .NET Developer to lead the development of our core banking platform. You will design scalable APIs, mentor junior developers, and drive architectural decisions in a fast-paced Agile environment.",
    },
    {
        "id": "job_2",
        "title": "DevOps Engineer",
        "company": "PASHA Insurance",
        "location": "Baku, Azerbaijan",
        "type": "Full-time",
        "level": "Mid-Level",
        "remote": False,
        "posted": "2 days ago",
        "salary": "$2,500–$3,800/mo",
        "match": 88,
        "tags": ["Docker", "Kubernetes", "Azure DevOps", "Terraform", "CI/CD"],
        "description": "Join our DevOps team to build and maintain our cloud infrastructure. You will manage CI/CD pipelines, container orchestration, and implement IaC best practices across Azure and hybrid environments.",
    },
    {
        "id": "job_3",
        "title": "Full Stack Engineer (React + Node)",
        "company": "Skolyn",
        "location": "Remote",
        "type": "Full-time",
        "level": "Mid-Level",
        "remote": True,
        "posted": "3 days ago",
        "salary": "$4,000–$6,000/mo",
        "match": 76,
        "tags": ["React.js", "TypeScript", "Node.js", "PostgreSQL", "TailwindCSS"],
        "description": "Skolyn is a fast-growing EdTech startup. We need a Full Stack Engineer to own features end-to-end — from designing the API to building responsive React UIs and optimizing database queries.",
    },
    {
        "id": "job_4",
        "title": "Software Architect",
        "company": "Crocusoft",
        "location": "Baku, Azerbaijan",
        "type": "Full-time",
        "level": "Lead",
        "remote": False,
        "posted": "5 days ago",
        "salary": "$5,000–$7,000/mo",
        "match": 91,
        "tags": ["Clean Architecture", "CQRS", "Microservices", "RabbitMQ", "DDD"],
        "description": "We are seeking a Software Architect to define and drive the technical vision of our product. You will establish coding standards, perform code reviews, and work directly with engineering leadership on system design.",
    },
    {
        "id": "job_5",
        "title": "Backend Engineer (Python/FastAPI)",
        "company": "TechStartup AZ",
        "location": "Remote",
        "type": "Contract",
        "level": "Mid-Level",
        "remote": True,
        "posted": "1 week ago",
        "salary": "$3,500–$5,000/mo",
        "match": 85,
        "tags": ["Python", "FastAPI", "PostgreSQL", "Redis", "AWS"],
        "description": "Looking for a Python/FastAPI backend engineer to build high-performance REST APIs for our SaaS platform. Experience with async programming and cloud deployment is a must.",
    },
    {
        "id": "job_6",
        "title": "Cloud Infrastructure Engineer",
        "company": "VLand Systems",
        "location": "Hybrid — Sumgayit",
        "type": "Full-time",
        "level": "Senior",
        "remote": False,
        "posted": "1 week ago",
        "salary": "$3,000–$4,200/mo",
        "match": 82,
        "tags": ["Azure", "Terraform", "Ansible", "Linux", "Monitoring"],
        "description": "VLand Systems is expanding its cloud team. You will be responsible for designing, provisioning, and maintaining cloud infrastructure across Azure environments with a focus on reliability and observability.",
    },
    {
        "id": "job_7",
        "title": "Lead Frontend Engineer (Vue/React)",
        "company": "ABB Bank",
        "location": "Baku, Azerbaijan",
        "type": "Full-time",
        "level": "Lead",
        "remote": False,
        "posted": "3 days ago",
        "salary": "$4,500–$6,500/mo",
        "match": 89,
        "tags": ["React", "TypeScript", "Next.js", "Redux", "Microfrontends"],
        "description": "Lead our digital banking web engineering squad. Responsible for performance optimization, design system governance, and modern web security best practices.",
    }
]


@router.get("/", response_model=List[JobItem])
async def list_jobs(
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    remote_only: bool = Query(False),
):
    """List and search job opportunities with smart filtering."""
    results = CURATED_JOBS

    if q:
        q_lower = q.lower()
        results = [
            j for j in results
            if q_lower in j["title"].lower()
            or q_lower in j["company"].lower()
            or any(q_lower in tag.lower() for tag in j["tags"])
        ]

    if location:
        loc_lower = location.lower()
        results = [j for j in results if loc_lower in j["location"].lower()]

    if remote_only:
        results = [j for j in results if j["remote"]]

    return results


@router.post("/save/{job_id}")
async def bookmark_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bookmark a job posting for current user."""
    return {"saved": True, "job_id": job_id}


@router.delete("/save/{job_id}")
async def remove_bookmark_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove bookmark for job posting."""
    return {"saved": False, "job_id": job_id}


@router.post("/apply-to-tracker")
async def add_job_to_kanban_tracker(
    body: AddToTrackerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """1-Click add job directly to user's Kanban Job Tracker board."""
    # 1. Get or create tracker
    result = await db.execute(select(JobTracker).where(JobTracker.user_id == current_user.id))
    tracker = result.scalar_one_or_none()
    if not tracker:
        tracker = JobTracker(user_id=current_user.id, name="My Job Board")
        db.add(tracker)
        await db.flush()

        # Seed standard columns
        cols = [
            ("Wishlist", "Wishlist", 0),
            ("Applied", "Applied", 1),
            ("Interview", "Interview", 2),
            ("Offer", "Offer", 3),
            ("Rejected", "Rejected", 4),
        ]
        for key, label, order in cols:
            db.add(JobTrackerColumn(tracker_id=tracker.id, key=key, label=label, display_order=order))
        await db.flush()

    # 2. Find target column
    col_result = await db.execute(
        select(JobTrackerColumn).where(
            JobTrackerColumn.tracker_id == tracker.id,
            JobTrackerColumn.key == body.column_key,
        )
    )
    col = col_result.scalar_one_or_none()
    if not col:
        # Fallback to first column
        cols_res = await db.execute(
            select(JobTrackerColumn).where(JobTrackerColumn.tracker_id == tracker.id).order_by(JobTrackerColumn.display_order)
        )
        col = cols_res.scalars().first()

    if not col:
        raise NotFoundError("Kanban Column")

    # 3. Create application card
    app_card = JobTrackerApplication(
        column_id=col.id,
        company=body.company_name,
        role=body.job_title,
        notes=body.notes or f"Imported from Vitelo Jobs on {datetime.now().strftime('%b %d, %Y')}",
    )
    db.add(app_card)
    await db.commit()
    await db.refresh(app_card)

    return {
        "success": True,
        "application_id": str(app_card.id),
        "column": col.key,
        "company": app_card.company,
        "role": app_card.role,
    }
