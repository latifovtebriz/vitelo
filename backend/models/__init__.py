"""SQLAlchemy ORM models — import all models for Alembic discovery."""

from core.database import Base

from models.user import User
from models.cv import CVGeneration
from models.cover_letter import CoverLetter
from models.interview_prep import InterviewPrep
from models.job_match import JobMatch
from models.transaction import Transaction

__all__ = [
    "Base", "User", "CVGeneration", "CoverLetter",
    "InterviewPrep", "JobMatch", "Transaction",
]
