"""Storage Service — Cloudflare R2 (boto3 S3-compatible).

Falls back to /tmp if R2 is not configured.
"""

import logging
import os
import uuid
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

from core.config import get_settings

logger = logging.getLogger("vitelo.storage")
settings = get_settings()


def _is_r2_configured() -> bool:
    return (
        settings.R2_ACCOUNT_ID != "placeholder"
        and settings.R2_ACCESS_KEY != "placeholder"
        and settings.R2_SECRET_KEY != "placeholder"
    )


def _get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY,
        aws_secret_access_key=settings.R2_SECRET_KEY,
        region_name="auto",
    )


async def upload_pdf(file_bytes: bytes, filename: str) -> str:
    """Upload PDF bytes to R2 or /tmp as fallback.

    Returns:
        Public URL (R2) or local file path (/tmp)
    """
    if not _is_r2_configured():
        # Fallback: save to /tmp
        tmp_path = Path("/tmp") / filename
        tmp_path.write_bytes(file_bytes)
        logger.warning(f"R2 not configured, saved to: {tmp_path}")
        return f"/tmp/{filename}"  # In prod: serve via endpoint or setup R2

    try:
        client = _get_r2_client()
        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=filename,
            Body=file_bytes,
            ContentType="application/pdf",
        )
        public_url = f"{settings.R2_PUBLIC_URL}/{filename}"
        logger.info(f"Uploaded to R2: {public_url}")
        return public_url
    except ClientError as e:
        logger.error(f"R2 upload failed: {e}")
        raise


def generate_filename(user_id: str, suffix: str = "cv") -> str:
    """Generate a unique filename for a PDF."""
    unique = uuid.uuid4().hex[:8]
    return f"pdfs/{user_id}/{suffix}_{unique}.pdf"
