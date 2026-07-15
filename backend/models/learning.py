"""Online Courses and Learning Progression models."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)  # Coursera, Udemy, Google, HubSpot
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # IT, Business, Design, Marketing
    rating: Mapped[float] = mapped_column(Numeric(3, 2), default=0.0)
    course_url: Mapped[str] = mapped_column(Text, nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user_progressions: Mapped[List["UserCourseProgress"]] = relationship(
        "UserCourseProgress", back_populates="course", cascade="all, delete-orphan"
    )
    path_associations: Mapped[List["LearningPathCourse"]] = relationship(
        "LearningPathCourse", back_populates="course", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Course {self.title} by {self.provider}>"


class UserCourseProgress(Base):
    __tablename__ = "user_course_progress"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress, completed
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="course_progress")
    course: Mapped[Course] = relationship("Course", back_populates="user_progressions")


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_role: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

    courses: Mapped[List["LearningPathCourse"]] = relationship(
        "LearningPathCourse", back_populates="path", cascade="all, delete-orphan"
    )


class LearningPathCourse(Base):
    __tablename__ = "learning_path_courses"

    path_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("learning_paths.id", ondelete="CASCADE"), primary_key=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True
    )
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)

    path: Mapped[LearningPath] = relationship("LearningPath", back_populates="courses")
    course: Mapped[Course] = relationship("Course", back_populates="path_associations")
