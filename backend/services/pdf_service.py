"""PDF Service — Jinja2 + Playwright async PDF generation.

- Renders CV/Cover Letter HTML templates
- Supports watermark overlay (via CSS)
- AZ character support (Noto Sans from Google Fonts)
- Returns PDF as bytes
"""

import logging
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from playwright.async_api import async_playwright

logger = logging.getLogger("vitelo.pdf")

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))


async def generate_cv_pdf(
    cv_data: dict,
    template_name: str = "cv_modern",
    watermark: bool = True,
    language: str = "en",
) -> bytes:
    """Render CV HTML template and export to PDF via Playwright.

    Args:
        cv_data: AI-generated structured CV dict
        template_name: "cv_modern" or "cv_minimal"
        watermark: If True, adds diagonal VITELO watermark
        language: "en", "az", "tr"

    Returns:
        PDF as bytes
    """
    template = jinja_env.get_template(f"{template_name}.html")
    html_content = template.render(
        cv=cv_data,
        watermark=watermark,
        language=language,
    )

    try:
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox"],
            )
            page = await browser.new_page()
            await page.set_content(html_content, wait_until="networkidle")
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "15mm", "bottom": "15mm", "left": "12mm", "right": "12mm"},
            )
            await browser.close()
        return pdf_bytes
    except Exception as e:
        logger.error(f"Playwright PDF generation failed, returning HTML payload: {e}")
        return html_content.encode("utf-8")


async def generate_cover_letter_pdf(
    cover_letter_text: str,
    personal: dict,
    watermark: bool = False,
) -> bytes:
    """Render cover letter as PDF."""
    template = jinja_env.get_template("cover_letter.html")
    html_content = template.render(
        text=cover_letter_text,
        personal=personal,
        watermark=watermark,
    )

    try:
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox"],
            )
            page = await browser.new_page()
            await page.set_content(html_content, wait_until="networkidle")
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "15mm", "bottom": "15mm", "left": "12mm", "right": "12mm"},
            )
            await browser.close()
        return pdf_bytes
    except Exception as e:
        logger.error(f"Cover letter PDF generation failed: {e}")
        return html_content.encode("utf-8")
