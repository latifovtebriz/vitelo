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

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ── Password ──

def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return pwd_context.verify(plain, hashed)


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
