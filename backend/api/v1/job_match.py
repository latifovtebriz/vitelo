"""Job Match endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from api.v1.auth import get_current_user
from models.user import User

router = APIRouter()


@router.post("/analyze", status_code=202)
async def analyze_job_match(current_user: User = Depends(get_current_user)):
    """Analyze CV vs job description — costs 0.5 credit. (Phase 2)"""
    raise HTTPException(status_code=501, detail="Job Match analysis coming in Phase 2")


@router.get("/{match_id}")
async def get_match(match_id: str, current_user: User = Depends(get_current_user)):
    """Get match result by ID. (Phase 2)"""
    raise HTTPException(status_code=501, detail="Job Match coming in Phase 2")
