"""AI Logging, ATS Scoring, and Keyword Analysis models."""

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class AIRequestLog(Base):
    __tablename__ = "ai_requests_log"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_tokens: Mapped[Optional[int]] = mapped_column(Integer)
    completion_tokens: Mapped[Optional[int]] = mapped_column(Integer)
    cost: Mapped[Optional[float]] = mapped_column(Integer)  # Stored in micro-cents or float
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<AIRequestLog {self.id} model={self.model}>"


class ATSScan(Base):
    __tablename__ = "ats_scans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    target_job_description: Mapped[Optional[str]] = mapped_column(Text)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    formatting_score: Mapped[Optional[int]] = mapped_column(Integer)
    keyword_score: Mapped[Optional[int]] = mapped_column(Integer)
    feedback: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    cv = relationship("CVGeneration", back_populates="scans")
    keyword_analyses: Mapped[List["ATSScanKeywordAnalysis"]] = relationship(
        "ATSScanKeywordAnalysis", back_populates="scan", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<ATSScan {self.id} score={self.score}>"


class ATSScanKeywordAnalysis(Base):
    __tablename__ = "ats_scan_keyword_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    scan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ats_scans.id", ondelete="CASCADE"), nullable=False
    )
    keyword: Mapped[str] = mapped_column(String(100), nullable=False)
    is_found: Mapped[bool] = mapped_column(Boolean, default=False)
    frequency_in_cv: Mapped[int] = mapped_column(Integer, default=0)
    frequency_in_job: Mapped[int] = mapped_column(Integer, default=1)

    scan = relationship("ATSScan", back_populates="keyword_analyses")


class CVTailoringLog(Base):
    __tablename__ = "cv_tailoring_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    original_cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    tailored_cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    job_description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
