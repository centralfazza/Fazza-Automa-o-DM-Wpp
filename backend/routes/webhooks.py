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
    """Meta Webhook verification (GET challenge-response)."""
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        from fastapi.responses import Response
        return Response(content=challenge, media_type="text/plain")
    
    raise HTTPException(status_code=403, detail="Verification failed")

async def run_native_automation(automation_id: str, sender: str, platform: str, message: str, page_id: str = ""):
    """Background task: fetch automation + contact + channel token, then run the flow."""
    from database import AsyncSessionLocal
    async with AsyncSessionLocal() as db_session:
        try:
            # Fetch automation
            result = await db_session.execute(select(models.Automation).where(models.Automation.id == automation_id))
            automation = result.scalar_one_or_none()
            if not automation:
                print(f"❌ Automation {automation_id} not found")
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

            # Fetch dynamic access token from channels table using page_id
            access_token = None
            if page_id:
                channel_result = await db_session.execute(
                    select(models.Channel).where(
                        models.Channel.provider_id == page_id,
                        models.Channel.platform == platform,
                        models.Channel.is_active == True
                    )
                )
                channel = channel_result.scalar_one_or_none()
                if channel:
                    access_token = channel.access_token
                    print(f"✅ Found channel token for {platform} page {page_id}")
                else:
                    print(f"⚠️ No channel found for {platform} page {page_id}, using env fallback")

            # Run the automation flow
            engine = ExecutionEngine(
                automation=automation.__dict__, 
                contact=contact.__dict__, 
                initial_message=message,
                access_token=access_token
            )
            await engine.run()

            # Log analytics
            try:
                log = models.AnalyticsLog(
                    automation_id=automation.id,
                    trigger_type="webhook",
                    recipient=sender,
                    success=True,
                    company_id=automation.company_id,
                )
                db_session.add(log)
                automation.stats_triggered = (automation.stats_triggered or 0) + 1
                automation.stats_finished = (automation.stats_finished or 0) + 1
                await db_session.commit()
            except Exception as log_err:
                print(f"⚠️ Analytics log failed (non-critical): {log_err}")

        except Exception as e:
            print(f"❌ Background automation error: {e}")

@router.post("/instagram")
async def instagram_webhook(payload: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Receives Instagram DMs and comments from Meta webhook."""
    print(f"Instagram Webhook received")
    
    try:
        entry = payload.get('entry', [{}])[0]
        page_id = entry.get('id', '')  # The Meta Page ID receiving the event
        
        # --- HANDLE DIRECT MESSAGES ---
        messaging = entry.get('messaging', [])
        
        if messaging:
            msg_data = messaging[0]
            sender_id = msg_data.get('sender', {}).get('id')
            message_obj = msg_data.get('message', {})
            message_text = message_obj.get('text', '')
            
            # CRITICAL: Skip echo messages (messages sent BY the bot)
            is_echo = message_obj.get('is_echo', False)
            if is_echo:
                return {"status": "echo_ignored"}
            
            # Skip if sender is the page itself
            if sender_id == page_id:
                return {"status": "self_message_ignored"}

            if sender_id and message_text:
                matched_auto = await match_automation(
                    sender=sender_id,
                    platform='instagram',
                    message=message_text,
                    db=db
                )
                
                if matched_auto:
                    background_tasks.add_task(
                        run_native_automation, 
                        matched_auto.id, sender_id, 'instagram', message_text, page_id
                    )
                    return {"status": "automation_triggered", "flow_id": str(matched_auto.id)}

        # --- HANDLE POST COMMENTS ---
        changes = entry.get('changes', [])
        if changes:
            change_val = changes[0].get('value', {})
            if change_val.get('item') == 'comment' and change_val.get('verb') == 'add':
                comment_from = change_val.get('from', {})
                sender_id = comment_from.get('id')
                message_text = change_val.get('text', '')
                
                # Skip comments from the page itself
                if sender_id == page_id:
                    return {"status": "own_comment_ignored"}
                
                if sender_id and message_text:
                    matched_auto = await match_automation(
                        sender=sender_id,
                        platform='instagram',
                        message=message_text,
                        trigger_type='comment',
                        db=db
                    )
                    
                    if matched_auto:
                        background_tasks.add_task(
                            run_native_automation, 
                            matched_auto.id, sender_id, 'instagram', message_text, page_id
                        )
                        return {"status": "comment_automation_triggered", "flow_id": str(matched_auto.id)}

    except Exception as e:
        print(f"Error processing IG webhook: {e}")
    
    return {"status": "received"}

@router.post("/whatsapp")
async def whatsapp_webhook(payload: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Receives WhatsApp messages from Meta webhook."""
    print(f"WhatsApp Webhook received")
    
    try:
        entry = payload.get('entry', [{}])[0]
        changes = entry.get('changes', [{}])
        if not changes:
            return {"status": "no_changes"}
        
        value = changes[0].get('value', {})
        
        # Skip status updates (delivered, read, etc.) — only process actual messages
        statuses = value.get('statuses', [])
        if statuses and not value.get('messages'):
            return {"status": "status_update_ignored"}
        
        # Extract the phone_number_id (this is the WhatsApp Business Account number)
        metadata = value.get('metadata', {})
        phone_number_id = metadata.get('phone_number_id', '')
        
        messages = value.get('messages', [])
        if not messages:
            return {"status": "no_messages"}
            
        message = messages[0]
        sender_id = message.get('from')
        
        # Only handle text messages for now
        if message.get('type') != 'text':
            return {"status": "non_text_ignored"}
        
        message_text = message.get('text', {}).get('body', '')

        if sender_id and message_text:
            matched_auto = await match_automation(
                sender=sender_id,
                platform='whatsapp',
                message=message_text,
                db=db
            )
            
            if matched_auto:
                background_tasks.add_task(
                    run_native_automation, 
                    matched_auto.id, sender_id, 'whatsapp', message_text, phone_number_id
                )
                return {"status": "automation_triggered", "flow_id": str(matched_auto.id)}

    except Exception as e:
        print(f"Error processing WA webhook: {e}")

    return {"status": "received"}

@router.get("/active-flows")
async def get_active_flows(platform: str, db: AsyncSession = Depends(get_db)):
    """Lists active automations for a platform."""
    result = await db.execute(
        select(models.Automation).where(
            models.Automation.status == "active",
            models.Automation.platform == platform
        )
    )
    return result.scalars().all()
