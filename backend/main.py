"""
Vitelo — AI-powered CV Builder API

matches PROJECT_MEMORY.md:
- §5. ARXİTEKTURA
- §7. API ENDPOİNTLƏR
- §9. XƏTA İDARƏSİ
- §11. TƏHLÜKƏSİZLİK
- §16. MÜHÜM QEYDLƏR (health check)

Features:
- FastAPI lifespan (startup/shutdown)
- CORS: only vitelo.me + localhost:5173
- slowapi rate limiting
- /api/v1/health → DB + Redis connectivity check
- Global exception handler for clean JSON errors
- Routers for auth, cv, cover_letter, job_match, billing, user, b2b
"""

import logging
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text

from api.v1 import api_router
from core.config import get_settings
from core.database import engine
from core.errors import register_exception_handlers

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("vitelo")

settings = get_settings()

# ── Rate Limiter ──
limiter = Limiter(key_func=get_remote_address)


# ── Lifespan ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 Vitelo API starting ({settings.ENVIRONMENT})")
    yield
    await engine.dispose()
    logger.info("👋 Vitelo API shutting down")


# ── App ──
app = FastAPI(
    title="Vitelo API",
    description="AI-powered CV Builder + Cover Letter + Job Match Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS — vitelo.me + subdomains + localhost ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://vitelo.me",
        "http://vitelo.me",
        "https://www.vitelo.me",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://(.*\.)?vitelo\.me(:\d+)?|https?://localhost(:\d+)?|https?://127\.0\.0\.1(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Custom Exception Handlers ──
register_exception_handlers(app)


# ── Global unhandled exception handler ──
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


# ── Routers ──
app.include_router(api_router)


# ── Health Check (§16: DB + Redis connectivity) ──
@app.get("/api/v1/health")
async def health_check():
    """
    Health check — returns:
    {"status": "ok", "db": "connected", "redis": "connected"}
    or degraded status with error details.
    """
    health = {"status": "ok", "db": "unknown", "redis": "unknown"}

    # Check database (Neon PostgreSQL)
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        health["db"] = "connected"
    except Exception as e:
        health["db"] = f"error: {str(e)[:100]}"
        health["status"] = "degraded"

    # Check Redis (Upstash)
    try:
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.ping()
        await r.aclose()
        health["redis"] = "connected"
    except Exception as e:
        health["redis"] = f"error: {str(e)[:100]}"
        health["status"] = "degraded"

    status_code = 200 if health["db"] == "connected" else 503
    return JSONResponse(content=health, status_code=status_code)
