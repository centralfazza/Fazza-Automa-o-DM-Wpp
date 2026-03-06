import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def test_comment_webhook():
    print("🧪 Simulando Webhook de Comentário do Instagram...")
    
    # Payload format based on Meta's documentation
    payload = {
        "object": "instagram",
        "entry": [
            {
                "id": "123456789",
                "time": 1600000000,
                "changes": [
                    {
                        "value": {
                            "from": {
                                "id": "user_id_001",
                                "username": "test_user"
                            },
                            "item": "comment",
                            "verb": "add",
                            "comment_id": "comment_id_999",
                            "media": {
                                "id": "media_id_111",
                                "media_product_type": "REELS"
                            },
                            "text": "Eu QUERO saber mais!"
                        },
                        "field": "comments"
                    }
                ]
            }
        ]
    }
    
    response = requests.post(f"{BASE_URL}/api/webhooks/instagram", json=payload)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    assert response.status_code == 200
    assert response.json().get("status") == "comment_automation_triggered"
    print("   ✅ Sucesso: O webhook capturou o comentário e disparou a automação!")

if __name__ == "__main__":
    # First, make sure the automation exists
    # We will use 'test_automation_001' from test_api.py or something similar
    print("🚀 Iniciando teste de Webhook de Comentários\n")
    try:
        test_comment_webhook()
    except Exception as e:
        print(f"❌ Falha no teste: {e}")
        print("Certifique-se de que o backend está rodando e existe uma automação ativa para 'instagram' com trigger 'comment' e keyword 'QUERO'.")
