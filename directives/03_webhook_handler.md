# Webhook Handler

## Goal
Receber, validar e rotear notificações em tempo real do Instagram.

## URL
`POST /api/webhooks/instagram`

## Validation (X-Hub-Signature-256)
- Validar assinatura enviada pelo Facebook usando o `APP_SECRET`.
- Se inválida: retornar 403 Forbidden.

## Flow
1. Recebe payload
2. Verifica se é um `entry` de `instagram`
3. Itera sobre `changes`
4. Se `field == 'comments'`:
   - Extrai dados: `id`, `text`, `from`, `post_id`
   - Chama `AutomationEngine.process_instagram_comment()`
5. Retorna 200 OK rapidamente para evitar timeouts.

## Verification Flow (GET)
- Responder ao desafio `hub.challenge` se `hub.verify_token` for igual ao configurado no `.env`.
