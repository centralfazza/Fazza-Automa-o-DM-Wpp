from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
import models

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

@router.get("/instagram")
async def get_instagram_accounts(db: AsyncSession = Depends(get_db)):
    # Mocking for now, will query models.Channel in full implementation
    return [{"id": "ig_1", "username": "fazza_crm", "status": "connected"}]

@router.post("/instagram/connect")
async def connect_instagram(db: AsyncSession = Depends(get_db)):
    return {"message": "Redirect to Meta Auth or success", "status": "pending"}

@router.get("/whatsapp")
async def get_whatsapp_accounts(db: AsyncSession = Depends(get_db)):
    return [{"id": "wa_1", "phone": "5511999999999", "status": "connected"}]

@router.post("/whatsapp/connect")
async def connect_whatsapp(db: AsyncSession = Depends(get_db)):
    return {"message": "Connect via WhatsApp Cloud API", "status": "pending"}
