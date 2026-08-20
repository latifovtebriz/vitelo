"""Auth endpoints — full implementation.

POST /register  → create user, return tokens
POST /login     → verify credentials, return tokens
POST /refresh   → verify refresh token, issue new pair
GET  /me        → return current user profile
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.database import get_db
from core.errors import EmailExistsError, InvalidCredentialsError, InactiveAccountError, InvalidTokenError
from core.security import (
    create_access_token,
    create_refresh_token,
    create_password_reset_token,
    create_email_verification_token,
    decode_email_verification_token,
    decode_token,
    get_current_user,
    hash_password,
    verify_password,
)
from models.user import User
from models.log import AppLog
from services.email_service import email_service
from schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterPendingResponse,
    VerifyEmailRequest,
    ResendVerificationRequest,
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


@router.post("/register", response_model=RegisterPendingResponse, status_code=200)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Step 1 of Registration:
    - 409 if email already exists
    - Generates 15-minute secure confirmation token
    - Dispatches verification link to user's email
    """
    settings = get_settings()
    # Check email uniqueness
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        # Log conflict attempt
        db.add(AppLog(
            level="WARN",
            source="backend",
            category="auth_register_conflict",
            message=f"Registration attempt failed: email {body.email} already exists",
            user_email=body.email,
            page_url="/register",
            component="auth.py",
        ))
        await db.commit()
        raise EmailExistsError()

    pwd_hash = hash_password(body.password)
    token = create_email_verification_token(
        email=body.email,
        password_hash=pwd_hash,
        full_name=body.full_name,
    )
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    # Log token generation to database
    db.add(AppLog(
        level="ACTION",
        source="backend",
        category="auth_register_token_issued",
        message=f"15-minute registration confirmation link dispatched for {body.email}",
        user_email=body.email,
        page_url="/register",
        component="auth.py",
        payload={"expires_in_minutes": 15, "full_name": body.full_name},
    ))
    await db.commit()

    # Dispatch real email via Resend
    await email_service.send_verification_email(
        to_email=body.email,
        full_name=body.full_name or "",
        verification_link=verification_link,
    )

    return RegisterPendingResponse(
        success=True,
        email=body.email,
        message="A confirmation link has been sent to your email. It remains active for 15 minutes.",
        expires_in_minutes=15,
        verification_link=verification_link,
    )


@router.post("/verify-email", response_model=TokenResponse, status_code=200)
async def verify_email(body: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    """
    Step 2 of Registration (Email Confirmation):
    - Validates 15-minute token
    - Creates user in PostgreSQL database and activates account
    - Issues access + refresh tokens
    """
    payload = decode_email_verification_token(body.token)
    email = payload.get("email")
    pwd_hash = payload.get("password_hash")
    full_name = payload.get("full_name")

    # Check if user was already created
    existing = await db.execute(select(User).where(User.email == email))
    user = existing.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            password_hash=pwd_hash,
            full_name=full_name,
            role="individual",
            credits=1,
            is_active=True,
        )
        db.add(user)
        await db.flush()
    else:
        user.is_active = True
        await db.flush()

    # Log successful email verification & account activation
    db.add(AppLog(
        level="ACTION",
        source="backend",
        category="auth_email_verified",
        message=f"Account activated successfully for {email}",
        user_id=user.id,
        user_email=email,
        page_url="/verify-email",
        component="auth.py",
        payload={"user_id": str(user.id), "credits": user.credits, "role": user.role},
    ))
    await db.commit()

    return _issue_tokens(str(user.id))


@router.post("/resend-verification", response_model=RegisterPendingResponse)
async def resend_verification(body: ResendVerificationRequest, db: AsyncSession = Depends(get_db)):
    """
    Resends 15-minute confirmation email.
    """
    settings = get_settings()
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise EmailExistsError("An active account with this email already exists. Please log in.")

    pwd_hash = hash_password(body.password) if body.password else ""
    token = create_email_verification_token(
        email=body.email,
        password_hash=pwd_hash,
        full_name=body.full_name,
    )
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    db.add(AppLog(
        level="ACTION",
        source="backend",
        category="auth_resend_verification",
        message=f"Resent 15-minute confirmation link to {body.email}",
        user_email=body.email,
        page_url="/register",
        component="auth.py",
    ))
    await db.commit()

    # Dispatch real email via Resend
    await email_service.send_verification_email(
        to_email=body.email,
        full_name=body.full_name or "",
        verification_link=verification_link,
    )

    return RegisterPendingResponse(
        success=True,
        email=body.email,
        message="A new confirmation link has been sent to your email. It remains active for 15 minutes.",
        expires_in_minutes=15,
        verification_link=verification_link,
    )


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
        db.add(AppLog(
            level="WARN",
            source="backend",
            category="auth_login_failed",
            message=f"Failed login attempt for {body.email}: invalid credentials",
            user_email=body.email,
            page_url="/login",
            component="auth.py",
        ))
        await db.commit()
        raise InvalidCredentialsError()

    if not user.is_active:
        db.add(AppLog(
            level="WARN",
            source="backend",
            category="auth_login_inactive",
            message=f"Failed login attempt for {body.email}: account is inactive",
            user_id=user.id,
            user_email=body.email,
            page_url="/login",
            component="auth.py",
        ))
        await db.commit()
        raise InactiveAccountError()

    # Log successful login
    db.add(AppLog(
        level="ACTION",
        source="backend",
        category="auth_login_success",
        message=f"User {user.email} logged in successfully",
        user_id=user.id,
        user_email=user.email,
        page_url="/login",
        component="auth.py",
    ))
    await db.commit()

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

    email_clean = body.email.strip().lower()
    result = await db.execute(select(User.id, User.email).where(User.email == email_clean))
    user_row = result.first()

    if user_row:
        user_id, user_email = user_row
        reset_token = create_password_reset_token(str(user_id), user_email)
        reset_url = f"https://vitelo.me/reset-password?token={reset_token}"

        # Telemetry & Audit log
        try:
            log_entry = AppLog(
                level="INFO",
                category="auth",
                user_id=user_id,
                user_email=user_email,
                page_url="/forgot-password",
                component="AuthForgotPassword",
                message=f"Password reset token issued for {user_email}",
                payload={"email": user_email, "reset_url": reset_url},
            )
            db.add(log_entry)
            await db.commit()
        except Exception:
            pass

        # Dispatch real email via Resend
        await email_service.send_password_reset_email(
            to_email=user_email,
            reset_link=reset_url,
        )

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

