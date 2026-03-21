"""Billing endpoints — Lemon Squeezy webhook + credits + history + checkout.

POST /webhook    — HMAC-verified Lemon Squeezy webhook
GET  /credits    — Current user credits balance
GET  /history    — Transaction history
GET  /checkout/{tier} — Return hosted checkout URL
"""

import logging
import uuid

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.errors import WebhookVerificationError, NotFoundError
from core.security import get_current_user
from models.transaction import Transaction
from models.user import User
from services.billing_service import (
    get_tier_from_order,
    process_payment,
    verify_webhook_signature,
)

logger = logging.getLogger("vitelo.billing")
router = APIRouter()

# ── Lemon Squeezy Checkout URLs (from your LS dashboard) ──
# Replace these with your actual product checkout links
CHECKOUT_URLS = {
    "basic":    "https://vitelo.lemonsqueezy.com/checkout/buy/basic",
    "pro":      "https://vitelo.lemonsqueezy.com/checkout/buy/pro",
    "ultimate": "https://vitelo.lemonsqueezy.com/checkout/buy/ultimate",
}

VALID_TIERS = {"basic", "pro", "ultimate"}


@router.post("/webhook")
async def lemon_squeezy_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Lemon Squeezy order_created webhook.

    - Verify HMAC-SHA256 signature
    - Find user by email from order
    - Process payment idempotently
    - Return 200 {"received": true}
    """
    # Read raw body BEFORE any parsing (needed for signature check)
    payload_bytes = await request.body()
    signature = request.headers.get("X-Signature", "")

    if not verify_webhook_signature(payload_bytes, signature):
        logger.warning("Webhook signature verification failed")
        raise WebhookVerificationError()

    data = await request.json()

    # Extract order details
    order_id = str(data.get("data", {}).get("id", ""))
    attributes = data.get("data", {}).get("attributes", {})
    user_email = attributes.get("user_email", "")
    status = attributes.get("status", "")

    # Only process paid orders
    if status != "paid":
        logger.info(f"Ignoring non-paid webhook: status={status}")
        return {"received": True, "skipped": True}

    # Find user by email
    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalar_one_or_none()
    if not user:
        logger.warning(f"Webhook: user not found for email={user_email}")
        return {"received": True, "user_not_found": True}

    # Detect tier and process
    tier = get_tier_from_order(data)
    txn = await process_payment(db, user.id, tier, order_id)
    await db.commit()

    if txn:
        logger.info(f"Payment processed: user={user_email} tier={tier} credits now={user.credits}")

    return {"received": True}


@router.get("/credits")
async def get_credits(current_user: User = Depends(get_current_user)):
    """Return current user's credit balance."""
    return {"credits": current_user.credits}


@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return user's full transaction history."""
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
    )
    transactions = result.scalars().all()

    return [
        {
            "id": str(t.id),
            "tier": t.tier,
            "amount_usd": str(t.amount_usd),
            "credits_granted": t.credits_granted,
            "status": t.status,
            "created_at": t.created_at.isoformat(),
        }
        for t in transactions
    ]


@router.get("/checkout/{tier}")
async def get_checkout_url(
    tier: str,
    current_user: User = Depends(get_current_user),
):
    """Return Lemon Squeezy hosted checkout URL for the given tier."""
    if tier not in VALID_TIERS:
        raise NotFoundError(f"Tier '{tier}'")

    base_url = CHECKOUT_URLS[tier]
    # Append user email as prefill so LS can track who paid
    checkout_url = f"{base_url}?checkout[email]={current_user.email}"

    return {"checkout_url": checkout_url, "tier": tier}
