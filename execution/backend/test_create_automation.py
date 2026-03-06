import requests
import json

url = "http://localhost:8000/api/automations/"
headers = {
    "Content-Type": "application/json"
}
payload = {
    "company_id": "test_company_1",
    "name": "Welcome Bot - Teste",
    "platform": "instagram",
    "isActive": True,
    "triggers": {
        "type": "keyword",
        "keywords": ["oi", "olá", "hello", "teste"]
    },
    "actions": [
        {
            "order": 1,
            "type": "send_dm",
            "content": "Olá {username}! Bem-vindo! Esta é uma automação de teste 🤖"
        }
    ]
}

try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
