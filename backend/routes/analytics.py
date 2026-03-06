from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
import models
import schemas
from uuid import UUID

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview")
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    # Summary of triggered vs finished and error rates
    return {"total_triggered": 0, "total_finished": 0, "error_rate": 0}

@router.post("/log", response_model=schemas.AnalyticsLog)
async def log_automation_execution(log: schemas.AnalyticsLogBase, db: AsyncSession = Depends(get_db)):
    db_log = models.AnalyticsLog(**log.model_dump())
    db.add(db_log)
    
    # Also update the automation stats
    result = await db.execute(select(models.Automation).where(models.Automation.id == log.automation_id))
    auto = result.scalar_one_or_none()
    if auto:
        auto.stats_triggered += 1
        if log.success:
            auto.stats_finished += 1
            
    await db.commit()
    await db.refresh(db_log)
    return db_log
