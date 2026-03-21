"""Billing endpoints — Lemon Squeezy webhook + credit management.

Fix #1: HMAC-SHA256 signature verification on webhook.
"""

import hashlib
import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.auth import get_current_user
from core.config import get_settings
from core.database import get_db
from core.errors import WebhookVerificationError
from models.transaction import Transaction
from models.user import User
from schemas.billing import CreditResponse, TransactionHistoryResponse, TransactionItem

router = APIRouter()
settings = get_settings()


def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Lemon Squeezy HMAC-SHA256 webhook signature."""
    expected = hmac.new(
        secret.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/webhook")
async def lemon_squeezy_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_signature: str = Header(alias="X-Signature"),
):
    """
    Lemon Squeezy webhook receiver.
    - Verifies HMAC-SHA256 signature
    - Idempotent: ignores duplicate transaction IDs
    - Adds credits to user on successful payment
    """
    raw_body = await request.body()

    # ── Fix #1: HMAC-SHA256 verification ──
    if not verify_webhook_signature(raw_body, x_signature, settings.LEMONSQUEEZY_WEBHOOK_SECRET):
        raise WebhookVerificationError()

    payload = await request.json()
    event_name = payload.get("meta", {}).get("event_name", "")

    if event_name != "order_created":
        return {"status": "ignored", "event": event_name}

    # Extract data
    data = payload.get("data", {})
    attributes = data.get("attributes", {})
    order_id = str(data.get("id", ""))
    user_email = attributes.get("user_email", "")
    total = attributes.get("total", 0)  # in cents
    amount_usd = total / 100

    # Idempotency: skip if already processed
    existing = await db.execute(
        select(Transaction).where(Transaction.lemon_squeezy_id == order_id)
    )
    if existing.scalar_one_or_none():
        return {"status": "already_processed", "order_id": order_id}

    # Find user by email
    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_email} not found")

    # Calculate credits (1 credit = $3)
    credits_to_add = max(1, int(amount_usd / 3))

    # Create transaction
    txn = Transaction(
        user_id=user.id,
        amount_usd=amount_usd,
        credits_purchased=credits_to_add,
        lemon_squeezy_id=order_id,
        status="completed",
    )
    db.add(txn)

    # Add credits
    user.credits += credits_to_add

    return {"status": "ok", "credits_added": credits_to_add}


@router.get("/credits", response_model=CreditResponse)
async def get_credits(current_user: User = Depends(get_current_user)):
    """Get current credit balance."""
    return CreditResponse(credits=current_user.credits, email=current_user.email)


@router.get("/history", response_model=TransactionHistoryResponse)
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get transaction history."""
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
    )
    items = result.scalars().all()
    return TransactionHistoryResponse(
        items=[TransactionItem.model_validate(t) for t in items],
        total=len(items),
    )
