"""
Dashboard route — serve o frontend estático e endpoints de dados para a UI.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from execution.backend.database import get_db
from execution.backend.models import Company, Automation, AnalyticsLog
import os

router = APIRouter()

STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static")


@router.get("/")
def dashboard():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


@router.get("/api/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    """Retorna estatísticas para o dashboard."""
    total_companies = db.query(Company).filter(Company.is_active == True).count()
    total_automations = db.query(Automation).filter(Automation.is_active == True).count()
    total_executions = db.query(AnalyticsLog).count()
    successful = db.query(AnalyticsLog).filter(AnalyticsLog.success == True).count()

    return {
        "companies": total_companies,
        "automations": total_automations,
        "total_executions": total_executions,
        "successful_executions": successful,
        "success_rate": round((successful / total_executions * 100) if total_executions else 0, 1),
    }
