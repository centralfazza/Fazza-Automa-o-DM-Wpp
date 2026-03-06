# Fazza Automation - Instagram & WhatsApp

Sistema de automação inteligente para Fazza CRM.

## Arquitetura (3 Camadas)

Este projeto segue a arquitetura de 3 camadas definida em `AGENTE.MD`:

1.  **Layer 1 - DIRECTIVES**: Regras de negócio e documentação do motor de automação.
2.  **Layer 2 - ORCHESTRATION**: Decisões inteligentes (Agente I.A.).
3.  **Layer 3 - EXECUTION**: Código Python determinístico (FastAPI, SQLAlchemy).

## Tecnologias

- Python 3.10+
- FastAPI
- SQLAlchemy (SQLite)
- Instagram Graph API
- Vercel (Deployment)

## Como rodar localmente

1. Crie um ambiente virtual: `python -m venv venv`
2. Ative: `source venv/bin/activate` (Mac/Linux)
3. Instale: `pip install -r requirements.txt`
4. Configure o `.env`
5. Rode: `uvicorn execution.backend.app:app --reload`

## Estrutura de Pastas

- `/directives`: Documentação das regras de automação.
- `/execution`: Código fonte do sistema.
  - `/backend`: Core logic, models, database.
  - `/routes`: Endpoints da API.
- `/api`: Entry point para o Vercel.
