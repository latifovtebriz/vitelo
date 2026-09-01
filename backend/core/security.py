"""JWT token management + password hashing + get_current_user dependency.

Rules:
- JWT sub is always str(user.id), never raw UUID
- Access token: 30 min expiry
- Refresh token: 7 day expiry, includes type="refresh"
- Password: bcrypt via passlib
"""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.database import get_db
from core.errors import InvalidCredentialsError, InvalidTokenError, InactiveAccountError

import bcrypt

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ── Password ──

def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ── JWT ──

def create_access_token(data: dict) -> str:
    """Create a short-lived access token (30 min)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a long-lived refresh token (7 days)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_password_reset_token(user_id: str, email: str) -> str:
    """Create a short-lived password reset token (30 minutes)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode = {
        "sub": user_id,
        "email": email,
        "type": "password_reset",
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_email_verification_token(email: str, password_hash: str, full_name: str | None = None) -> str:
    """Create a 15-minute registration confirmation token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {
        "email": email,
        "password_hash": password_hash,
        "full_name": full_name,
        "type": "email_verification",
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_email_verification_token(token: str) -> dict:
    """Decode and validate a 15-minute email verification token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "email_verification" or "email" not in payload:
            raise InvalidTokenError("Invalid or expired email verification link.")
        return payload
    except JWTError:
        raise InvalidTokenError("Verification link has expired or is invalid. Links remain valid for 15 minutes.")


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises InvalidTokenError on failure."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if "sub" not in payload:
            raise InvalidTokenError("Token payload missing 'sub' claim.")
        return payload
    except JWTError:
        raise InvalidTokenError()


# ── FastAPI Dependency ──

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    FastAPI dependency: extracts JWT from Authorization header,
    decodes it, loads the User from DB, and returns the User object.
    Raises 401 if token invalid, user not found, or user inactive.
    """
    from models.user import User  # late import to avoid circular

    payload = decode_token(token)
    user_id_str = payload.get("sub")

    try:
        user_uuid = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise InvalidTokenError("Token contains invalid user ID.")

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()

    if not user:
        raise InvalidTokenError("User not found.")
    if not user.is_active:
        raise InactiveAccountError()

    return user


oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db),
):
    """Optional user dependency — returns None if unauthenticated."""
    if not token:
        return None
    try:
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            return None
        user_uuid = uuid.UUID(user_id_str)
        from models.user import User
        result = await db.execute(select(User).where(User.id == user_uuid))
        return result.scalar_one_or_none()
    except Exception:
        return None

