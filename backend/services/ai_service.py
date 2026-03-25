"""AI Service — Gemini 2.0 Flash (primary, retry x3).

Features:
- tenacity retry (3 attempts, exponential backoff 1-8s)
- ATS-optimized CV generation with strict JSON output
- AZ→EN translation built into system prompt
- Cover letter, interview prep, job match analysis
"""

import json
import logging
from typing import Any

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from core.config import get_settings

logger = logging.getLogger("vitelo.ai")
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# ── Prompts ──

CV_SYSTEM_PROMPT = """You are an expert ATS-optimized CV writer. 
Your task is to take raw user input and generate a polished, professional CV.

RULES:
1. Output ONLY valid JSON, no markdown, no explanation
2. Translate any Azerbaijani text to English
3. Enhance descriptions to be action-verb focused and results-driven
4. Fill ats_score (0-100) based on keyword density and structure
5. Fill ats_tips (list of 3 improvement suggestions)
6. Skills must be categorized

OUTPUT JSON SCHEMA:
{
  "personal": {"name": str, "email": str, "phone": str, "location": str, "linkedin": str},
  "summary": str,
  "experience": [{"title": str, "company": str, "period": str, "bullets": [str]}],
  "education": [{"degree": str, "institution": str, "year": str, "gpa": str|null}],
  "skills": {"technical": [str], "soft": [str], "languages": [str]},
  "certifications": [str],
  "ats_score": int,
  "ats_tips": [str, str, str]
}"""

COVER_LETTER_SYSTEM_PROMPT = """You are an expert cover letter writer.
Generate a compelling, personalized cover letter for the given job.
RULES:
1. Output plain text only (no JSON, no markdown)
2. 3 paragraphs: hook + value + call-to-action
3. Tone: {tone}
4. Keep under 350 words"""

INTERVIEW_PREP_SYSTEM_PROMPT = """You are an expert interview coach.
Generate 5 common interview questions with ideal answers for this position.
Output ONLY valid JSON:
[
  {"q": "question", "a": "detailed ideal answer"},
  ...
]"""

JOB_MATCH_SYSTEM_PROMPT = """You are an expert recruiter. Analyze the CV vs job description.
Output ONLY valid JSON:
{
  "match_score": int (0-100),
  "matched_skills": [str],
  "missing_skills": [str],
  "gap_analysis": str,
  "recommendation": str
}"""


class AIService:
    """AI service with Gemini primary and Mistral fallback."""

    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_gemini(self, system_prompt: str, user_content: str) -> str:
        """Call Gemini 1.5 Flash and return raw text response."""
        response = await self.model.generate_content_async(
            f"{system_prompt}\n\nUSER INPUT:\n{user_content}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=4096,
            ),
        )
        return response.text

    async def _call_ai(self, system_prompt: str, user_content: str) -> str:
        """Call Gemini with retry. Raises on final failure."""
        try:
            return await self._call_gemini(system_prompt, user_content)
        except Exception as e:
            logger.error(f"AI call failed after retries: {e}")
            raise RuntimeError(f"AI service temporarily unavailable: {e}")

    def _parse_json(self, text: str) -> Any:
        """Strip markdown fences and parse JSON."""
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])
        return json.loads(text)

    async def generate_cv(self, input_data: dict) -> dict:
        """Generate ATS-optimized CV from user input. Returns structured dict."""
        user_content = json.dumps(input_data, ensure_ascii=False, indent=2)
        raw = await self._call_ai(CV_SYSTEM_PROMPT, user_content)
        result = self._parse_json(raw)
        return result

    async def generate_cover_letter(self, cv_data: dict, job_desc: str, tone: str = "formal") -> str:
        """Generate cover letter text. Returns plain string."""
        prompt = COVER_LETTER_SYSTEM_PROMPT.replace("{tone}", tone)
        user_content = f"CV DATA:\n{json.dumps(cv_data, indent=2)}\n\nJOB DESCRIPTION:\n{job_desc}"
        return await self._call_ai(prompt, user_content)

    async def generate_interview_prep(self, cv_data: dict, job_desc: str) -> list:
        """Generate 5 interview Q&A pairs. Returns list of dicts."""
        user_content = f"CV DATA:\n{json.dumps(cv_data, indent=2)}\n\nJOB DESCRIPTION:\n{job_desc}"
        raw = await self._call_ai(INTERVIEW_PREP_SYSTEM_PROMPT, user_content)
        return self._parse_json(raw)

    async def analyze_job_match(self, cv_data: dict, job_desc: str) -> dict:
        """Analyze CV vs job description. Returns match dict."""
        user_content = f"CV DATA:\n{json.dumps(cv_data, indent=2)}\n\nJOB DESCRIPTION:\n{job_desc}"
        raw = await self._call_ai(JOB_MATCH_SYSTEM_PROMPT, user_content)
        return self._parse_json(raw)


# Singleton
ai_service = AIService()
