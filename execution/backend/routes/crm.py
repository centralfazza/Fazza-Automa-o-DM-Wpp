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
    db_message = models.Message(
        conversation_id=conversation_id,
        sender_type="agent",
        **message.model_dump()
    )
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    return db_message
