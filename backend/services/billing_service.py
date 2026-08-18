"""Billing service — Lemon Squeezy webhook processing.

- HMAC-SHA256 webhook verification
- Tier detection from product name
- Idempotent payment processing (unique lemon_squeezy_id)
- credits += 1 on every completed order
"""

import hashlib
import hmac
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from models.billing import Transaction
from models.user import User

logger = logging.getLogger("vitelo.billing")
settings = get_settings()

# Tier → price and credits mapping
TIER_PRICES = {
    "basic": "4.99",
    "pro": "7.99",
    "ultimate": "12.99",
}

TIER_CREDITS = {
    "basic": 3,
    "pro": 5,
    "ultimate": 8,
}


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify Lemon Squeezy HMAC-SHA256 webhook signature."""
    if not signature:
        return False

    secret = settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode()
    expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def get_tier_from_order(order_data: dict) -> str:
    """Map Lemon Squeezy product name → internal tier string."""
    product_name: str = ""
    attributes = order_data.get("data", {}).get("attributes", {})
    first_item = attributes.get("first_order_item", {})
    product_name = first_item.get("product_name", "")

    if not product_name:
        product_name = order_data.get("meta", {}).get("product_name", "")

    product_name_lower = product_name.lower()

    if "ultimate" in product_name_lower:
        return "ultimate"
    elif "pro" in product_name_lower:
        return "pro"
    else:
        return "basic"


async def process_payment(
    db: AsyncSession,
    user_id,
    tier: str,
    ls_order_id: str,
) -> Transaction | None:
    """Idempotently process a completed Lemon Squeezy order."""
    existing = await db.execute(
        select(Transaction).where(Transaction.lemon_squeezy_id == ls_order_id)
    )
    if existing.scalar_one_or_none():
        logger.info(f"Duplicate webhook ignored: ls_order_id={ls_order_id}")
        return None

    from decimal import Decimal
    amount = Decimal(TIER_PRICES.get(tier, "4.99"))
    credits_to_grant = TIER_CREDITS.get(tier, 1)

    txn = Transaction(
        user_id=user_id,
        tier=tier,
        amount_usd=amount,
        credits_granted=credits_to_grant,
        lemon_squeezy_id=ls_order_id,
        status="completed",
    )
    db.add(txn)

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one()
    user.credits += credits_to_grant

    logger.info(f"Payment processed: user={user.email} tier={tier} credits_added={credits_to_grant} balance={user.credits}")
    return txn
