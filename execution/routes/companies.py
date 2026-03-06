from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from execution.backend.database import get_db
from execution.backend.models import Company
from pydantic import BaseModel

router = APIRouter()

class CompanyCreate(BaseModel):
    id: str
    name: str
    instagram_account_id: str
    instagram_access_token: str
    whatsapp_number: str = None

@router.post("/")
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/{company_id}")
def get_company(company_id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
