"""PDF Service — HTML template rendering + Playwright PDF generation."""

import logging
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from playwright.async_api import async_playwright

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
)


class PDFService:
    """Renders Jinja2 HTML templates and converts to PDF via Playwright."""

    @staticmethod
    async def render_html(template_name: str, data: dict) -> str:
        """Render a Jinja2 template with the given data."""
        template = jinja_env.get_template(f"{template_name}.html")
        return template.render(**data)

    @staticmethod
    async def html_to_pdf(html_content: str) -> bytes:
        """Convert HTML string to PDF bytes using Playwright Chromium."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.set_content(html_content, wait_until="networkidle")
            pdf_bytes = await page.pdf(
                format="A4",
                margin={"top": "20mm", "bottom": "20mm", "left": "15mm", "right": "15mm"},
                print_background=True,
            )
            await browser.close()
            return pdf_bytes

    @classmethod
    async def generate_cv_pdf(cls, template_name: str, cv_data: dict) -> bytes:
        """Full pipeline: data → HTML → PDF bytes."""
        logger.info(f"Generating PDF with template: {template_name}")
        html = await cls.render_html(f"cv_{template_name}", cv_data)
        pdf = await cls.html_to_pdf(html)
        logger.info(f"PDF generated: {len(pdf)} bytes")
        return pdf

    @classmethod
    async def generate_cover_letter_pdf(cls, letter_text: str, personal: dict) -> bytes:
        """Generate a cover letter PDF."""
        html = await cls.render_html("cover_letter", {
            "letter_text": letter_text,
            "personal": personal,
        })
        return await cls.html_to_pdf(html)
