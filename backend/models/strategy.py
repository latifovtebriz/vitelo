"""Job Search Strategy progression tracking models."""

import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class JobSearchStrategy(Base):
    __tablename__ = "job_search_strategy"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    step_1_completed: Mapped[bool] = mapped_column(Boolean, default=False)  # The Master Plan
    step_2_completed: Mapped[bool] = mapped_column(Boolean, default=False)  # Brand Yourself
    step_3_completed: Mapped[bool] = mapped_column(Boolean, default=False)  # Get More Meetings
    step_4_completed: Mapped[bool] = mapped_column(Boolean, default=False)  # Interview and Win
    step_5_completed: Mapped[bool] = mapped_column(Boolean, default=False)  # Close the Deal
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="strategy_progress")

    def __repr__(self) -> str:
        return f"<JobSearchStrategy user={self.user_id} progress={self.progress_percentage}%>"
