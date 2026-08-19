"""Auth request/response Pydantic schemas.

Rules:
- Never expose password_hash in any response
- from_attributes=True for ORM → Pydantic conversion
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ── Requests ──

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(None, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr
    password: str | None = None
    full_name: str | None = None


# ── Responses ──

class RegisterPendingResponse(BaseModel):
    success: bool = True
    email: str
    message: str
    expires_in_minutes: int = 15
    verification_link: str | None = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str | None
    role: str
    credits: int
    created_at: datetime

    model_config = {"from_attributes": True}
