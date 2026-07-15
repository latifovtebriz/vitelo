"""CV Templates, Styles, and Layout models."""

import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class CVTemplate(Base):
    __tablename__ = "cv_templates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    preview_image_url: Mapped[Optional[str]] = mapped_column(Text)
    html_path: Mapped[str] = mapped_column(String(255), nullable=False)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)

    def __repr__(self) -> str:
        return f"<CVTemplate {self.name}>"


class CVTemplateStyle(Base):
    __tablename__ = "cv_template_styles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    font_family: Mapped[str] = mapped_column(String(100), default="Inter")
    font_size: Mapped[str] = mapped_column(String(20), default="10pt")
    primary_color: Mapped[str] = mapped_column(String(7), default="#3b82f6")  # HEX format (e.g., #3b82f6)
    margin_top: Mapped[str] = mapped_column(String(20), default="15mm")
    margin_bottom: Mapped[str] = mapped_column(String(20), default="15mm")
    line_height: Mapped[str] = mapped_column(String(10), default="1.2")

    cv = relationship("CVGeneration", back_populates="styles")


class CVLayout(Base):
    __tablename__ = "cv_layouts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="CASCADE"), nullable=False
    )
    section_name: Mapped[str] = mapped_column(String(50), nullable=False)  # experience, education, skills, projects, etc.
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)

    cv = relationship("CVGeneration", back_populates="layouts")
