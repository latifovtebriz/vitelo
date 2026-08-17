"""Salary Analyzer & Negotiation Coach API router with Gemini AI."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user import User
from services.ai_service import ai_service

logger = logging.getLogger("vitelo.salary")
router = APIRouter()


# ── Schemas ──

class SalaryAnalyzeRequest(BaseModel):
    job_title: str
    location: str = "Global"
    seniority: str = "Mid-Level"  # Junior, Mid-Level, Senior, Lead, Principal
    company_name: Optional[str] = None
    years_experience: Optional[int] = None
    current_salary: Optional[float] = None
    currency: str = "USD"


class SalaryRange(BaseModel):
    currency: str
    minimum: int
    median: int
    maximum: int
    percentile_25: int
    percentile_75: int


class SalaryBenchmark(BaseModel):
    region: str
    salary_range: SalaryRange
    demand_level: str  # High, Medium, Low
    growth_outlook: str  # Growing, Stable, Declining


class SalaryAnalyzeResponse(BaseModel):
    job_title: str
    location: str
    seniority: str
    benchmarks: List[SalaryBenchmark]
    market_insights: List[str]
    top_paying_skills: List[str]


class NegotiationRequest(BaseModel):
    job_title: str
    company_name: Optional[str] = None
    current_offer: float
    desired_salary: float
    currency: str = "USD"
    your_strengths: Optional[List[str]] = None
    context: Optional[str] = None  # "new job", "promotion", "annual review"


class NegotiationScript(BaseModel):
    scenario: str
    opening_line: str
    key_arguments: List[str]
    counter_offer_strategy: str
    closing_line: str


class NegotiationResponse(BaseModel):
    overall_strategy: str
    scripts: List[NegotiationScript]
    email_template: str
    tips: List[str]


# ── AI Prompts ──

SALARY_ANALYSIS_PROMPT = """You are a global compensation analyst with deep knowledge of tech salary markets worldwide.
Analyze the salary data for the given role, location, and seniority level.

Output ONLY valid JSON matching this schema:
{
  "benchmarks": [
    {
      "region": "Primary Market (as specified)",
      "salary_range": {
        "currency": "USD",
        "minimum": 50000,
        "median": 75000,
        "maximum": 110000,
        "percentile_25": 60000,
        "percentile_75": 95000
      },
      "demand_level": "High",
      "growth_outlook": "Growing"
    }
  ],
  "market_insights": [
    "Key insight about this role's market demand",
    "Trend observation",
    "Regional comparison note"
  ],
  "top_paying_skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"]
}

Provide 2-3 benchmarks (primary market, global remote, and a comparison market).
Use realistic 2024-2025 salary data. All salaries in the requested currency."""

NEGOTIATION_PROMPT = """You are an elite career negotiation coach who has helped thousands of professionals increase their compensation by 15-40%.
Create a personalized negotiation strategy with scripts the candidate can use word-for-word.

Output ONLY valid JSON:
{
  "overall_strategy": "High-level approach summary",
  "scripts": [
    {
      "scenario": "Initial Counter-Offer Conversation",
      "opening_line": "Exact words to open with",
      "key_arguments": ["Argument 1 with data", "Argument 2"],
      "counter_offer_strategy": "What to do if they push back",
      "closing_line": "Exact words to close"
    },
    {
      "scenario": "Follow-Up Email After Verbal Discussion",
      "opening_line": "Email opening",
      "key_arguments": ["Point 1", "Point 2"],
      "counter_offer_strategy": "If they say budget is fixed",
      "closing_line": "Email closing"
    }
  ],
  "email_template": "Full professional negotiation email template with placeholders",
  "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"]
}"""


@router.post("/analyze", response_model=SalaryAnalyzeResponse)
async def analyze_salary(
    body: SalaryAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze market salary ranges for a given role, location, and seniority level."""
    user_prompt = (
        f"Role: {body.job_title}\n"
        f"Location: {body.location}\n"
        f"Seniority: {body.seniority}\n"
        f"Years Experience: {body.years_experience or 'Not specified'}\n"
        f"Company: {body.company_name or 'General market'}\n"
        f"Currency: {body.currency}"
    )

    try:
        raw = await ai_service._call_ai(SALARY_ANALYSIS_PROMPT, user_prompt)
        parsed = ai_service._parse_json(raw)
    except Exception as e:
        logger.error(f"Salary analysis AI error: {e}")
        parsed = {
            "benchmarks": [{
                "region": body.location,
                "salary_range": {
                    "currency": body.currency,
                    "minimum": 45000, "median": 72000, "maximum": 120000,
                    "percentile_25": 55000, "percentile_75": 95000
                },
                "demand_level": "High",
                "growth_outlook": "Growing"
            }],
            "market_insights": [
                f"{body.job_title} roles are in high demand in {body.location}.",
                "Remote opportunities are expanding the salary ceiling.",
                "Specialized cloud and AI skills command 20-30% premiums."
            ],
            "top_paying_skills": ["Kubernetes", "AWS", "System Design", "AI/ML", "Go"]
        }

    benchmarks = []
    for b in parsed.get("benchmarks", []):
        sr = b.get("salary_range", {})
        benchmarks.append(SalaryBenchmark(
            region=b.get("region", body.location),
            salary_range=SalaryRange(
                currency=sr.get("currency", body.currency),
                minimum=sr.get("minimum", 0),
                median=sr.get("median", 0),
                maximum=sr.get("maximum", 0),
                percentile_25=sr.get("percentile_25", 0),
                percentile_75=sr.get("percentile_75", 0),
            ),
            demand_level=b.get("demand_level", "Medium"),
            growth_outlook=b.get("growth_outlook", "Stable"),
        ))

    return SalaryAnalyzeResponse(
        job_title=body.job_title,
        location=body.location,
        seniority=body.seniority,
        benchmarks=benchmarks,
        market_insights=parsed.get("market_insights", []),
        top_paying_skills=parsed.get("top_paying_skills", []),
    )


@router.post("/negotiate", response_model=NegotiationResponse)
async def generate_negotiation_strategy(
    body: NegotiationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate personalized salary negotiation scripts and email templates."""
    user_prompt = (
        f"Role: {body.job_title}\n"
        f"Company: {body.company_name or 'Tech Company'}\n"
        f"Current Offer: {body.currency} {body.current_offer:,.0f}\n"
        f"Desired Salary: {body.currency} {body.desired_salary:,.0f}\n"
        f"Context: {body.context or 'New job offer'}\n"
        f"Candidate Strengths: {', '.join(body.your_strengths) if body.your_strengths else 'Not specified'}"
    )

    try:
        raw = await ai_service._call_ai(NEGOTIATION_PROMPT, user_prompt)
        parsed = ai_service._parse_json(raw)
    except Exception as e:
        logger.error(f"Negotiation AI error: {e}")
        parsed = {
            "overall_strategy": "Lead with market data and your unique value proposition.",
            "scripts": [{
                "scenario": "Initial Counter",
                "opening_line": f"Thank you for the offer. Based on my research and experience, I was expecting something closer to {body.currency} {body.desired_salary:,.0f}.",
                "key_arguments": ["Market benchmark data", "Your specialized skill set", "Proven track record of impact"],
                "counter_offer_strategy": "If they can't meet salary, negotiate signing bonus, equity, or remote flexibility.",
                "closing_line": "I'm very excited about this opportunity and confident we can find a number that works for both of us."
            }],
            "email_template": f"Dear [Hiring Manager],\n\nThank you for the offer of {body.currency} {body.current_offer:,.0f}. After careful consideration and market research, I'd like to discuss a base of {body.currency} {body.desired_salary:,.0f}...",
            "tips": ["Always negotiate — 73% of employers expect it.", "Never give the first number.", "Focus on total compensation, not just base.", "Get the final offer in writing.", "Express enthusiasm throughout."]
        }

    scripts = []
    for s in parsed.get("scripts", []):
        scripts.append(NegotiationScript(
            scenario=s.get("scenario", ""),
            opening_line=s.get("opening_line", ""),
            key_arguments=s.get("key_arguments", []),
            counter_offer_strategy=s.get("counter_offer_strategy", ""),
            closing_line=s.get("closing_line", ""),
        ))

    return NegotiationResponse(
        overall_strategy=parsed.get("overall_strategy", ""),
        scripts=scripts,
        email_template=parsed.get("email_template", ""),
        tips=parsed.get("tips", []),
    )
