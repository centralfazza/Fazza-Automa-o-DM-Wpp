from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
import models
import os

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "fazza_secure_token")

@router.get("/instagram")
@router.get("/whatsapp")
async def verify_webhook(request: Request):
    # Verification for Meta Webhooks
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode and token:
        if mode == "subscribe" and token == VERIFY_TOKEN:
            return int(challenge)
        else:
            raise HTTPException(status_code=403, detail="Verification failed")
    return {"message": "Webhook verification endpoint"}

@router.post("/instagram")
async def instagram_webhook(payload: dict, db: AsyncSession = Depends(get_db)):
    # Meta sends events in an 'entry' array
    print(f"Instagram Webhook received: {payload}")
    
    # 1. Extract message text (simplified)
    # 2. Search for active automation with matching keyword
    # result = await db.execute(select(models.Automation).where(models.Automation.status == 'active'))
    
    return {"status": "received", "forward_to_n8n": True}

@router.post("/whatsapp")
async def whatsapp_webhook(payload: dict, db: AsyncSession = Depends(get_db)):
    print(f"WhatsApp Webhook received: {payload}")
    return {"status": "received", "forward_to_n8n": True}

@router.get("/active-flows")
async def get_active_flows(platform: str, db: AsyncSession = Depends(get_db)):
    # Helper for N8N to fetch active automations for a platform
    from sqlalchemy import and_
    result = await db.execute(
        select(models.Automation).where(
            and_(
                models.Automation.status == "active",
                models.Automation.flow_json["platform"].astext == platform
            )
        )
    )
    return result.scalars().all()

@router.post("/n8n")
async def n8n_callback(payload: dict):
    # Callbacks from N8N to update CRM/Execution state
    print(f"N8N Callback received: {payload}")
    return {"status": "success"}
