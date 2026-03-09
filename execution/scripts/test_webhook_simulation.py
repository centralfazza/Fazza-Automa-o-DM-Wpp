import hmac
import hashlib
import json
import requests
import time

# Configurações do teste
WEBHOOK_URL = "http://localhost:8000/api/webhooks/instagram"
APP_SECRET = "seu_app_secret_aqui"  # Deve ser o mesmo no seu .env de teste
VERIFY_TOKEN = "dev_verify_token_123456"

def test_verification():
    """Simula o GET de verificação do Facebook"""
    print("Testing Webhook Verification (GET)...")
    params = {
        "hub.mode": "subscribe",
        "hub.verify_token": VERIFY_TOKEN,
        "hub.challenge": "123456789"
    }
    try:
        response = requests.get(WEBHOOK_URL, params=params)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        if response.text == "123456789":
            print("✅ Verification successful!")
        else:
            print("❌ Verification failed.")
    except Exception as e:
        print(f"Error: {e}")

def test_message_post():
    """Simula o POST de uma mensagem (DM) do Instagram com assinatura HMAC"""
    print("\nTesting Message Hook (POST)...")
    
    payload = {
        "object": "instagram",
        "entry": [
            {
                "id": "INSTAGRAM_ACCOUNT_ID",
                "time": int(time.time()),
                "messaging": [
                    {
                        "sender": {"id": "SENDER_ID"},
                        "recipient": {"id": "INSTAGRAM_ACCOUNT_ID"},
                        "timestamp": int(time.time() * 1000),
                        "message": {"mid": "mid.123", "text": "quero saber o preço"}
                    }
                ]
            }
        ]
    }
    
    body = json.dumps(payload)
    signature = hmac.new(
        APP_SECRET.encode('utf-8'),
        body.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    headers = {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": f"sha256={signature}"
    }
    
    try:
        response = requests.post(WEBHOOK_URL, data=body, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200:
            print("✅ Webhook POST successful!")
        else:
            print("❌ Webhook POST failed.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("--- Fazza Webhook Simulator ---")
    print("Make sure your server is running on http://localhost:3000")
    test_verification()
    # Descomente abaixo se o APP_SECRET estiver configurado no .env
    # test_message_post()
