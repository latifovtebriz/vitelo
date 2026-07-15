"""Job Application Kanban Tracker models."""

import uuid
from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class JobTracker(Base):
    __tablename__ = "job_trackers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), default="Board")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="job_tracker")
    columns: Mapped[List["JobTrackerColumn"]] = relationship(
        "JobTrackerColumn", back_populates="tracker", cascade="all, delete-orphan", order_by="JobTrackerColumn.display_order"
    )

    def __repr__(self) -> str:
        return f"<JobTracker {self.name} for user={self.user_id}>"


class JobTrackerColumn(Base):
    __tablename__ = "job_tracker_columns"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tracker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_trackers.id", ondelete="CASCADE"), nullable=False
    )
    key: Mapped[str] = mapped_column(String(50), nullable=False)  # Wishlist, Applied, Interview, Offer, Rejected
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)

    tracker: Mapped[JobTracker] = relationship("JobTracker", back_populates="columns")
    applications: Mapped[List["JobTrackerApplication"]] = relationship(
        "JobTrackerApplication", back_populates="column", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<JobTrackerColumn {self.key}>"


class JobTrackerApplication(Base):
    __tablename__ = "job_tracker_applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    column_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_tracker_columns.id", ondelete="CASCADE"), nullable=False
    )
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    date: Mapped[date] = mapped_column(Date, default=date.today)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    column: Mapped[JobTrackerColumn] = relationship("JobTrackerColumn", back_populates="applications")
    activities: Mapped[List["JobTrackerActivity"]] = relationship(
        "JobTrackerActivity", back_populates="application", cascade="all, delete-orphan"
    )
    detailed_notes: Mapped[List["JobTrackerNote"]] = relationship(
        "JobTrackerNote", back_populates="application", cascade="all, delete-orphan"
    )
    reminders: Mapped[List["JobTrackerReminder"]] = relationship(
        "JobTrackerReminder", back_populates="application", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<JobTrackerApplication {self.role} at {self.company}>"


class JobTrackerActivity(Base):
    __tablename__ = "job_tracker_activities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_tracker_applications.id", ondelete="CASCADE"), nullable=False
    )
    from_column_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_tracker_columns.id", ondelete="SET NULL"), nullable=True
    )
    to_column_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_tracker_columns.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    application: Mapped[JobTrackerApplication] = relationship("JobTrackerApplication", back_populates="activities")


class JobTrackerNote(Base):
    __tablename__ = "job_tracker_notes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_tracker_applications.id", ondelete="CASCADE"), nullable=False
    )
    note_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    application: Mapped[JobTrackerApplication] = relationship("JobTrackerApplication", back_populates="detailed_notes")


class JobTrackerReminder(Base):
    __tablename__ = "job_tracker_reminders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_tracker_applications.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)  # Məs: "Interview with Pasha Insurance"
    remind_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_sent: Mapped[bool] = mapped_column(Boolean, default=False)

    application: Mapped[JobTrackerApplication] = relationship("JobTrackerApplication", back_populates="reminders")
