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

# Tier → price mapping (for record keeping)
TIER_PRICES = {
    "basic": "4.99",
    "pro": "7.99",
    "ultimate": "12.99",
}


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify Lemon Squeezy HMAC-SHA256 webhook signature.

    Lemon Squeezy sends:  X-Signature: <hex-digest>
    We compute:           HMAC-SHA256(secret, raw_body)
    """
    if not signature:
        return False

    secret = settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode()
    expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def get_tier_from_order(order_data: dict) -> str:
    """Map Lemon Squeezy product name → internal tier string.

    Checks meta.product_name or first_order_item.product_name.
    Falls back to "basic" if unclear.
    """
    # Try to get product name from various LS payload paths
    product_name: str = ""

    # Path 1: data.attributes.first_order_item.product_name
    attributes = order_data.get("data", {}).get("attributes", {})
    first_item = attributes.get("first_order_item", {})
    product_name = first_item.get("product_name", "")

    # Path 2: meta.product_name (custom data)
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
    """Idempotently process a completed Lemon Squeezy order.

    Returns None if already processed (duplicate webhook).
    Returns Transaction on success.
    Credits += 1 for every paid order.
    """
    # Idempotency — check if already processed
    existing = await db.execute(
        select(Transaction).where(Transaction.lemon_squeezy_id == ls_order_id)
    )
    if existing.scalar_one_or_none():
        logger.info(f"Duplicate webhook ignored: ls_order_id={ls_order_id}")
        return None

    # Create transaction record
    from decimal import Decimal
    amount = Decimal(TIER_PRICES.get(tier, "3.00"))

    txn = Transaction(
        user_id=user_id,
        tier=tier,
        amount_usd=amount,
        credits_granted=1,
        lemon_squeezy_id=ls_order_id,
        status="completed",
    )
    db.add(txn)

    # Add credits to user
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one()
    user.credits += 1

    logger.info(f"Payment processed: user={user.email} tier={tier} order={ls_order_id}")
    return txn
