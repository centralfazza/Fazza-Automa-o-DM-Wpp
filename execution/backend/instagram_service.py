import requests
import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)

class InstagramAPI:
    """Serviço para interagir com a Instagram Graph API"""

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://graph.facebook.com/v19.0"

    def _post(self, endpoint: str, data: dict, max_retries: int = 3):
        url = f"{self.base_url}/{endpoint}"
        params = {"access_token": self.access_token}

        for attempt in range(max_retries):
            response = requests.post(url, params=params, json=data)

            # 429 = Rate Limit, 5xx = Server Error
            if response.status_code == 429 or response.status_code >= 500:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt # 1, 2, 4 seconds
                    logger.warning(f"Instagram API attempt {attempt+1} failed ({response.status_code}). Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue

            if response.status_code != 200:
                logger.error(f"Instagram API Error: {response.text}")
                response.raise_for_status()

            return response.json()

    def _get(self, endpoint: str, extra_params: Optional[dict] = None):
        url = f"{self.base_url}/{endpoint}"
        p = {"access_token": self.access_token}
        if extra_params:
            p.update(extra_params)
        response = requests.get(url, params=p)
        if response.status_code != 200:
            logger.error(f"Instagram API GET Error: {response.text}")
            response.raise_for_status()
        return response.json()

    def reply_to_comment(self, comment_id: str, message: str):
        """Responde a um comentário no Instagram"""
        return self._post(f"{comment_id}/replies", {"message": message})

    def send_dm(self, recipient_id: str, message: str):
        """Envia mensagem direta (DM) para um usuário"""
        # Nota: Só funciona se o usuário interagiu com a página nas últimas 24h
        return self._post("me/messages", {
            "recipient": {"id": recipient_id},
            "message": {"text": message}
        })

    def get_user_info(self, user_id: str = "me") -> dict:
        """Busca informações do usuário/conta Instagram"""
        return self._get(user_id, {"fields": "id,name,username"})

