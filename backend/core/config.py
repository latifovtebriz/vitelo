"""Vitelo core configuration — loads all env vars via Pydantic BaseSettings."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Database (Neon.tech) ──
    DATABASE_URL: str = "postgresql+asyncpg://localhost/vitelo"

    # ── Redis (Upstash) ──
    REDIS_URL: str = "redis://localhost:6379"

    # ── JWT Auth ──
    SECRET_KEY: str = "change-me-in-production-min-32-chars!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── AI Provider (Gemini only — Groq removed) ──
    GEMINI_API_KEY: str = ""

    # ── Cloudflare R2 ──
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY: str = ""
    R2_SECRET_KEY: str = ""
    R2_BUCKET_NAME: str = "vitelo-pdfs"
    R2_PUBLIC_URL: str = "https://r2.vitelo.me"

    # ── Lemon Squeezy ──
    LEMONSQUEEZY_API_KEY: str = ""
    LEMONSQUEEZY_WEBHOOK_SECRET: str = ""
    LEMONSQUEEZY_STORE_ID: str = ""

    # ── Centralized Logging (Better Stack / Logtail & Sentry) ──
    LOGTAIL_SOURCE_TOKEN: str = ""
    BETTERSTACK_TOKEN: str = ""
    SENTRY_DSN: str = ""

    # ── Email Service (Resend) ──
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "Vitelo <onboarding@resend.dev>"

    # ── App ──
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "https://vitelo.me"
    API_URL: str = "https://api.vitelo.me"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # ignore unknown env vars


@lru_cache()
def get_settings() -> Settings:
    return Settings()
