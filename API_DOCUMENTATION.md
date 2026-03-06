# API Documentation - Fazza Automation

## Automations
- `GET /api/automations/?company_id={id}`: Lista automações de uma empresa.
- `POST /api/automations/`: Cria nova automação.

## Webhooks
- `GET /api/webhooks/instagram`: Verificação do webhook do Facebook.
- `POST /api/webhooks/instagram`: Recebimento de eventos (comentários).

## Companies
- `POST /api/companies/`: Cadastra uma nova empresa.
- `GET /api/companies/{id}`: Detalhes da empresa.

## Analytics
- `GET /api/analytics/?automation_id={id}`: Logs de execução.
