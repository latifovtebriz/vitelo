"""Seed script to populate initial/test data in the Vitelo database."""

import asyncio
import os
import sys
from datetime import datetime, timezone
import uuid

# Add current directory to path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from core.database import async_session
from models.learning import Course
from models.template import CVTemplate
from models.billing import CoachingPackage
from models.salary import SalaryMarketData

async def seed_data():
    print("Seeding initial data...")
    async with async_session() as session:
        # 1. Seed Courses
        courses_to_seed = [
            Course(
                id=uuid.uuid4(),
                title="Advanced Data Analysis",
                provider="Coursera",
                category="IT & Computer Science",
                rating=4.80,
                course_url="https://coursera.org",
                logo_url=None,
                created_at=datetime.now(timezone.utc)
            ),
            Course(
                id=uuid.uuid4(),
                title="Leadership & Management",
                provider="Udemy",
                category="Business & Management",
                rating=4.60,
                course_url="https://udemy.com",
                logo_url=None,
                created_at=datetime.now(timezone.utc)
            ),
            Course(
                id=uuid.uuid4(),
                title="UX Design Fundamentals",
                provider="Google",
                category="Design",
                rating=4.90,
                course_url="https://grow.google",
                logo_url=None,
                created_at=datetime.now(timezone.utc)
            ),
            Course(
                id=uuid.uuid4(),
                title="Digital Marketing Mastery",
                provider="HubSpot",
                category="Marketing",
                rating=4.70,
                course_url="https://academy.hubspot.com",
                logo_url=None,
                created_at=datetime.now(timezone.utc)
            )
        ]
        
        for course in courses_to_seed:
            stmt = select(Course).where(Course.title == course.title)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                session.add(course)
                print(f"Added course: {course.title}")

        # 2. Seed CV Templates
        templates_to_seed = [
            CVTemplate(
                id=uuid.uuid4(),
                name="modern",
                preview_image_url="https://vitelo.me/assets/templates/modern.png",
                html_path="templates/cv_modern.html",
                is_premium=False
            ),
            CVTemplate(
                id=uuid.uuid4(),
                name="minimal",
                preview_image_url="https://vitelo.me/assets/templates/minimal.png",
                html_path="templates/cv_minimal.html",
                is_premium=True
            )
        ]
        
        for template in templates_to_seed:
            stmt = select(CVTemplate).where(CVTemplate.name == template.name)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                session.add(template)
                print(f"Added template: {template.name}")

        # 3. Seed Coaching Packages
        packages_to_seed = [
            CoachingPackage(
                id=uuid.uuid4(),
                title="Resume Review & Strategy Session",
                price_credits=1,
                duration_minutes=30
            ),
            CoachingPackage(
                id=uuid.uuid4(),
                title="1-on-1 Interview Preparation",
                price_credits=2,
                duration_minutes=45
            ),
            CoachingPackage(
                id=uuid.uuid4(),
                title="Career Growth & Salary Negotiation",
                price_credits=3,
                duration_minutes=60
            )
        ]
        
        for pkg in packages_to_seed:
            stmt = select(CoachingPackage).where(CoachingPackage.title == pkg.title)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                session.add(pkg)
                print(f"Added coaching package: {pkg.title}")

        # 4. Seed Salary Market Data
        salary_data_to_seed = [
            SalaryMarketData(
                id=uuid.uuid4(),
                job_title="Frontend Developer",
                company="TechCorp",
                location="Baku",
                salary_min=1500.00,
                salary_max=3500.00,
                currency="AZN",
                updated_at=datetime.now(timezone.utc)
            ),
            SalaryMarketData(
                id=uuid.uuid4(),
                job_title="UI/UX Designer",
                company="DesignStudio",
                location="Remote",
                salary_min=1000.00,
                salary_max=2500.00,
                currency="USD",
                updated_at=datetime.now(timezone.utc)
            ),
            SalaryMarketData(
                id=uuid.uuid4(),
                job_title="Software Developer",
                company="Global Solutions",
                location="Baku",
                salary_min=2000.00,
                salary_max=4500.00,
                currency="AZN",
                updated_at=datetime.now(timezone.utc)
            )
        ]
        
        for salary in salary_data_to_seed:
            stmt = select(SalaryMarketData).where(
                (SalaryMarketData.job_title == salary.job_title) & 
                (SalaryMarketData.location == salary.location)
            )
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                session.add(salary)
                print(f"Added salary market data: {salary.job_title} in {salary.location}")

        await session.commit()
        print("Successfully seeded all data!")

if __name__ == "__main__":
    asyncio.run(seed_data())
