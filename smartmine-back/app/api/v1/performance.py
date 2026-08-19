from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.performance import (
    PerformanceAnalyzeRequest,
    PerformanceAnalyzeResponse,
    PerformanceHistoryItem,
)
from app.services.performance_service import PerformanceService

router = APIRouter(prefix="/performance", tags=["Performance"])


@router.post(
    "/analyze",
    response_model=PerformanceAnalyzeResponse,
    summary="Analyze and score driver shift performance",
)
def analyze_performance(
    payload: PerformanceAnalyzeRequest,
    db: Session = Depends(get_db),
) -> PerformanceAnalyzeResponse:
    return PerformanceService(db).analyze(payload)


@router.get(
    "/history",
    response_model=list[PerformanceHistoryItem],
    summary="Get performance history",
)
def get_performance_history(
    driver_id: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=200),
    db: Session = Depends(get_db),
) -> list[PerformanceHistoryItem]:
    return PerformanceService(db).history(driver_id=driver_id, limit=limit)
