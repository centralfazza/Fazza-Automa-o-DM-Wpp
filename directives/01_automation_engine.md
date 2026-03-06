# Automation Engine

## Goal
Processar comentários do Instagram e executar ações automáticas (responder + enviar DM).

## Input
- Webhook Instagram: {comment_id, text, from: {id, username}, post_id}

## Tools/Scripts
- execution/backend/automation_engine.py
- execution/backend/instagram_service.py
- execution/backend/database.py

## Flow
1. Recebe comentário via webhook
2. Busca company via instagram_account_id (SQLite)
3. Busca automações ativas (triggers.type = "comment")
4. Match keywords no texto do comentário
5. Se match: executa actions sequencialmente
6. Loga resultado no banco

## Edge Cases
- Comentário sem keywords: não executa nada
- Instagram API rate limit: retry com backoff exponencial
- Token expirado: retorna erro 401, notifica admin
