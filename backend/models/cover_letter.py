"""Cover Letter models."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    cv_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(100), default="My Cover Letter")
    job_title: Mapped[Optional[str]] = mapped_column(String(255))
    company_name: Mapped[Optional[str]] = mapped_column(String(255))
    job_description: Mapped[Optional[str]] = mapped_column(Text)
    tone: Mapped[str] = mapped_column(String(50), default="formal")  # formal, creative, confident
    ai_output: Mapped[Optional[str]] = mapped_column(Text)
    pdf_url: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="cover_letters")
    cv = relationship("CVGeneration", back_populates="cover_letters")
    versions: Mapped[List["CoverLetterVersion"]] = relationship(
        "CoverLetterVersion", back_populates="cover_letter", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<CoverLetter {self.id}>"


class CoverLetterTemplate(Base):
    __tablename__ = "cover_letter_templates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    html_path: Mapped[str] = mapped_column(String(255), nullable=False)


class CoverLetterVersion(Base):
    __tablename__ = "cover_letter_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cover_letter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cover_letters.id", ondelete="CASCADE"), nullable=False
    )
    content_snapshot: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    cover_letter = relationship("CoverLetter", back_populates="versions")
