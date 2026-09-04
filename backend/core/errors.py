"""Vitelo custom exceptions + FastAPI error handlers.

All errors return consistent JSON:
{"error": "ERROR_CODE", "message": "Human readable message"}
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class ViteloException(Exception):
    """Base exception for all Vitelo domain errors."""

    def __init__(self, status_code: int, error_code: str, message: str):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        super().__init__(message)


# ── Pre-defined errors ──

class EmailExistsError(ViteloException):
    def __init__(self):
        super().__init__(409, "EMAIL_EXISTS", "This email is already registered.")


class InvalidCredentialsError(ViteloException):
    def __init__(self):
        super().__init__(401, "INVALID_CREDENTIALS", "Invalid email or password.")


class InactiveAccountError(ViteloException):
    def __init__(self):
        super().__init__(403, "INACTIVE_ACCOUNT", "Your account has been deactivated.")


class InvalidTokenError(ViteloException):
    def __init__(self, detail: str = "Invalid or expired token."):
        super().__init__(401, "INVALID_TOKEN", detail)


class InsufficientCreditsError(ViteloException):
    def __init__(self):
        super().__init__(402, "INSUFFICIENT_CREDITS", "Not enough credits. Please purchase a plan.")


class NotFoundError(ViteloException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(404, "NOT_FOUND", f"{resource} not found.")


class WebhookVerificationError(ViteloException):
    def __init__(self):
        super().__init__(403, "WEBHOOK_INVALID", "Webhook signature verification failed.")


class TierRequiredError(ViteloException):
    def __init__(self, required_tier: str):
        super().__init__(
            402, "TIER_REQUIRED",
            f"This feature requires {required_tier} tier or higher.",
        )


import traceback
import logging

logger = logging.getLogger("vitelo.errors")


def register_exception_handlers(app: FastAPI):
    """Register ViteloException and global Exception handlers on the FastAPI app."""

    @app.exception_handler(ViteloException)
    async def vitelo_exception_handler(request: Request, exc: ViteloException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.error_code, "message": exc.message},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        tb = traceback.format_exc()
        logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {exc}\n{tb}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": str(exc),
                "detail": f"{type(exc).__name__}: {str(exc)}",
            },
        )
