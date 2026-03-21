"""Interview Prep model — matches PROJECT_MEMORY.md §6 (YENİ — Ultimate tier üçün)."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class InterviewPrep(Base):
    __tablename__ = "interview_preps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    cv_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id")
    )
    questions: Mapped[dict | None] = mapped_column(JSONB)
    # Format: [{"q": "...", "a": "..."}, ...] × 5
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="interview_preps")
    cv = relationship("CVGeneration", back_populates="interview_preps")

    def __repr__(self) -> str:
        return f"<InterviewPrep {self.id}>"
