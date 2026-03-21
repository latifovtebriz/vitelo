"""B2B endpoints — bulk match, usage stats. (Phase 3)"""

from fastapi import APIRouter, Depends, HTTPException

from api.v1.auth import get_current_user
from models.user import User

router = APIRouter()


@router.post("/bulk-match")
async def bulk_match(current_user: User = Depends(get_current_user)):
    """Bulk CV match against a job description. (Phase 3)"""
    if current_user.role != "b2b":
        raise HTTPException(status_code=403, detail="B2B access required")
    raise HTTPException(status_code=501, detail="Bulk match coming in Phase 3")


@router.get("/usage")
async def usage_stats(current_user: User = Depends(get_current_user)):
    """API usage statistics for B2B clients. (Phase 3)"""
    if current_user.role != "b2b":
        raise HTTPException(status_code=403, detail="B2B access required")
    raise HTTPException(status_code=501, detail="Usage stats coming in Phase 3")
