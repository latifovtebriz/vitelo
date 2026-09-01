import asyncio
import httpx

RESEND_API_KEY = "re_hV13drPC_8r5woUzcf3MH8Y3EGZ5FhiSY"
RESEND_API_URL = "https://api.resend.com/emails"

async def test():
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "from": "Vitelo <no-reply@vitelo.me>",
        "to": ["latifovtabriz02@gmail.com"],
        "subject": "Vitelo Verification Test ✨",
        "html": "<h1>Test to latifovtabriz02@gmail.com</h1>",
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(RESEND_API_URL, headers=headers, json=payload)
        print(f"Status: {res.status_code}")
        print(f"Body: {res.text}")

if __name__ == "__main__":
    asyncio.run(test())
