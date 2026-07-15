"""CV / Resume models — highly normalized and extensible."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class CVGeneration(Base):
    __tablename__ = "cv_generations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(100), default="My Resume")
    template_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_templates.id", ondelete="SET NULL"), nullable=True
    )
    tier: Mapped[Optional[str]] = mapped_column(
        String(20)  # "basic", "pro", "ultimate"
    )
    status: Mapped[str] = mapped_column(
        String(20), default="pending"  # "pending", "processing", "done", "failed"
    )
    input_data: Mapped[Optional[dict]] = mapped_column(JSONB)  # Raw JSON inputs (backup/legacy)
    ai_output: Mapped[Optional[dict]] = mapped_column(JSONB)   # Polished JSON output (backup/legacy)
    ats_score: Mapped[Optional[int]] = mapped_column(Integer)
    watermarked_pdf_url: Mapped[Optional[str]] = mapped_column(Text)
    clean_pdf_url: Mapped[Optional[str]] = mapped_column(Text)
    template: Mapped[str] = mapped_column(String(50), default="modern")  # Legacy template field
    language: Mapped[str] = mapped_column(String(10), default="en")
    is_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="cv_generations")
    cover_letters = relationship("CoverLetter", back_populates="cv", lazy="selectin")
    job_matches = relationship("JobMatch", back_populates="cv", lazy="selectin")
    interview_preps = relationship("InterviewPrep", back_populates="cv", lazy="selectin")

    # Normalized components
    personal_info: Mapped[Optional["CVPersonalInfo"]] = relationship(
        "CVPersonalInfo", back_populates="cv", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
    experiences: Mapped[List["CVExperience"]] = relationship(
        "CVExperience", back_populates="cv", cascade="all, delete-orphan", order_by="CVExperience.display_order", lazy="selectin"
    )
    educations: Mapped[List["CVEducation"]] = relationship(
        "CVEducation", back_populates="cv", cascade="all, delete-orphan", order_by="CVEducation.display_order", lazy="selectin"
    )
    projects: Mapped[List["CVProject"]] = relationship(
        "CVProject", back_populates="cv", cascade="all, delete-orphan", order_by="CVProject.display_order", lazy="selectin"
    )
    certifications: Mapped[List["CVCertification"]] = relationship(
        "CVCertification", back_populates="cv", cascade="all, delete-orphan", order_by="CVCertification.display_order", lazy="selectin"
    )
    skills: Mapped[List["CVSkill"]] = relationship(
        "CVSkill", back_populates="cv", cascade="all, delete-orphan", order_by="CVSkill.display_order", lazy="selectin"
    )
    languages: Mapped[List["CVLanguage"]] = relationship(
        "CVLanguage", back_populates="cv", cascade="all, delete-orphan", lazy="selectin"
    )
    references: Mapped[List["CVReference"]] = relationship(
        "CVReference", back_populates="cv", cascade="all, delete-orphan", lazy="selectin"
    )
    custom_sections: Mapped[List["CVCustomSection"]] = relationship(
        "CVCustomSection", back_populates="cv", cascade="all, delete-orphan", order_by="CVCustomSection.display_order", lazy="selectin"
    )
    layouts: Mapped[List["CVLayout"]] = relationship(
        "CVLayout", back_populates="cv", cascade="all, delete-orphan", order_by="CVLayout.display_order"
    )
    styles: Mapped[Optional["CVTemplateStyle"]] = relationship(
        "CVTemplateStyle", back_populates="cv", uselist=False, cascade="all, delete-orphan"
    )
    versions: Mapped[List["CVVersion"]] = relationship(
        "CVVersion", back_populates="cv", cascade="all, delete-orphan"
    )
    tailored_logs: Mapped[List["CVTailoringLog"]] = relationship(
        "CVTailoringLog", primaryjoin="CVGeneration.id==CVTailoringLog.original_cv_id", cascade="all, delete-orphan"
    )
    scans: Mapped[List["ATSScan"]] = relationship(
        "ATSScan", back_populates="cv", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<CVGeneration {self.id} status={self.status} tier={self.tier}>"


class CVPersonalInfo(Base):
    __tablename__ = "cv_personal_infos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    location: Mapped[Optional[str]] = mapped_column(String(255))
    linkedin_url: Mapped[Optional[str]] = mapped_column(Text)
    portfolio_url: Mapped[Optional[str]] = mapped_column(Text)
    summary: Mapped[Optional[str]] = mapped_column(Text)

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="personal_info")


class CVExperience(Base):
    __tablename__ = "cv_experiences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255))
    start_date: Mapped[str] = mapped_column(String(50), nullable=False)
    end_date: Mapped[Optional[str]] = mapped_column(String(50))
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="experiences")
    highlights: Mapped[List["CVExperienceHighlight"]] = relationship(
        "CVExperienceHighlight", back_populates="experience", cascade="all, delete-orphan", order_by="CVExperienceHighlight.display_order", lazy="selectin"
    )


class CVExperienceHighlight(Base):
    __tablename__ = "cv_experience_highlights"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    experience_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_experiences.id", ondelete="CASCADE"), nullable=False
    )
    highlight_text: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    experience: Mapped[CVExperience] = relationship("CVExperience", back_populates="highlights")


class CVEducation(Base):
    __tablename__ = "cv_educations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    institution: Mapped[str] = mapped_column(String(255), nullable=False)
    degree: Mapped[str] = mapped_column(String(255), nullable=False)
    graduation_year: Mapped[Optional[str]] = mapped_column(String(50))
    gpa: Mapped[Optional[str]] = mapped_column(String(20))
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="educations")


class CVProject(Base):
    __tablename__ = "cv_projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Text] = mapped_column(Text)
    project_url: Mapped[Optional[str]] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="projects")


class CVCertification(Base):
    __tablename__ = "cv_certifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    issuing_organization: Mapped[Optional[str]] = mapped_column(String(255))
    issue_date: Mapped[Optional[str]] = mapped_column(String(50))
    expiration_date: Mapped[Optional[str]] = mapped_column(String(50))
    credential_id: Mapped[Optional[str]] = mapped_column(String(100))
    credential_url: Mapped[Optional[str]] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="certifications")


class CVSkill(Base):
    __tablename__ = "cv_skills"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    proficiency_level: Mapped[Optional[str]] = mapped_column(String(50))
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="skills")


class CVLanguage(Base):
    __tablename__ = "cv_languages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    proficiency: Mapped[str] = mapped_column(String(50), nullable=False)

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="languages")


class CVReference(Base):
    __tablename__ = "cv_references"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    relationship_type: Mapped[Optional[str]] = mapped_column("relationship", String(100))
    company: Mapped[Optional[str]] = mapped_column(String(255))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(50))

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="references")


class CVCustomSection(Base):
    __tablename__ = "cv_custom_sections"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    section_title: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="custom_sections")


class CVVersion(Base):
    __tablename__ = "cv_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    cv: Mapped[CVGeneration] = relationship("CVGeneration", back_populates="versions")
