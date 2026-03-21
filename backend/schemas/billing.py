"""Billing request/response schemas."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel


# ── Responses ──

class CreditResponse(BaseModel):
    credits: int
    email: str


class TransactionItem(BaseModel):
    id: uuid.UUID
    amount_usd: Decimal
    credits_purchased: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionHistoryResponse(BaseModel):
    items: list[TransactionItem]
    total: int


# ── Webhook (internal) ──

class LemonSqueezyWebhookData(BaseModel):
    """Raw Lemon Squeezy webhook payload — flexible to accept any shape."""
    meta: dict[str, Any] = {}
    data: dict[str, Any] = {}
