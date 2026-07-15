"""Salary Market Data and Search History models."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class SalaryMarketData(Base):
    __tablename__ = "salary_market_data"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    job_title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company: Mapped[Optional[str]] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    salary_min: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    salary_max: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self) -> str:
        return f"<SalaryMarketData {self.job_title} in {self.location}: {self.salary_min}-{self.salary_max} {self.currency}>"


class UserSalarySearch(Base):
    __tablename__ = "user_salary_searches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[Optional[str]] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    result_min: Mapped[Optional[float]] = mapped_column(Numeric(12, 2))
    result_max: Mapped[Optional[float]] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="salary_searches")

    def __repr__(self) -> str:
        return f"<UserSalarySearch user={self.user_id} job={self.job_title}>"
