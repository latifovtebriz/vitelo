"""Real-time Supabase PostgreSQL synchronization service via HTTPS REST API.

Ensures that every user creation, verification, and password update is
instantaneously mirrored to the remote Supabase database regardless of
local or cloud execution environment.
"""

import httpx
import logging
from core.config import get_settings

logger = logging.getLogger("vitelo.supabase_sync")
settings = get_settings()

SUPABASE_REST_URL = "https://qxwxpykthyoyfnydsxvn.supabase.co/rest/v1"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3hweWt0aHlveWZueWRzeHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTI0NTAsImV4cCI6MjEwMjYyODQ1MH0.RqhXRDwJE37f9TykmJ77PRtH7PTc_8ZdQ7lbxc8rBiU"


class SupabaseSyncService:
    @staticmethod
    async def sync_user(
        user_id: str,
        email: str,
        password_hash: str,
        full_name: str = "",
        role: str = "individual",
        credits: int = 1,
        is_active: bool = True,
    ) -> bool:
        """Sync or upsert user directly into Supabase PostgreSQL users table."""
        headers = {
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {ANON_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        }
        payload = {
            "id": str(user_id),
            "email": email.strip().lower(),
            "password_hash": password_hash,
            "full_name": full_name or "",
            "role": role,
            "credits": credits,
            "is_active": is_active,
        }
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(
                    f"{SUPABASE_REST_URL}/users",
                    headers=headers,
                    json=payload,
                )
                if resp.status_code in [200, 201]:
                    logger.info(f"Successfully synced user {email} to Supabase cloud DB.")
                    return True
                else:
                    logger.warning(f"Supabase sync warning [{resp.status_code}]: {resp.text}")
                    return False
        except Exception as e:
            logger.error(f"Supabase sync exception for {email}: {e}")
            return False

    @staticmethod
    async def update_user_password(email: str, password_hash: str) -> bool:
        """Update password in Supabase PostgreSQL users table."""
        headers = {
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {ANON_KEY}",
            "Content-Type": "application/json",
        }
        payload = {"password_hash": password_hash}
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.patch(
                    f"{SUPABASE_REST_URL}/users?email=eq.{email.strip().lower()}",
                    headers=headers,
                    json=payload,
                )
                return resp.status_code in [200, 204]
        except Exception as e:
            logger.error(f"Supabase update password exception for {email}: {e}")
            return False


supabase_sync = SupabaseSyncService()
