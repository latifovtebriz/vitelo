import asyncio
import httpx

RESEND_API_KEY = "re_hV13drPC_8r5woUzcf3MH8Y3EGZ5FhiSY"
RESEND_API_URL = "https://api.resend.com/emails"

async def test():
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    
    # 1. Test with no-reply@vitelo.me
    print("Testing with no-reply@vitelo.me to latifovtebriz@gmail.com...")
    payload1 = {
        "from": "Vitelo <no-reply@vitelo.me>",
        "to": ["latifovtebriz@gmail.com"],
        "subject": "Vitelo Domain Test ✨",
        "html": "<h1>Domain Verified Test</h1>",
    }
    async with httpx.AsyncClient() as client:
        res1 = await client.post(RESEND_API_URL, headers=headers, json=payload1)
        print(f"Result 1 (vitelo.me): {res1.status_code} - {res1.text}")

    # 2. Test with onboarding@resend.dev to viteloapp@gmail.com
    print("\nTesting with onboarding@resend.dev to viteloapp@gmail.com...")
    payload2 = {
        "from": "Vitelo <onboarding@resend.dev>",
        "to": ["viteloapp@gmail.com"],
        "subject": "Vitelo Onboarding Test ✨",
        "html": "<h1>Onboarding Test</h1>",
    }
    async with httpx.AsyncClient() as client:
        res2 = await client.post(RESEND_API_URL, headers=headers, json=payload2)
        print(f"Result 2 (resend.dev): {res2.status_code} - {res2.text}")

if __name__ == "__main__":
    asyncio.run(test())
