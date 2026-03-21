"""Storage Service — Cloudflare R2 (S3-compatible) file upload."""

import logging
import uuid
from io import BytesIO

import boto3
from botocore.config import Config as BotoConfig

from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class StorageService:
    """Upload/download files to Cloudflare R2."""

    _client = None

    @classmethod
    def _get_client(cls):
        if cls._client is None:
            cls._client = boto3.client(
                "s3",
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY,
                aws_secret_access_key=settings.R2_SECRET_KEY,
                config=BotoConfig(
                    signature_version="s3v4",
                    retries={"max_attempts": 3, "mode": "adaptive"},
                ),
                region_name="auto",
            )
        return cls._client

    @classmethod
    async def upload_pdf(cls, pdf_bytes: bytes, filename: str | None = None) -> str:
        """
        Upload PDF bytes to R2 and return the public URL.
        Retries 3 times on failure (via boto3 config).
        """
        if not filename:
            filename = f"cv_{uuid.uuid4().hex}.pdf"

        key = f"pdfs/{filename}"
        client = cls._get_client()

        try:
            client.upload_fileobj(
                BytesIO(pdf_bytes),
                settings.R2_BUCKET_NAME,
                key,
                ExtraArgs={"ContentType": "application/pdf"},
            )
            url = f"{settings.R2_PUBLIC_URL}/{key}"
            logger.info(f"Uploaded PDF to R2: {url}")
            return url
        except Exception as e:
            logger.error(f"R2 upload failed: {e}")
            raise

    @classmethod
    async def delete_file(cls, key: str) -> bool:
        """Delete a file from R2."""
        client = cls._get_client()
        try:
            client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
            return True
        except Exception as e:
            logger.error(f"R2 delete failed: {e}")
            return False
