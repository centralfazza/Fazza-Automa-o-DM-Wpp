from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from execution.backend.database import get_db
from execution.backend import models, schemas
from uuid import UUID

router = APIRouter()

@router.get("/match", response_model=Optional[schemas.Automation])
async def match_automation(
    sender: str, 
    platform: str, 
    message: Optional[str] = None, 
    company_id: Optional[str] = None,
    trigger_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(models.Automation).where(
        models.Automation.platform == platform,
        models.Automation.is_active == True
    )
    if company_id:
        query = query.where(models.Automation.company_id == company_id)
    
    result = await db.execute(query)
    automations = result.scalars().all()
    
    for auto in automations:
        trigger = auto.triggers
        if not trigger: continue

        t_type = trigger.get('type')
        
        # Keyword Match Logic
        if t_type == 'keyword' or (not trigger_type and t_type == 'keyword'):
            if not message: continue
            keywords = trigger.get('keywords', [])
            if not isinstance(keywords, list): continue
            
            # Normalize message
            msg_clean = message.lower().strip()
            
            # Check for any keyword match (case-insensitive)
            matched = False
            for kw in keywords:
                if not kw: continue
                kw_clean = kw.lower().strip()
                # Support exact match if keyword starts with '!', otherwise contains match
                if kw_clean.startswith('!'):
                    if msg_clean == kw_clean[1:]:
                        matched = True
                        break
                elif kw_clean in msg_clean:
                    matched = True
                    break
            
            if matched:
                return auto

        # First Message Match Logic
        elif t_type == 'first_message' or (not trigger_type and t_type == 'first_message'):
            contact_check = await db.execute(
                select(models.Contact).where(
                    models.Contact.external_id == sender,
                    models.Contact.platform == platform
                )
            )
            if not contact_check.scalar_one_or_none():
                return auto
                
        # Generic Trigger Type Match (e.g. comment, story_mention)
        elif trigger_type and t_type == trigger_type:
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
    
    await db.delete(db_automation)
    await db.commit()
    return {"status": "success"}
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
