"""Billing Service — Lemon Squeezy payment helpers."""

import hashlib
import hmac
import logging

from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class BillingService:
    """Helper methods for Lemon Squeezy payment processing."""

    @staticmethod
    def verify_signature(payload: bytes, signature: str) -> bool:
        """Verify HMAC-SHA256 signature from Lemon Squeezy webhook."""
        expected = hmac.new(
            settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode("utf-8"),
            payload,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    @staticmethod
    def calculate_credits(amount_cents: int) -> int:
        """Calculate credits from payment amount. 1 credit = $3 = 300 cents."""
        return max(1, amount_cents // 300)
