"""AI Service — Gemini 2.0 Flash (primary, retry x3).

Features:
- tenacity retry (3 attempts, exponential backoff 1-8s)
- ATS-optimized CV generation with strict JSON output
- AI Bullet Point Enhancer (Google XYZ formula)
- AI Professional Summary generator (3 tailored options)
- AI Resume Parser for raw text/uploaded CVs
- Cover letter, interview prep, job match analysis
"""

import json
import logging
from typing import Any, List, Dict

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from core.config import get_settings

logger = logging.getLogger("vitelo.ai")
settings = get_settings()

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# ── Prompts ──

CV_SYSTEM_PROMPT = """You are an expert ATS-optimized CV writer. 
Your task is to take raw user input and generate a polished, highly professional CV.

RULES:
1. Output ONLY valid JSON, no markdown, no explanation
2. Translate any Azerbaijani text to English
3. Preserve all specific technologies, companies, dates, degrees, projects, and volunteer work provided by the user
4. Enhance descriptions to be strong, action-verb focused, metric-driven and ATS optimized
5. Calculate ats_score (0-100) based on completeness, keyword density, and professional structure
6. Fill ats_tips (list of 3 specific actionable improvement suggestions)
7. Categorize skills cleanly into: languages_frameworks, devops_cloud, databases, concepts_tools, soft_skills, languages

OUTPUT JSON SCHEMA:
{
  "personal": {
    "name": str,
    "headline": str,
    "email": str,
    "phone": str,
    "location": str,
    "linkedin": str,
    "github": str,
    "portfolio": str
  },
  "summary": str,
  "experience": [
    {
      "title": str,
      "company": str,
      "location": str,
      "period": str,
      "bullets": [str]
    }
  ],
  "education": [
    {
      "degree": str,
      "institution": str,
      "location": str,
      "year": str,
      "gpa": str
    }
  ],
  "projects": [
    {
      "title": str,
      "role": str,
      "period": str,
      "description": str,
      "url": str
    }
  ],
  "volunteering": [
    {
      "organization": str,
      "role": str,
      "location": str,
      "period": str,
      "description": str
    }
  ],
  "skills": {
    "languages_frameworks": [str],
    "devops_cloud": [str],
    "databases": [str],
    "concepts_tools": [str],
    "soft_skills": [str],
    "languages": [str]
  },
  "certifications": [str],
  "ats_score": int,
  "ats_tips": [str, str, str]
}"""

ENHANCE_BULLET_SYSTEM_PROMPT = """You are an elite career coach and resume expert.
Given a user's rough job responsibility or achievement, transform it into 3 high-impact, ATS-optimized bullet point variations following the Google XYZ formula ('Accomplished X, measured by Y, by doing Z').
Rules:
1. Start with strong action verbs (e.g. Architected, Engineered, Spearheaded, Automated, Reduced, Accelerated).
2. Quantify results with realistic metrics (%) where appropriate.
3. Output ONLY valid JSON:
{
  "bullets": [
    "Variation 1 (Metric & Results focused)",
    "Variation 2 (Technical & Architecture focused)",
    "Variation 3 (Leadership & Delivery focused)"
  ]
}"""

GENERATE_SUMMARY_SYSTEM_PROMPT = """You are an executive resume writer.
Given the candidate's headline, experience, and skills, generate 3 compelling professional summary options:
1. Technical & Impact Specialist (focused on engineering depth and results)
2. Strategic & Scalable Systems Leader (focused on architecture and delivery)
3. Concise & High-Yield (sharp 2-sentence summary)

Output ONLY valid JSON:
{
  "summaries": [
    {
      "type": "technical",
      "title": "Technical & Impact Specialist",
      "text": "..."
    },
    {
      "type": "strategic",
      "title": "Strategic Systems & Architecture",
      "text": "..."
    },
    {
      "type": "concise",
      "title": "Concise & High-Yield",
      "text": "..."
    }
  ]
}"""

PARSE_RESUME_SYSTEM_PROMPT = """You are an intelligent CV/Resume parser.
Extract all details from the provided raw CV text into structured JSON matching our CV schema.
Translate any non-English content to English.
Output ONLY valid JSON matching this schema:
{
  "personal": {
    "name": str,
    "headline": str,
    "email": str,
    "phone": str,
    "location": str,
    "linkedin": str,
    "github": str,
    "portfolio": str
  },
  "summary": str,
  "experience": [
    {
      "job_title": str,
      "company": str,
      "location": str,
      "start_date": str,
      "end_date": str,
      "is_current": bool,
      "description": str
    }
  ],
  "education": [
    {
      "institution": str,
      "degree": str,
      "location": str,
      "start_date": str,
      "end_date": str,
      "graduation_year": str,
      "gpa": str
    }
  ],
  "projects": [
    {
      "title": str,
      "role": str,
      "period": str,
      "description": str
    }
  ],
  "volunteering": [
    {
      "organization": str,
      "role": str,
      "location": str,
      "period": str,
      "description": str
    }
  ],
  "skills": {
    "languages_frameworks": [str],
    "devops_cloud": [str],
    "databases": [str],
    "concepts_tools": [str],
    "soft_skills": [str]
  },
  "languages": [
    { "name": str, "proficiency": str }
  ]
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
    """AI service with Gemini primary and retry mechanism."""

    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_gemini(self, system_prompt: str, user_content: str) -> str:
        """Call Gemini 2.0 Flash and return raw text response."""
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
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines)
        return json.loads(text)

    async def generate_cv(self, input_data: dict) -> dict:
        """Generate ATS-optimized CV from user input. Returns structured dict."""
        user_content = json.dumps(input_data, ensure_ascii=False, indent=2)
        raw = await self._call_ai(CV_SYSTEM_PROMPT, user_content)
        return self._parse_json(raw)

    async def enhance_bullet_point(self, raw_bullet: str, job_title: str = "", company: str = "") -> List[str]:
        """Convert raw bullet point into 3 action-verb + metric driven variations."""
        user_content = f"Job Title: {job_title}\nCompany: {company}\nRough Note: {raw_bullet}"
        raw = await self._call_ai(ENHANCE_BULLET_SYSTEM_PROMPT, user_content)
        parsed = self._parse_json(raw)
        return parsed.get("bullets", [])

    async def generate_summary_options(self, headline: str, skills: list, experiences: list) -> List[Dict[str, str]]:
        """Generate 3 professional summary variations."""
        user_content = json.dumps({
            "headline": headline,
            "skills": skills,
            "experiences": experiences[:3]
        }, ensure_ascii=False, indent=2)
        raw = await self._call_ai(GENERATE_SUMMARY_SYSTEM_PROMPT, user_content)
        parsed = self._parse_json(raw)
        return parsed.get("summaries", [])

    async def parse_resume_text(self, text: str) -> dict:
        """Parse raw resume text into structured CV builder JSON."""
        raw = await self._call_ai(PARSE_RESUME_SYSTEM_PROMPT, text)
        return self._parse_json(raw)

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
