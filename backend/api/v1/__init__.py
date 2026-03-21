"""API v1 router — aggregates all sub-routers."""

from fastapi import APIRouter

from api.v1.auth import router as auth_router
from api.v1.cv import router as cv_router
from api.v1.cover_letter import router as cover_letter_router
from api.v1.job_match import router as job_match_router
from api.v1.billing import router as billing_router
from api.v1.user import router as user_router
from api.v1.b2b import router as b2b_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(cv_router, prefix="/cv", tags=["CV"])
api_router.include_router(cover_letter_router, prefix="/cover-letter", tags=["Cover Letter"])
api_router.include_router(job_match_router, prefix="/job-match", tags=["Job Match"])
api_router.include_router(billing_router, prefix="/billing", tags=["Billing"])
api_router.include_router(user_router, prefix="/user", tags=["User"])
api_router.include_router(b2b_router, prefix="/b2b", tags=["B2B"])
