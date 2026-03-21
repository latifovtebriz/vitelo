"""Transaction model — matches PROJECT_MEMORY.md §6 (YENİLƏNDİ — tier əlavə edildi)."""

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    tier: Mapped[str] = mapped_column(
        Enum("basic", "pro", "ultimate", name="tier_type"), nullable=False
    )
    amount_usd: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    credits_granted: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    lemon_squeezy_id: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False
    )  # idempotency key — eyni lemon_squeezy_id 2 dəfə işlənməz
    status: Mapped[str] = mapped_column(
        Enum("pending", "completed", "refunded", name="transaction_status"),
        default="pending",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction {self.id} tier={self.tier} ${self.amount_usd}>"
