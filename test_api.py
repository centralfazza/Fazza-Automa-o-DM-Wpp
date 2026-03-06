#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("🧪 Testando /health...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    assert response.status_code == 200
    print("   ✅ Passou!\n")

def test_create_company():
    print("🧪 Testando POST /api/companies...")
    # Ajustado para incluir ID fictício se necessário ou permitir que o backend gere
    data = {
        "id": "test_company_001",
        "name": "Empresa Teste",
        "instagram_account_id": "test_instagram_123",
        "instagram_access_token": "mock_token"
    }
    response = requests.post(f"{BASE_URL}/api/companies", json=data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    assert response.status_code in [200, 201]
    print("   ✅ Passou!\n")
    return response.json()['id']

def test_create_automation(company_id):
    print("🧪 Testando POST /api/automations...")
    data = {
        "id": "test_automation_001",
        "company_id": company_id,
        "name": "Comentário → DM Teste",
        "platform": "instagram",
        "is_active": True,
        "triggers": {
            "type": "comment",
            "keywords": ["QUERO", "quero"]
        },
        "actions": [
            {
                "order": 1,
                "type": "reply_comment",
                "content": "Enviamos no direct! 📩"
            },
            {
                "order": 2,
                "type": "send_dm",
                "content": "Olá {username}! Link: exemplo.com"
            }
        ]
    }
    response = requests.post(f"{BASE_URL}/api/automations", json=data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    assert response.status_code in [200, 201]
    print("   ✅ Passou!\n")
    return response.json()['id']

def test_list_automations():
    print("🧪 Testando GET /api/automations...")
    # Adicionado company_id pois o endpoint GET requer filtragem por empresa na implementação atual
    response = requests.get(f"{BASE_URL}/api/automations/?company_id=test_company_001")
    print(f"   Status: {response.status_code}")
    print(f"   Total: {len(response.json())} automações")
    assert response.status_code == 200
    print("   ✅ Passou!\n")

if __name__ == "__main__":
    print("🚀 Iniciando testes de API\n")
    
    try:
        test_health()
        company_id = test_create_company()
        automation_id = test_create_automation(company_id)
        test_list_automations()
        
        print("🎉 TODOS OS TESTES PASSARAM!")
        
    except Exception as e:
        print(f"❌ ERRO: {e}")
