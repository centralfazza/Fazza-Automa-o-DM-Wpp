from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from execution.backend.database import get_db
from execution.backend.models import AnalyticsLog

router = APIRouter()

@router.get("/")
def get_analytics(automation_id: str = None, db: Session = Depends(get_db)):
    query = db.query(AnalyticsLog)
    if automation_id:
        query = query.filter(AnalyticsLog.automation_id == automation_id)
    return query.order_by(AnalyticsLog.executed_at.desc()).limit(100).all()
