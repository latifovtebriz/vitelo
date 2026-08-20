"""Quick utility to clear/truncate the `app_logs` telemetry table in Supabase."""

import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Supabase IPv4 Pooler connection
DATABASE_URL = "postgresql+asyncpg://postgres.qxwxpykthyoyfnydsxvn:%25ecLt3VaURe%26aT5@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

async def clear_logs():
    print("Connecting to Supabase database...")
    engine = create_async_engine(DATABASE_URL, echo=False)
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("DELETE FROM public.app_logs;"))
            print(f"[OK] Butun loglar bazadan ugurla temizlendi! (Silinen setir sayi: {result.rowcount})")
    except Exception as e:
        print(f"[ERROR] Xeta bas verdi: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(clear_logs())
