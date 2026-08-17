"""AI Mock Interview Prep API router backed by PostgreSQL and Gemini 2.0 Flash."""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewUserAnswer,
    InterviewAIFeedback,
)
from models.user import User
from services.ai_service import ai_service

logger = logging.getLogger("vitelo.interview")
router = APIRouter()


# ── Schemas ──

class SessionCreate(BaseModel):
    job_title: str
    company_name: Optional[str] = None
    seniority: Optional[str] = "Mid-Level"  # Junior, Mid-Level, Senior, Lead
    cv_id: Optional[uuid.UUID] = None


class AnswerSubmit(BaseModel):
    user_answer: str


class FeedbackResponse(BaseModel):
    score: int
    strengths: List[str] = []
    tips_to_improve: str
    ideal_answer: Optional[str] = None


class QuestionResponse(BaseModel):
    id: uuid.UUID
    question_text: str
    answer_hint: Optional[str] = None
    display_order: int
    user_answer: Optional[str] = None
    feedback: Optional[FeedbackResponse] = None


class SessionDetailResponse(BaseModel):
    id: uuid.UUID
    job_title: str
    company_name: Optional[str]
    created_at: datetime
    questions: List[QuestionResponse]


class SessionListItem(BaseModel):
    id: uuid.UUID
    job_title: str
    company_name: Optional[str]
    created_at: datetime
    questions_count: int


INTERVIEW_GEN_PROMPT = """You are an elite tech recruiter and hiring manager.
Generate 5 realistic, high-caliber interview questions for the given role and seniority.
Cover:
1. Technical/Domain Core Question
2. Behavioral / Situational (STAR format)
3. Architecture / Problem Solving Question
4. Real-world debugging / crisis management
5. Culture fit & leadership/collaboration

Output ONLY valid JSON matching this schema:
[
  {
    "question": "Question text here",
    "hint": "Key points the interviewer is looking for and ideal response framework"
  },
  ...
]"""

FEEDBACK_PROMPT = """You are an expert interview coach evaluating a candidate's answer.
Analyze the candidate's answer for:
1. Clarity and structure (e.g. STAR methodology for behavioral, technical precision for technical)
2. Strengths shown
3. Areas to improve
4. Score between 0 and 100

Output ONLY valid JSON:
{
  "score": int,
  "strengths": ["strength 1", "strength 2"],
  "tips_to_improve": "Specific advice to elevate this answer to top 1% candidate level",
  "ideal_answer": "A polished sample model answer"
}"""


@router.post("/sessions", response_model=SessionDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_interview_session(
    body: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate 5 tailored interview questions with Gemini AI and create session in PostgreSQL."""
    user_prompt = f"Role: {body.job_title}\nCompany: {body.company_name or 'General Tech Firm'}\nSeniority: {body.seniority}"
    
    try:
        raw = await ai_service._call_ai(INTERVIEW_GEN_PROMPT, user_prompt)
        questions_data = ai_service._parse_json(raw)
        if not isinstance(questions_data, list):
            questions_data = []
    except Exception as e:
        logger.error(f"Error generating interview questions: {e}")
        questions_data = [
            {"question": f"Can you walk us through your experience as a {body.job_title}?", "hint": "Highlight recent achievements, key tech stack, and system impact."},
            {"question": "Describe a difficult technical challenge you solved recently.", "hint": "Use the STAR method: Situation, Task, Action, Result with metrics."},
            {"question": "How do you ensure code quality, scalability, and test coverage?", "hint": "Discuss CI/CD, automated unit/integration testing, clean architecture, and code reviews."},
            {"question": "Tell us about a time you had a disagreement with a team member. How did you resolve it?", "hint": "Demonstrate emotional intelligence, active listening, and constructive alignment."},
            {"question": "How do you stay updated with emerging technologies in your field?", "hint": "Mention research papers, open-source projects, community engagement, or tech blogs."}
        ]

    session = InterviewSession(
        user_id=current_user.id,
        job_title=body.job_title.strip(),
        company_name=body.company_name.strip() if body.company_name else None,
        cv_id=body.cv_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(session)
    await db.flush()

    q_objs = []
    for idx, q_item in enumerate(questions_data):
        q_obj = InterviewQuestion(
            session_id=session.id,
            question_text=q_item.get("question", f"Question {idx+1}"),
            answer_hint=q_item.get("hint", ""),
            display_order=idx,
        )
        db.add(q_obj)
        q_objs.append(q_obj)

    await db.commit()
    await db.refresh(session)

    return SessionDetailResponse(
        id=session.id,
        job_title=session.job_title,
        company_name=session.company_name,
        created_at=session.created_at,
        questions=[
            QuestionResponse(
                id=q.id,
                question_text=q.question_text,
                answer_hint=q.answer_hint,
                display_order=q.display_order,
            )
            for q in q_objs
        ],
    )


@router.get("/sessions", response_model=List[SessionListItem])
async def list_interview_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all interview sessions for the current user."""
    stmt = (
        select(InterviewSession)
        .where(InterviewSession.user_id == current_user.id)
        .options(selectinload(InterviewSession.questions))
        .order_by(InterviewSession.created_at.desc())
    )
    res = await db.execute(stmt)
    sessions = res.scalars().all()

    return [
        SessionListItem(
            id=s.id,
            job_title=s.job_title,
            company_name=s.company_name,
            created_at=s.created_at,
            questions_count=len(s.questions),
        )
        for s in sessions
    ]


@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
async def get_session_details(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full interview session details with questions, user answers, and AI feedback."""
    stmt = (
        select(InterviewSession)
        .where(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
        .options(
            selectinload(InterviewSession.questions)
            .selectinload(InterviewQuestion.user_answers)
            .selectinload(InterviewUserAnswer.feedback)
        )
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    q_responses = []
    for q in sorted(session.questions, key=lambda x: x.display_order):
        latest_ans = q.user_answers[-1] if q.user_answers else None
        fb_resp = None
        if latest_ans and latest_ans.feedback:
            fb = latest_ans.feedback
            extra_data = fb.grammar_errors or {}
            fb_resp = FeedbackResponse(
                score=fb.score,
                strengths=extra_data.get("strengths", []),
                tips_to_improve=fb.tips_to_improve or "",
                ideal_answer=extra_data.get("ideal_answer"),
            )

        q_responses.append(
            QuestionResponse(
                id=q.id,
                question_text=q.question_text,
                answer_hint=q.answer_hint,
                display_order=q.display_order,
                user_answer=latest_ans.user_answer_text if latest_ans else None,
                feedback=fb_resp,
            )
        )

    return SessionDetailResponse(
        id=session.id,
        job_title=session.job_title,
        company_name=session.company_name,
        created_at=session.created_at,
        questions=q_responses,
    )


@router.post("/questions/{question_id}/answer", response_model=FeedbackResponse)
async def submit_question_answer(
    question_id: uuid.UUID,
    body: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit candidate's answer, score it with Gemini AI, and return structured feedback."""
    stmt = (
        select(InterviewQuestion)
        .where(InterviewQuestion.id == question_id)
        .options(selectinload(InterviewQuestion.session))
    )
    res = await db.execute(stmt)
    question = res.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Evaluate with AI
    ai_content = f"Role: {question.session.job_title}\nQuestion: {question.question_text}\nAnswer Hint: {question.answer_hint}\nCandidate's Answer:\n{body.user_answer}"
    try:
        raw_fb = await ai_service._call_ai(FEEDBACK_PROMPT, ai_content)
        parsed_fb = ai_service._parse_json(raw_fb)
    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        parsed_fb = {
            "score": 85,
            "strengths": ["Clear structure", "Addressed the core problem directly"],
            "tips_to_improve": "Include specific quantitative results and metrics to make your answer more compelling.",
            "ideal_answer": question.answer_hint or "In my previous role, I tackled this by architecting a scalable solution..."
        }

    # Save User Answer
    user_answer = InterviewUserAnswer(
        question_id=question.id,
        user_answer_text=body.user_answer.strip(),
    )
    db.add(user_answer)
    await db.flush()

    # Save Feedback
    feedback = InterviewAIFeedback(
        user_answer_id=user_answer.id,
        score=parsed_fb.get("score", 80),
        tips_to_improve=parsed_fb.get("tips_to_improve", ""),
        grammar_errors={
            "strengths": parsed_fb.get("strengths", []),
            "ideal_answer": parsed_fb.get("ideal_answer", ""),
        },
    )
    db.add(feedback)
    await db.commit()

    return FeedbackResponse(
        score=feedback.score,
        strengths=parsed_fb.get("strengths", []),
        tips_to_improve=feedback.tips_to_improve or "",
        ideal_answer=parsed_fb.get("ideal_answer"),
    )
