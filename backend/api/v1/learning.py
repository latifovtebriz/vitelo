"""Unlimited Learning and Career Roadmaps API."""

import uuid
from typing import List, Optional
from pydantic import BaseModel

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user import User

router = APIRouter()

# ── Schemas ──

class CourseItem(BaseModel):
    id: str
    title: str
    provider: str
    category: str
    rating: float
    duration: str
    level: str
    url: str
    color: str
    description: str


class RoadmapStep(BaseModel):
    id: str
    title: str
    description: str
    skills: List[str]
    recommended_course_id: Optional[str] = None


class CareerRoadmap(BaseModel):
    role_key: str
    role_title: str
    description: str
    icon: str
    steps: List[RoadmapStep]


# ── Curated Catalog ──

CURATED_COURSES = [
    {
        "id": "c1",
        "title": "Meta Front-End Developer Professional Certificate",
        "provider": "Coursera (Meta)",
        "category": "Frontend",
        "rating": 4.8,
        "duration": "40 hours",
        "level": "Beginner to Advanced",
        "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
        "color": "from-blue-500 to-indigo-600",
        "description": "Comprehensive curriculum covering React, modern JavaScript, UI/UX principles, and version control."
    },
    {
        "id": "c2",
        "title": "Google Cloud DevOps & SRE Professional Certificate",
        "provider": "Google Cloud",
        "category": "DevOps",
        "rating": 4.9,
        "duration": "35 hours",
        "level": "Intermediate",
        "url": "https://www.coursera.org/professional-certificates/google-cloud-devops-and-sre",
        "color": "from-amber-500 to-orange-600",
        "description": "Learn Kubernetes orchestration, Terraform Infrastructure as Code, CI/CD, and system observability."
    },
    {
        "id": "c3",
        "title": "System Design Masterclass & Large Scale Distributed Architecture",
        "provider": "ByteByteGo",
        "category": "Architecture",
        "rating": 4.9,
        "duration": "25 hours",
        "level": "Senior / Lead",
        "url": "https://bytebytego.com/",
        "color": "from-purple-500 to-violet-600",
        "description": "Master CQRS, event-driven architectures, caching strategies, rate limiting, and database sharding."
    },
    {
        "id": "c4",
        "title": "Python & FastAPI Production Engineering with Async Architecture",
        "provider": "Udemy",
        "category": "Backend",
        "rating": 4.7,
        "duration": "20 hours",
        "level": "Intermediate",
        "url": "https://www.udemy.com/",
        "color": "from-emerald-500 to-teal-600",
        "description": "Build asynchronous REST APIs, SQLAlchemy 2.0 ORM, Celery background queues, and Dockerized microservices."
    },
    {
        "id": "c5",
        "title": "CS50's Introduction to Computer Science",
        "provider": "Harvard University (edX)",
        "category": "Foundations",
        "rating": 4.9,
        "duration": "60 hours",
        "level": "All Levels",
        "url": "https://pll.harvard.edu/course/cs50-introduction-computer-science",
        "color": "from-rose-500 to-red-600",
        "description": "The gold standard of computer science foundations: algorithms, data structures, memory management, and security."
    }
]

CAREER_ROADMAPS = [
    {
        "role_key": "frontend",
        "role_title": "Senior Frontend Engineer",
        "description": "Master modern client-side architectures, TypeScript, performance profiling, and design systems.",
        "icon": "Layout",
        "steps": [
            {
                "id": "fe_1",
                "title": "1. Advanced TypeScript & Modern React",
                "description": "Generics, utility types, React 19 server components, and concurrent rendering.",
                "skills": ["TypeScript", "React.js", "Next.js", "Zustand"],
                "recommended_course_id": "c1"
            },
            {
                "id": "fe_2",
                "title": "2. Performance Profiling & Web Vitals",
                "description": "Tree-shaking, lazy loading, bundle analysis, and LCP/FID/CLS optimization.",
                "skills": ["Vite", "Lighthouse", "Core Web Vitals", "Memory Profiling"],
                "recommended_course_id": "c1"
            },
            {
                "id": "fe_3",
                "title": "3. Testing & Design System Governance",
                "description": "Component testing with Vitest/Playwright and accessible Tailwind component libraries.",
                "skills": ["Vitest", "Playwright", "TailwindCSS", "Storybook"],
                "recommended_course_id": "c1"
            }
        ]
    },
    {
        "role_key": "backend",
        "role_title": "Backend & Cloud Architect",
        "description": "Design high-throughput APIs, distributed caching, messaging queues, and database scaling.",
        "icon": "Server",
        "steps": [
            {
                "id": "be_1",
                "title": "1. Async Microservices & High-Concurrency APIs",
                "description": "Async/await paradigms, connection pooling, and RESTful/gRPC protocol design.",
                "skills": [".NET Core / C#", "Python FastAPI", "gRPC", "PostgreSQL"],
                "recommended_course_id": "c4"
            },
            {
                "id": "be_2",
                "title": "2. Distributed Caching & Event Messaging",
                "description": "Pub/Sub architectures, Redis caching layers, message queues, and worker offloading.",
                "skills": ["Redis", "RabbitMQ", "Kafka", "Celery"],
                "recommended_course_id": "c3"
            },
            {
                "id": "be_3",
                "title": "3. Cloud Infrastructure & Container Orchestration",
                "description": "Containerizing services, managing Kubernetes clusters, and IaC provisioning.",
                "skills": ["Docker", "Kubernetes", "Terraform", "Azure / AWS"],
                "recommended_course_id": "c2"
            }
        ]
    },
    {
        "role_key": "devops",
        "role_title": "DevOps & SRE Specialist",
        "description": "Automate CI/CD pipelines, container orchestration, multi-cloud infrastructure, and observability.",
        "icon": "Cloud",
        "steps": [
            {
                "id": "do_1",
                "title": "1. Linux Internals & Containerization",
                "description": "Kernel namespaces, cgroups, multi-stage Docker builds, and network isolation.",
                "skills": ["Linux", "Bash", "Docker", "Security Hardening"],
                "recommended_course_id": "c2"
            },
            {
                "id": "do_2",
                "title": "2. Kubernetes & Helm Deployment",
                "description": "StatefulSets, Ingress controllers, Helm charts, and service meshes.",
                "skills": ["Kubernetes", "Helm", "Istio", "ArgoCD"],
                "recommended_course_id": "c2"
            },
            {
                "id": "do_3",
                "title": "3. Observability & SRE Metrics",
                "description": "SLO/SLA dashboards, Prometheus metrics scraping, and Grafana alerting.",
                "skills": ["Prometheus", "Grafana", "OpenTelemetry", "ELK Stack"],
                "recommended_course_id": "c2"
            }
        ]
    }
]


@router.get("/courses", response_model=List[CourseItem])
async def list_recommended_courses():
    """List curated high-impact courses for career growth."""
    return CURATED_COURSES


@router.get("/roadmaps", response_model=List[CareerRoadmap])
async def list_career_roadmaps():
    """List role-specific milestone roadmaps."""
    return CAREER_ROADMAPS
