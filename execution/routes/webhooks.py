from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import hmac
import hashlib
from execution.backend.database import get_db
from execution.backend.automation_engine import AutomationEngine

router = APIRouter()


@router.get("/instagram")
async def verify_instagram_webhook(request: Request):
    """Verificação do webhook pelo Facebook"""
    params = request.query_params
    verify_token = os.getenv("INSTAGRAM_VERIFY_TOKEN")

    if params.get("hub.mode") == "subscribe" and params.get("hub.verify_token") == verify_token:
        return int(params.get("hub.challenge"))

    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/instagram")
async def handle_instagram_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Recebe webhooks do Instagram.
    Processa: comments, messages (DMs) e follows (novos seguidores).
    """
    payload = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")
    # Tenta pegar APP_SECRET ou INSTAGRAM_APP_SECRET
    app_secret = os.getenv("APP_SECRET") or os.getenv("INSTAGRAM_APP_SECRET")

    # Valida assinatura HMAC
    if signature and app_secret:
        expected_sig = hmac.new(
            app_secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(f"sha256={expected_sig}", signature):
            raise HTTPException(status_code=403, detail="Invalid signature")
    elif not app_secret:
        print("Warning: APP_SECRET not set, signature validation skipped")

    data = await request.json()
    engine = AutomationEngine(db)

    if data.get("object") == "instagram":
        for entry in data.get("entry", []):
            instagram_account_id = entry.get("id")

            # ── Changes (comentários, mensagens, seguidores) ───────────────
            for change in entry.get("changes", []):
                field = change.get("field")
                value = change.get("value", {})

                if field == "comments":
                    value["instagram_account_id"] = instagram_account_id
                    engine.process_instagram_comment(value)

                elif field == "messages":
                    # value = {sender: {id}, recipient: {id}, message: {mid, text}}
                    sender = value.get("sender", {})
                    message = value.get("message", {})
                    engine.process_instagram_dm({
                        "sender_id": sender.get("id"),
                        "sender_username": sender.get("username", sender.get("id")),
                        "recipient_id": value.get("recipient", {}).get("id"),
                        "message_text": message.get("text", ""),
                        "instagram_account_id": instagram_account_id,
                    })

                elif field == "follows":
                    engine.process_new_follower({
                        "follower_id": value.get("follower_id") or value.get("id"),
                        "follower_username": value.get("username", ""),
                        "instagram_account_id": instagram_account_id,
                    })

            # ── Messaging (formato alternativo do Facebook para DMs) ───────
            for messaging in entry.get("messaging", []):
                sender_id = messaging.get("sender", {}).get("id")
                recipient_id = messaging.get("recipient", {}).get("id")
                message = messaging.get("message", {})
                if message and not message.get("is_echo"):
                    engine.process_instagram_dm({
                        "sender_id": sender_id,
                        "sender_username": sender_id,
                        "recipient_id": recipient_id,
                        "message_text": message.get("text", ""),
                        "instagram_account_id": instagram_account_id,
                    })

    return {"status": "processed"}
