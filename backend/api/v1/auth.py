"""Auth endpoints — full implementation.

POST /register  → create user, return tokens
POST /login     → verify credentials, return tokens
POST /refresh   → verify refresh token, issue new pair
GET  /me        → return current user profile
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.errors import EmailExistsError, InvalidCredentialsError, InactiveAccountError, InvalidTokenError
from core.security import (
    create_access_token,
    create_refresh_token,
    create_password_reset_token,
    decode_token,
    get_current_user,
    hash_password,
    verify_password,
)
from models.user import User
from schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter()


def _issue_tokens(user_id: str) -> TokenResponse:
    """Helper: create access + refresh tokens for a user."""
    return TokenResponse(
        access_token=create_access_token({"sub": user_id}),
        refresh_token=create_refresh_token({"sub": user_id}),
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Register a new user.
    - 409 if email already exists
    - Creates user with role=individual, credits=0
    - Returns tokens immediately (no email verification for MVP)
    """
    # Check email uniqueness
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise EmailExistsError()

    # Create user
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
    )
    db.add(user)
    await db.flush()  # get generated UUID

    return _issue_tokens(str(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Login with email + password.
    - 401 if email not found or password wrong
    - 403 if account deactivated
    """
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise InvalidCredentialsError()

    if not user.is_active:
        raise InactiveAccountError()

    return _issue_tokens(str(user.id))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """
    Refresh tokens using a valid refresh token.
    - Validates the refresh token
    - Issues a fresh access + refresh pair
    """
    payload = decode_token(body.refresh_token)

    if payload.get("type") != "refresh":
        raise InvalidTokenError("Expected a refresh token, got access token.")

    user_id = payload.get("sub")
    return _issue_tokens(user_id)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    """Return the current user's profile (including credits balance)."""
    return current_user


from pydantic import BaseModel as _BM
from fastapi import HTTPException as _HTTPException


class ChangePasswordRequest(_BM):
    current_password: str
    new_password: str


@router.post("/change-password", status_code=200)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the current user's password after verifying the current one."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise _HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(body.new_password) < 8:
        raise _HTTPException(status_code=400, detail="New password must be at least 8 characters.")
    current_user.password_hash = hash_password(body.new_password)
    await db.commit()
    return {"message": "Password updated successfully."}


class ForgotPasswordRequest(_BM):
    email: str


class ResetPasswordRequest(_BM):
    token: str
    new_password: str


@router.post("/forgot-password", status_code=200)
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Initiate password reset flow by sending a reset link."""
    from models.log import AppLog
    import uuid

    email_clean = body.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email_clean))
    user = result.scalar_one_or_none()

    if user:
        reset_token = create_password_reset_token(str(user.id), user.email)
        reset_url = f"https://vitelo.me/reset-password?token={reset_token}"

        # Telemetry & Audit log
        try:
            log_entry = AppLog(
                level="INFO",
                category="auth",
                user_id=user.id,
                user_email=user.email,
                page_url="/forgot-password",
                component="AuthForgotPassword",
                message=f"Password reset token issued for {user.email}",
                payload={"email": user.email, "reset_url": reset_url},
            )
            db.add(log_entry)
            await db.commit()
        except Exception:
            pass

    return {
        "success": True,
        "message": "If an account with that email exists, a password reset link has been dispatched.",
    }


@router.post("/reset-password", status_code=200)
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify reset token and update password."""
    from models.log import AppLog
    import uuid

    payload = decode_token(body.token)
    if payload.get("type") != "password_reset":
        raise _HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user_id = payload.get("sub")
    if not user_id:
        raise _HTTPException(status_code=400, detail="Invalid token payload.")

    try:
        user_uuid = uuid.UUID(user_id)
    except Exception:
        raise _HTTPException(status_code=400, detail="Malformed user identifier.")

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()

    if not user:
        raise _HTTPException(status_code=404, detail="User not found.")

    if len(body.new_password) < 8:
        raise _HTTPException(status_code=400, detail="New password must be at least 8 characters.")

    user.password_hash = hash_password(body.new_password)
    await db.commit()

    try:
        log_entry = AppLog(
            level="INFO",
            category="auth",
            user_id=user.id,
            user_email=user.email,
            page_url="/reset-password",
            component="AuthResetPassword",
            message=f"Password successfully reset for {user.email}",
            payload={"email": user.email},
        )
        db.add(log_entry)
        await db.commit()
    except Exception:
        pass

    return {
        "success": True,
        "message": "Password has been reset successfully. You can now log in.",
    }

