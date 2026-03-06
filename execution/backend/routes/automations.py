from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from database import get_db
import models
import schemas
from uuid import UUID

router = APIRouter(prefix="/api/automations", tags=["automations"])

@router.get("/match", response_model=Optional[schemas.Automation])
async def match_automation(
    message: str, 
    sender: str, 
    platform: str, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.Automation).where(
            models.Automation.platform == platform,
            models.Automation.is_active == True
        )
    )
    automations = result.scalars().all()
    
    for auto in automations:
        trigger = auto.triggers
        if not trigger: continue

        if trigger.get('type') == 'keyword':
            keywords = trigger.get('keywords', [])
            if any(kw.lower() in message.lower() for kw in keywords):
                return auto
        
        if trigger.get('type') == 'first_message':
            # Check if this sender already has a conversation/messages
            contact_check = await db.execute(
                select(models.Contact).where(
                    models.Contact.external_id == sender,
                    models.Contact.platform == platform
                )
            )
            if not contact_check.scalar_one_or_none():
                return auto
    
    return None

@router.get("/", response_model=List[schemas.Automation])
async def list_automations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Automation))
    return result.scalars().all()

@router.post("/", response_model=schemas.Automation)
async def create_automation(automation: schemas.AutomationCreate, db: AsyncSession = Depends(get_db)):
    db_automation = models.Automation(**automation.model_dump())
    db.add(db_automation)
    await db.commit()
    await db.refresh(db_automation)
    return db_automation

@router.get("/{automation_id}", response_model=schemas.Automation)
async def get_automation(automation_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Automation).where(models.Automation.id == automation_id))
    db_automation = result.scalar_one_or_none()
    if not db_automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    return db_automation

@router.put("/{automation_id}", response_model=schemas.Automation)
async def update_automation(automation_id: UUID, automation: schemas.AutomationUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Automation).where(models.Automation.id == automation_id))
    db_automation = result.scalar_one_or_none()
    if not db_automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    update_data = automation.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_automation, key, value)
    
    await db.commit()
    await db.refresh(db_automation)
    return db_automation

@router.delete("/{automation_id}")
async def delete_automation(automation_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Automation).where(models.Automation.id == automation_id))
    db_automation = result.scalar_one_or_none()
    if not db_automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
@router.post("/{automation_id}/toggle", response_model=schemas.Automation)
async def toggle_automation(automation_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Automation).where(models.Automation.id == automation_id))
    db_automation = result.scalar_one_or_none()
    if not db_automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    db_automation.is_active = not db_automation.is_active
    await db.commit()
    await db.refresh(db_automation)
    return db_automation

@router.post("/{automation_id}/test")
async def test_automation(automation_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Automation).where(models.Automation.id == automation_id))
    db_automation = result.scalar_one_or_none()
    if not db_automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    # Logic to trigger a test run in N8N could go here
    return {"message": f"Test run triggered for {db_automation.name}", "status": "success"}
