import os
import httpx
import asyncio
from typing import Optional

class MetaAPIClient:
    def __init__(self):
        self.ig_token = os.getenv("META_ACCESS_TOKEN", "")
        self.wa_token = os.getenv("WHATSAPP_API_TOKEN", "")
        self.ig_url = "https://graph.facebook.com/v18.0"
        self.wa_url = "https://graph.facebook.com/v18.0"

    async def _send_with_retry(self, url: str, headers: dict, payload: dict) -> bool:
        """Helper to send requests with exponential backoff"""
        import time
        max_retries = 3
        backoff = 1 # starting with 1 second

        async with httpx.AsyncClient() as client:
            for attempt in range(max_retries):
                try:
                    response = await client.post(url, headers=headers, json=payload)
                    response.raise_for_status()
                    return True
                except Exception as e:
                    print(f"⚠️ Attempt {attempt+1} failed: {e}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(backoff)
                        backoff *= 2 # exponential
                    else:
                        print(f"❌ All {max_retries} attempts failed.")
                        return False
        return False

    async def send_instagram_message(self, recipient_id: str, message_text: str) -> bool:
        """Sends a text message via Instagram Graph API"""
        if not self.ig_token:
            print(f"[IG SIMULATION] To {recipient_id}: {message_text}")
            return True

        url = f"{self.ig_url}/me/messages"
        headers = {"Authorization": f"Bearer {self.ig_token}"}
        payload = {
            "recipient": {"id": recipient_id},
            "message": {"text": message_text}
        }
        return await self._send_with_retry(url, headers, payload)

    async def send_whatsapp_message(self, phone_number: str, message_text: str, phone_number_id: str) -> bool:
        """Sends a text message via WhatsApp Cloud API"""
        if not self.wa_token:
            print(f"[WA SIMULATION] To {phone_number}: {message_text}")
            return True

        url = f"{self.wa_url}/{phone_number_id}/messages"
        headers = {"Authorization": f"Bearer {self.wa_token}"}
        payload = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "text",
            "text": {"body": message_text}
        }
        return await self._send_with_retry(url, headers, payload)

meta_api = MetaAPIClient()
