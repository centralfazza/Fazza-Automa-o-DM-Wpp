# Instagram Graph API

## Goal
Integrar com a API do Instagram para responder comentários e enviar DMs.

## Base URL
`https://graph.facebook.com/v19.0/`

## Endpoints
- `POST /{comment_id}/replies`: Responde a um comentário especificando `message`.
- `POST /{instagram_business_account_id}/messages`: Envia DM especificando `recipient` e `message`.

## Auth
- System User Access Token (Long-lived)
- Permission: `instagram_basic`, `instagram_manage_comments`, `instagram_manage_messages`.

## Constraints
- Apenas contas Business/Creator podem usar a API.
- O usuário deve ter deixado um comentário ou enviado uma mensagem nas últimas 24h para receber DM.
