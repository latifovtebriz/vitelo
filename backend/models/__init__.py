"""SQLAlchemy ORM models registry — import all models for Alembic discovery."""

from core.database import Base

# Module 1: Auth & User Management
from models.user import (
    User,
    UserProfile,
    Role,
    UserRole,
    UserSession,
    PasswordResetToken,
    AuditLog,
)

# Module 2: CV / Resume (Highly Normalized)
from models.cv import (
    CVGeneration,
    CVPersonalInfo,
    CVExperience,
    CVExperienceHighlight,
    CVEducation,
    CVProject,
    CVCertification,
    CVSkill,
    CVLanguage,
    CVReference,
    CVCustomSection,
    CVVersion,
)

# Module 3: CV Templates & Styling
from models.template import CVTemplate, CVTemplateStyle, CVLayout

# Module 4: AI & ATS Scanning
from models.ai import AIRequestLog, ATSScan, ATSScanKeywordAnalysis, CVTailoringLog

# Module 5: Cover Letters
from models.cover_letter import CoverLetter, CoverLetterTemplate, CoverLetterVersion

# Module 6: Interview Prep
from models.interview_prep import InterviewPrep  # Legacy
from models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewUserAnswer,
    InterviewAIFeedback,
)

# Module 7: Job Board & Match Preferences
from models.job_match import JobMatch  # Legacy
from models.job import (
    JobPosting,
    JobSkill,
    UserJobPreference,
    UserSavedJob,
    UserJobRecommendation,
)

# Module 8: Job Tracker (Kanban)
from models.tracker import (
    JobTracker,
    JobTrackerColumn,
    JobTrackerApplication,
    JobTrackerActivity,
    JobTrackerNote,
    JobTrackerReminder,
)

# Module 9: Courses & Learning
from models.learning import (
    Course,
    UserCourseProgress,
    LearningPath,
    LearningPathCourse,
)

# Module 10: Billing & coaching
from models.billing import (
    Transaction,
    UserCreditLedger,
    CoachingPackage,
    CoachingBooking,
)

# Module 11: Salary Analyzer
from models.salary import SalaryMarketData, UserSalarySearch

# Module 12: Onboarding & Strategy
from models.strategy import JobSearchStrategy

# Module 13: System & App Logs
from models.log import AppLog

__all__ = [
    "Base",
    "AppLog",
    # User / Auth
    "User",
    "UserProfile",
    "Role",
    "UserRole",
    "UserSession",
    "PasswordResetToken",
    "AuditLog",
    # CV
    "CVGeneration",
    "CVPersonalInfo",
    "CVExperience",
    "CVExperienceHighlight",
    "CVEducation",
    "CVProject",
    "CVCertification",
    "CVSkill",
    "CVLanguage",
    "CVReference",
    "CVCustomSection",
    "CVVersion",
    # Templates & styling
    "CVTemplate",
    "CVTemplateStyle",
    "CVLayout",
    # AI & ATS
    "AIRequestLog",
    "ATSScan",
    "ATSScanKeywordAnalysis",
    "CVTailoringLog",
    # Cover Letter
    "CoverLetter",
    "CoverLetterTemplate",
    "CoverLetterVersion",
    # Interview
    "InterviewPrep",
    "InterviewSession",
    "InterviewQuestion",
    "InterviewUserAnswer",
    "InterviewAIFeedback",
    # Job Board
    "JobMatch",
    "JobPosting",
    "JobSkill",
    "UserJobPreference",
    "UserSavedJob",
    "UserJobRecommendation",
    # Tracker
    "JobTracker",
    "JobTrackerColumn",
    "JobTrackerApplication",
    "JobTrackerActivity",
    "JobTrackerNote",
    "JobTrackerReminder",
    # Learning
    "Course",
    "UserCourseProgress",
    "LearningPath",
    "LearningPathCourse",
    # Billing
    "Transaction",
    "UserCreditLedger",
    "CoachingPackage",
    "CoachingBooking",
    # Salary
    "SalaryMarketData",
    "UserSalarySearch",
    # Strategy
    "JobSearchStrategy",
]
