"""Email Dispatch Service via Resend API.

Provides:
- Account Verification Email with 15-minute activation link.
- Password Reset Email with 30-minute secure reset token.
- Responsive, branded Vitelo HTML templates.
"""

import logging
from typing import Optional
import httpx

from core.config import get_settings
from core.telemetry import telemetry

logger = logging.getLogger("vitelo.email_service")
settings = get_settings()

RESEND_API_URL = "https://api.resend.com/emails"


def _get_verification_html(full_name: str, verification_link: str) -> str:
    name_display = full_name if full_name else "User"
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #ffffff; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; padding: 36px 30px; }}
        .logo {{ font-size: 24px; font-weight: 900; background: linear-gradient(135deg, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px; display: inline-block; }}
        h1 {{ font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 12px; }}
        p {{ font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }}
        .btn {{ display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px; margin-bottom: 24px; }}
        .warning {{ background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #93c5fd; margin-bottom: 24px; }}
        .footer {{ font-size: 11px; color: #6b7280; text-align: center; border-top: 1px solid #1f2937; padding-top: 20px; margin-top: 30px; }}
        .link-text {{ font-size: 11px; color: #60a5fa; word-break: break-all; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">✨ Vitelo</div>
        <h1>Confirm your Vitelo Account</h1>
        <p>Hi {name_display},</p>
        <p>Thank you for signing up for Vitelo! Click the button below to confirm your email and activate your CV Studio account.</p>
        <div style="text-align: center;">
          <a href="{verification_link}" class="btn" target="_blank">Activate My Account →</a>
        </div>
        <div class="warning">
          ⏰ <strong>Note:</strong> This verification link expires in <strong>15 minutes</strong>. If you did not create an account, you can safely ignore this email.
        </div>
        <p style="font-size: 12px; color: #6b7280;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p class="link-text">{verification_link}</p>
        <div class="footer">
          © 2026 Vitelo Inc. All rights reserved. • AI-Powered Career Platform
        </div>
      </div>
    </body>
    </html>
    """


def _get_password_reset_html(reset_link: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #ffffff; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; padding: 36px 30px; }}
        .logo {{ font-size: 24px; font-weight: 900; background: linear-gradient(135deg, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px; display: inline-block; }}
        h1 {{ font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 12px; }}
        p {{ font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }}
        .btn {{ display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px; margin-bottom: 24px; }}
        .warning {{ background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #fca5a5; margin-bottom: 24px; }}
        .footer {{ font-size: 11px; color: #6b7280; text-align: center; border-top: 1px solid #1f2937; padding-top: 20px; margin-top: 30px; }}
        .link-text {{ font-size: 11px; color: #60a5fa; word-break: break-all; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">✨ Vitelo</div>
        <h1>Reset Your Password</h1>
        <p>We received a request to reset the password for your Vitelo account. Click the button below to choose a new password.</p>
        <div style="text-align: center;">
          <a href="{reset_link}" class="btn" target="_blank">Reset Password →</a>
        </div>
        <div class="warning">
          ⏰ <strong>Security Notice:</strong> This link is only valid for <strong>30 minutes</strong>. If you did not request a password reset, please disregard this message.
        </div>
        <p style="font-size: 12px; color: #6b7280;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p class="link-text">{reset_link}</p>
        <div class="footer">
          © 2026 Vitelo Inc. All rights reserved. • AI-Powered Career Platform
        </div>
      </div>
    </body>
    </html>
    """


class EmailService:
    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        html_content: str,
    ) -> bool:
        """Send email via Resend API."""
        api_key = settings.RESEND_API_KEY
        if not api_key:
            logger.warning("RESEND_API_KEY not configured. Skipping physical email dispatch.")
            return False

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "from": settings.EMAIL_FROM or "Vitelo <no-reply@vitelo.me>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }

        print(f"\n[EMAIL_DISPATCH] Sending email to: {to_email} | Subject: {subject} | From: {payload['from']}")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(RESEND_API_URL, headers=headers, json=payload)
                print(f"[RESEND_RESPONSE] Status: {resp.status_code} | Body: {resp.text}")
                if resp.status_code in [200, 201]:
                    logger.info(f"[SUCCESS] Email dispatched to {to_email} via Resend. ID: {resp.json().get('id')}")
                    return True
                else:
                    err_detail = resp.text
                    logger.error(f"[ERROR] Resend API error [{resp.status_code}]: {err_detail}")
                    return False
        except Exception as e:
            print(f"[EMAIL_EXCEPTION] {e}")
            logger.error(f"[ERROR] Exception during email dispatch: {e}")
            return False

    @classmethod
    async def send_verification_email(
        cls,
        to_email: str,
        full_name: str,
        verification_link: str,
    ) -> bool:
        """Send 15-minute account verification link."""
        subject = "Confirm your Vitelo Account"
        html = _get_verification_html(full_name, verification_link)
        return await cls.send_email(to_email, subject, html)

    @classmethod
    async def send_password_reset_email(
        cls,
        to_email: str,
        reset_link: str,
    ) -> bool:
        """Send 30-minute password reset link."""
        subject = "Reset your Vitelo password"
        html = _get_password_reset_html(reset_link)
        return await cls.send_email(to_email, subject, html)


email_service = EmailService()
