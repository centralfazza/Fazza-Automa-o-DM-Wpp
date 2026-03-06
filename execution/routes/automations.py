from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from execution.backend.database import get_db
from execution.backend.models import Automation
from pydantic import BaseModel

router = APIRouter()

class AutomationCreate(BaseModel):
    id: str
    company_id: str
    name: str
    platform: str
    triggers: dict
    actions: list

@router.get("/")
def list_automations(company_id: str, db: Session = Depends(get_db)):
    return db.query(Automation).filter(Automation.company_id == company_id).all()

@router.post("/")
def create_automation(automation: AutomationCreate, db: Session = Depends(get_db)):
    db_automation = Automation(**automation.dict())
    db.add(db_automation)
    db.commit()
    db.refresh(db_automation)
    return db_automation
