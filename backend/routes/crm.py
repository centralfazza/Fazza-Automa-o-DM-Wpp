from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db
import models
import schemas
from uuid import UUID

router = APIRouter(prefix="/api/crm", tags=["crm"])

# --- CONTACTS ---
@router.get("/contacts", response_model=List[schemas.Contact])
async def list_contacts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Contact))
    return result.scalars().all()

@router.get("/contacts/{contact_id}", response_model=schemas.Contact)
async def get_contact(contact_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Contact).where(models.Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.post("/contacts/{contact_id}/tags")
async def add_contact_tags(contact_id: UUID, tags: List[str], db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Contact).where(models.Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    current_tags = contact.tags or []
    for tag in tags:
        if tag not in current_tags:
            current_tags.append(tag)
    contact.tags = current_tags
    await db.commit()
    return {"status": "success", "tags": contact.tags}

# --- CONVERSATIONS ---
@router.get("/conversations")
async def list_conversations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Conversation))
    return result.scalars().all()

@router.post("/conversations/{conversation_id}/messages", response_model=schemas.Message)
async def save_conversation_message(conversation_id: UUID, message: schemas.MessageCreate, db: AsyncSession = Depends(get_db)):
    db_message = models.Message(
        conversation_id=conversation_id,
        **message.model_dump()
    )
    db.add(db_message)
    
    # Update last message in conversation
    result = await db.execute(select(models.Conversation).where(models.Conversation.id == conversation_id))
    conv = result.scalar_one_or_none()
    if conv:
        conv.last_message = message.content
        
    await db.commit()
    await db.refresh(db_message)
    return db_message

# --- MESSAGES ---
@router.post("/messages/send", response_model=schemas.Message)
async def send_manual_message(conversation_id: UUID, message: schemas.MessageCreate, db: AsyncSession = Depends(get_db)):
    # 1. Fetch conversation and contact
    result = await db.execute(select(models.Conversation).where(models.Conversation.id == conversation_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    contact_result = await db.execute(select(models.Contact).where(models.Contact.id == conv.contact_id))
    contact = contact_result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # 2. Send message via Meta API — lookup dynamic token from Channel
    from services.meta_api import meta_api
    
    channel_result = await db.execute(
        select(models.Channel).where(
            models.Channel.platform == contact.platform,
            models.Channel.is_active == True
        )
    )
    channel = channel_result.scalar_one_or_none()
    dynamic_token = channel.access_token if channel else None
    
    success = False
    if contact.platform == 'instagram':
        success = await meta_api.send_instagram_message(contact.external_id, message.content, dynamic_token)
    elif contact.platform == 'whatsapp':
        phone_number_id = channel.provider_id if channel else "default_wa_id"
        success = await meta_api.send_whatsapp_message(contact.phone or "unknown", message.content, phone_number_id, dynamic_token)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send message via Meta API")

    # 3. Save to DB
    db_message = models.Message(
        conversation_id=conversation_id,
        content=message.content,
        sender_type="agent",
    )
    db.add(db_message)
    conv.last_message = message.content
    
    await db.commit()
    await db.refresh(db_message)
    return db_message
