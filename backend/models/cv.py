"""CV Generation model — matches PROJECT_MEMORY.md §6 (YENİLƏNDİ — watermark, tier)."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class CVGeneration(Base):
    __tablename__ = "cv_generations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    tier: Mapped[str | None] = mapped_column(
        Enum("basic", "pro", "ultimate", name="tier_type", create_type=False)
    )  # NULL until user pays
    status: Mapped[str] = mapped_column(
        Enum("pending", "processing", "done", "failed", name="cv_status"),
        default="pending",
    )
    input_data: Mapped[dict | None] = mapped_column(JSONB)
    ai_output: Mapped[dict | None] = mapped_column(JSONB)
    ats_score: Mapped[int | None] = mapped_column(Integer)  # 0-100
    watermarked_pdf_url: Mapped[str | None] = mapped_column(Text)  # Pulsuz watermark-lı PDF
    clean_pdf_url: Mapped[str | None] = mapped_column(Text)  # Ödənişdən sonra təmiz PDF
    template: Mapped[str] = mapped_column(String(50), default="modern")
    language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="cv_generations")
    cover_letters = relationship("CoverLetter", back_populates="cv", lazy="selectin")
    job_matches = relationship("JobMatch", back_populates="cv", lazy="selectin")
    interview_preps = relationship("InterviewPrep", back_populates="cv", lazy="selectin")

    def __repr__(self) -> str:
        return f"<CVGeneration {self.id} status={self.status} tier={self.tier}>"
