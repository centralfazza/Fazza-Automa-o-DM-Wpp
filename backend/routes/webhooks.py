from fastapi import APIRouter, Request, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
import models
import os
from services.execution_engine import ExecutionEngine
from .automations import match_automation

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "fazza_instagram_webhook_2024")

@router.get("/instagram")
@router.get("/whatsapp")
async def verify_webhook(request: Request):
    # Verification for Meta Webhooks
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        from fastapi.responses import Response
        return Response(content=challenge, media_type="text/plain")
    
    raise HTTPException(status_code=403, detail="Verification failed")

async def run_native_automation(automation_id: str, sender: str, platform: str, message: str):
    # Create a fresh session for the background task to avoid closed session errors
    from database import AsyncSessionLocal
    async with AsyncSessionLocal() as db_session:
        # Fetch full automation and contact data
        result = await db_session.execute(select(models.Automation).where(models.Automation.id == automation_id))
        automation = result.scalar_one_or_none()
        
        if not automation:
            return

        # Check/Create contact
        contact_result = await db_session.execute(
            select(models.Contact).where(
                models.Contact.external_id == sender,
                models.Contact.platform == platform
            )
        )
        contact = contact_result.scalar_one_or_none()
        
        if not contact:
            contact = models.Contact(external_id=sender, platform=platform, name=f"User_{sender[:5]}")
            db_session.add(contact)
            await db_session.commit()
            await db_session.refresh(contact)

        # Initialize Engine
        engine = ExecutionEngine(
            automation=automation.__dict__, 
            contact=contact.__dict__, 
            initial_message=message
        )
        await engine.run()

@router.post("/instagram")
async def instagram_webhook(payload: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    print(f"Instagram Webhook received: {payload}")
    
    try:
        # Extract sender and message from DMs
        entry = payload.get('entry', [{}])[0]
        messaging = entry.get('messaging', [{}])
        
        if messaging:
            msg_data = messaging[0]
            sender_id = msg_data.get('sender', {}).get('id')
            message_obj = msg_data.get('message', {})
            message_text = message_obj.get('text', '')

            if sender_id and message_text:
                matched_auto = await match_automation(
                    sender=sender_id,
                    platform='instagram',
                    message=message_text,
                    db=db
                )
                
                if matched_auto:
                    background_tasks.add_task(run_native_automation, matched_auto.id, sender_id, 'instagram', message_text)
                    return {"status": "automation_triggered", "flow_id": str(matched_auto.id)}

        # Extract comments from Changes
        changes = entry.get('changes', [{}])
        if changes:
            change_val = changes[0].get('value', {})
            if change_val.get('item') == 'comment' and change_val.get('verb') == 'add':
                sender_id = change_val.get('from', {}).get('id')
                message_text = change_val.get('text', '')
                
                if sender_id and message_text:
                    matched_auto = await match_automation(
                        sender=sender_id,
                        platform='instagram',
                        message=message_text,
                        trigger_type='comment',
                        db=db
                    )
                    
                    if matched_auto:
                        background_tasks.add_task(run_native_automation, matched_auto.id, sender_id, 'instagram', message_text)
                        return {"status": "comment_automation_triggered", "flow_id": str(matched_auto.id)}

    except Exception as e:
        print(f"Error processing IG webhook: {e}")
    
    return {"status": "received", "forward_to_n8n": False}

@router.post("/whatsapp")
async def whatsapp_webhook(payload: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    print(f"WhatsApp Webhook received: {payload}")
    
    try:
        # Extract WhatsApp data
        value = payload.get('entry', [{}])[0].get('changes', [{}])[0].get('value', {})
        messages = value.get('messages', [])
        if not messages:
            return {"status": "no_messages"}
            
        message = messages[0]
        sender_id = message.get('from')
        message_text = message.get('text', {}).get('body', '')

        if sender_id and message_text:
            matched_auto = await match_automation(
                sender=sender_id,
                platform='whatsapp',
                message=message_text,
                db=db
            )
            
            if matched_auto:
                background_tasks.add_task(run_native_automation, matched_auto.id, sender_id, 'whatsapp', message_text)
                return {"status": "automation_triggered", "flow_id": str(matched_auto.id)}

    except Exception as e:
        print(f"Error processing WA webhook: {e}")

    return {"status": "received"}

@router.get("/active-flows")
async def get_active_flows(platform: str, db: AsyncSession = Depends(get_db)):
    """Helper for internal usage to fetch active automations for a platform"""
    result = await db.execute(
        select(models.Automation).where(
            models.Automation.status == "active",
            models.Automation.platform == platform
        )
    )
    return result.scalars().all()
