"""AI Service — Gemini Flash primary → Groq Llama fallback with tenacity retry.

Fix #4: Real implementation with structured JSON output and automatic failover.
"""

import json
import logging
from typing import Any

import google.generativeai as genai
from groq import Groq
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from core.config import get_settings
from core.errors import AIServiceError

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Configure providers ──
genai.configure(api_key=settings.GEMINI_API_KEY)
groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None


# ── CV Generation Prompt ──
CV_SYSTEM_PROMPT = """You are a professional CV writer and career coach.
Return ONLY valid JSON. No markdown, no preamble, no explanation.
Optimize for ATS (Applicant Tracking Systems).
Use strong action verbs. Quantify achievements where possible.
If input is in Azerbaijani, translate to professional English.
Do not hallucinate or invent information not provided.

Output schema:
{
  "personal": {
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "website": "string"
  },
  "summary": "2-3 sentence professional summary",
  "experience": [
    {
      "job_title": "string",
      "company": "string",
      "start_date": "string",
      "end_date": "string or Present",
      "description": "string",
      "achievements": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "graduation_year": "string",
      "gpa": "string or null"
    }
  ],
  "skills": ["string"],
  "ats_score": 0-100,
  "ats_tips": ["tip1", "tip2"]
}"""

COVER_LETTER_SYSTEM_PROMPT = """You are a professional cover letter writer.
Tone: {tone}
Return ONLY the cover letter text. No JSON needed.
Match the CV skills to the job requirements.
Length: 3-4 paragraphs, max 350 words."""

JOB_MATCH_SYSTEM_PROMPT = """You are a career advisor analyzing CV against job descriptions.
Return ONLY valid JSON:
{
  "match_score": 0-100,
  "matching_skills": ["string"],
  "missing_skills": ["string"],
  "strengths": ["string"],
  "recommendations": ["string"]
}"""


class AIService:
    """AI service with Gemini → Groq fallback and retry logic."""

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_gemini(system_prompt: str, user_prompt: str) -> str:
        """Call Google Gemini Flash API."""
        model = genai.GenerativeModel(
            "gemini-1.5-flash",
            system_instruction=system_prompt,
        )
        response = await model.generate_content_async(user_prompt)
        return response.text

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_groq(system_prompt: str, user_prompt: str) -> str:
        """Call Groq Llama API as fallback."""
        if not groq_client:
            raise AIServiceError("Groq API key not configured")

        response = groq_client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=4096,
        )
        return response.choices[0].message.content

    @classmethod
    async def _call_with_fallback(cls, system_prompt: str, user_prompt: str) -> str:
        """Try Gemini first, fall back to Groq on failure."""
        # Primary: Gemini Flash
        try:
            logger.info("Calling Gemini Flash...")
            result = await cls._call_gemini(system_prompt, user_prompt)
            logger.info("Gemini Flash succeeded")
            return result
        except Exception as e:
            logger.warning(f"Gemini Flash failed after retries: {e}")

        # Fallback: Groq Llama
        try:
            logger.info("Falling back to Groq Llama...")
            result = await cls._call_groq(system_prompt, user_prompt)
            logger.info("Groq Llama succeeded")
            return result
        except Exception as e:
            logger.error(f"Groq Llama also failed: {e}")
            raise AIServiceError(f"All AI providers failed: {e}")

    @classmethod
    async def generate_cv(cls, input_data: dict) -> dict[str, Any]:
        """Generate an optimized CV from user input. Returns parsed JSON."""
        user_prompt = f"Create a professional CV from this data:\n{json.dumps(input_data, indent=2)}"
        raw = await cls._call_with_fallback(CV_SYSTEM_PROMPT, user_prompt)

        # Strip markdown code fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]  # remove first line
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"AI returned invalid JSON: {cleaned[:200]}...")
            raise AIServiceError(f"AI returned invalid JSON: {e}")

    @classmethod
    async def generate_cover_letter(
        cls, cv_data: dict, job_title: str, company: str, job_description: str, tone: str = "formal"
    ) -> str:
        """Generate a cover letter. Returns plain text."""
        system = COVER_LETTER_SYSTEM_PROMPT.replace("{tone}", tone)
        user_prompt = (
            f"Write a cover letter for:\n"
            f"Job Title: {job_title}\n"
            f"Company: {company}\n"
            f"Job Description: {job_description}\n\n"
            f"Based on this CV data:\n{json.dumps(cv_data, indent=2)}"
        )
        return await cls._call_with_fallback(system, user_prompt)

    @classmethod
    async def analyze_job_match(cls, cv_data: dict, job_description: str) -> dict[str, Any]:
        """Analyze CV vs job description. Returns parsed JSON."""
        user_prompt = (
            f"Analyze this CV against the job description.\n\n"
            f"CV:\n{json.dumps(cv_data, indent=2)}\n\n"
            f"Job Description:\n{job_description}"
        )
        raw = await cls._call_with_fallback(JOB_MATCH_SYSTEM_PROMPT, user_prompt)

        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]

        try:
            return json.loads(cleaned.strip())
        except json.JSONDecodeError as e:
            raise AIServiceError(f"AI returned invalid JSON for job match: {e}")
