"""Normalized Interview Prep models."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    cv_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="SET NULL"), nullable=True
    )
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    questions: Mapped[List["InterviewQuestion"]] = relationship(
        "InterviewQuestion", back_populates="session", cascade="all, delete-orphan", order_by="InterviewQuestion.display_order"
    )

    def __repr__(self) -> str:
        return f"<InterviewSession {self.id} job={self.job_title} company={self.company_name}>"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    answer_hint: Mapped[Optional[str]] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    session: Mapped[InterviewSession] = relationship("InterviewSession", back_populates="questions")
    user_answers: Mapped[List["InterviewUserAnswer"]] = relationship(
        "InterviewUserAnswer", back_populates="question", cascade="all, delete-orphan"
    )


class InterviewUserAnswer(Base):
    __tablename__ = "interview_user_answers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False
    )
    user_answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    question: Mapped[InterviewQuestion] = relationship("InterviewQuestion", back_populates="user_answers")
    feedback: Mapped[Optional["InterviewAIFeedback"]] = relationship(
        "InterviewAIFeedback", back_populates="user_answer", uselist=False, cascade="all, delete-orphan"
    )


class InterviewAIFeedback(Base):
    __tablename__ = "interview_ai_feedbacks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_answer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("interview_user_answers.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    score: Mapped[int] = mapped_column(Integer)  # 0-100
    grammar_errors: Mapped[Optional[dict]] = mapped_column(JSONB)
    tips_to_improve: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user_answer: Mapped[InterviewUserAnswer] = relationship("InterviewUserAnswer", back_populates="feedback")
