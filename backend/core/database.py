"""Async SQLAlchemy engine + session factory.

Exports: engine, async_session, Base, get_db
"""

import ssl as _ssl

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from core.config import get_settings

settings = get_settings()

_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if _is_sqlite:
    # SQLite doesn't know JSONB — patch it to use plain JSON
    from sqlalchemy.dialects.postgresql import JSONB
    from sqlalchemy import JSON
    import sqlalchemy.dialects.postgresql as _pg
    _pg.JSONB = JSON  # type: ignore

if _is_sqlite:
    # SQLite for local development - no pool args, no SSL
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=(settings.ENVIRONMENT == "development"),
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL (Supabase) for production
    db_url = settings.DATABASE_URL
    if "%ec" in db_url and "%25ec" not in db_url:
        db_url = db_url.replace("%ec", "%25ec")
    if "&aT5" in db_url and "%26aT5" not in db_url:
        db_url = db_url.replace("&aT5", "%26aT5")

    # Build a no-verify SSL context for secure connection
    _ssl_ctx = _ssl.create_default_context()
    _ssl_ctx.check_hostname = False
    _ssl_ctx.verify_mode = _ssl.CERT_NONE

    engine = create_async_engine(
        db_url,
        echo=(settings.ENVIRONMENT == "development"),
        pool_size=5,
        max_overflow=5,
        pool_pre_ping=True,
        pool_recycle=180,
        pool_timeout=5,
        connect_args={
            "ssl": _ssl_ctx,
            "prepared_statement_cache_size": 0,
            "statement_cache_size": 0,
            "command_timeout": 15,
        },
    )

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for all models."""
    pass


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields an async DB session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
