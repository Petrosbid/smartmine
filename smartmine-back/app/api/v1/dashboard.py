from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=DashboardResponse,
    summary="Get aggregated dashboard data",
)
def get_dashboard(
    driver_id: str = Query(default="D-102"),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    return DashboardService(db).get_dashboard(driver_id=driver_id)
