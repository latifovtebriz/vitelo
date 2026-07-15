"""Job Board, Saved Jobs, Search Preferences and AI Recommendation models."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class JobPosting(Base):
    __tablename__ = "job_postings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(Text)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    location_type: Mapped[str] = mapped_column(String(50), default="onsite")  # onsite, hybrid, remote
    contract_type: Mapped[str] = mapped_column(String(50), default="fulltime")  # fulltime, parttime, contract, internship
    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    skills: Mapped[List["JobSkill"]] = relationship(
        "JobSkill", back_populates="job", cascade="all, delete-orphan"
    )
    saved_by_users: Mapped[List["UserSavedJob"]] = relationship(
        "UserSavedJob", back_populates="job", cascade="all, delete-orphan"
    )
    recommendations: Mapped[List["UserJobRecommendation"]] = relationship(
        "UserJobRecommendation", back_populates="job", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<JobPosting {self.title} at {self.company_name}>"


class JobSkill(Base):
    __tablename__ = "job_skills"

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_postings.id", ondelete="CASCADE"), primary_key=True
    )
    skill_name: Mapped[str] = mapped_column(String(100), primary_key=True)

    job: Mapped[JobPosting] = relationship("JobPosting", back_populates="skills")


class UserJobPreference(Base):
    __tablename__ = "user_job_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    location: Mapped[Optional[str]] = mapped_column(String(255))
    location_type: Mapped[Optional[str]] = mapped_column(String(50))
    contract_type: Mapped[Optional[str]] = mapped_column(String(50))
    expected_salary: Mapped[Optional[float]] = mapped_column(Integer)  # Stored in simple integer or float
    skills_list: Mapped[Optional[dict]] = mapped_column(JSONB)  # List of target skills

    user = relationship("User", back_populates="job_preferences")


class UserSavedJob(Base):
    __tablename__ = "user_saved_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="saved_jobs")
    job: Mapped[JobPosting] = relationship("JobPosting", back_populates="saved_by_users")


class UserJobRecommendation(Base):
    __tablename__ = "user_job_recommendations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_postings.id", ondelete="CASCADE"), primary_key=True, index=True
    )
    match_percentage: Mapped[int] = mapped_column(Integer, nullable=False)
    matched_reason: Mapped[Optional[str]] = mapped_column(Text)

    user = relationship("User", back_populates="job_recommendations")
    job: Mapped[JobPosting] = relationship("JobPosting", back_populates="recommendations")
