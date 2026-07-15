"""Billing, Credit Ledger, and Coaching models."""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tier: Mapped[str] = mapped_column(String(20), nullable=False)  # basic, pro, ultimate
    amount_usd: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    credits_granted: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    lemon_squeezy_id: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), default="pending"  # pending, completed, refunded
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction {self.id} tier={self.tier} ${self.amount_usd}>"


class UserCreditLedger(Base):
    __tablename__ = "user_credit_ledger"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # +1, -1, etc.
    reason: Mapped[str] = mapped_column(String(255), nullable=False)  # buy_basic_tier, unlock_cv, etc.
    cv_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cv_generations.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="credit_ledgers")
    cv = relationship("CVGeneration")


class CoachingPackage(Base):
    __tablename__ = "coaching_packages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    price_credits: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)


class CoachingBooking(Base):
    __tablename__ = "coaching_bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    package_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("coaching_packages.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, confirmed, completed, cancelled
    booking_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    meeting_link: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="coaching_bookings")
    package = relationship("CoachingPackage")
