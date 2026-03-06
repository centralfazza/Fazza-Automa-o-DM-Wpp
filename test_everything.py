#!/usr/bin/env python3
import requests
import json
import uuid

# Cores para o terminal
GREEN = "\033[92m"
BLUE = "\033[94m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

BASE_URL = "http://localhost:8000"

def log_step(message):
    print(f"\n{BLUE}{BOLD}🚀 {message}{RESET}")

def log_success(message):
    print(f"{GREEN}✅ {message}{RESET}")

def log_error(message, detail=None):
    print(f"{RED}❌ {message}{RESET}")
    if detail:
        print(f"{RED}{detail}{RESET}")

def test_everything():
    print(f"{BOLD}--- INICIANDO TESTE COMPLETO DA API ---{RESET}")

    # 1. Testar /health
    log_step("Testando GET /health")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            log_success(f"Servidor Online: {response.json()}")
        else:
            log_error(f"Erro no Health Check: {response.status_code}")
    except Exception as e:
        log_error("Falha ao conectar no servidor", e)
        return

    # 2. Criar Empresa de Teste
    company_id = f"cia_{uuid.uuid4().hex[:6]}"
    log_step(f"Criando Empresa de Teste: {company_id}")
    company_data = {
        "id": company_id,
        "name": "Super Loja de Teste",
        "instagram_account_id": f"ig_{uuid.uuid4().hex[:8]}",
        "instagram_access_token": "token_ficticio_123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/companies/", json=company_data)
        if response.status_code in [200, 201]:
            log_success(f"Empresa criada: {response.json()['name']}")
        else:
            log_error("Erro ao criar empresa", response.text)
            return
    except Exception as e:
        log_error("Erro na requisição de criação de empresa", e)
        return

    # 3. Criar Automação de Teste
    log_step("Criando Automação de Teste (Comentário -> DM)")
    automation_id = f"auto_{uuid.uuid4().hex[:6]}"
    automation_data = {
        "id": automation_id,
        "company_id": company_id,
        "name": "Auto Resposta: 'QUERO'",
        "platform": "instagram",
        "triggers": {
            "type": "comment",
            "keywords": ["QUERO", "valor", "preço"]
        },
        "actions": [
            {
                "order": 1,
                "type": "reply_comment",
                "content": "Olá! Te enviamos os detalhes no Direct 📩"
            },
            {
                "order": 2,
                "type": "send_dm",
                "content": "Oi {username}! Aqui está o link que você pediu: fatura.fazzacrm.com/item123"
            }
        ]
    }

    try:
        response = requests.post(f"{BASE_URL}/api/automations/", json=automation_data)
        if response.status_code in [200, 201]:
            log_success(f"Automação '{response.json()['name']}' criada com sucesso!")
        else:
            log_error("Erro ao criar automação", response.text)
    except Exception as e:
        log_error("Erro na requisição de criação de automação", e)

    # 4. Listar Automações
    log_step(f"Listando Automações para a empresa {company_id}")
    try:
        response = requests.get(f"{BASE_URL}/api/automations/?company_id={company_id}")
        if response.status_code == 200:
            automations = response.json()
            log_success(f"Total de automações encontradas: {len(automations)}")
            for auto in automations:
                print(f"{YELLOW}  - [{auto['id']}] {auto['name']} ({auto['platform']}){RESET}")
        else:
            log_error("Erro ao listar automações", response.text)
    except Exception as e:
        log_error("Erro na requisição de listagem", e)

    print(f"\n{BOLD}{GREEN}--- TESTES FINALIZADOS COM SUCESSO ---{RESET}")

if __name__ == "__main__":
    test_everything()
