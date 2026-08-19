from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.telemetry import TelemetryResponse, TelemetrySimulateRequest
from app.services.telemetry_service import TelemetryService

router = APIRouter(tags=["Telemetry"])


@router.get(
    "/trucks/{truck_id}/telemetry",
    response_model=list[TelemetryResponse],
    summary="Get truck telemetry history",
)
def get_truck_telemetry(
    truck_id: str,
    from_dt: datetime | None = Query(default=None, alias="from"),
    to_dt: datetime | None = Query(default=None, alias="to"),
    limit: int = Query(default=50, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[TelemetryResponse]:
    return TelemetryService(db).get_truck_telemetry(truck_id, from_dt, to_dt, limit)


@router.post(
    "/telemetry/simulate",
    response_model=TelemetryResponse,
    summary="Generate and persist a simulated live telemetry sample",
)
def simulate_telemetry(payload: TelemetrySimulateRequest, db: Session = Depends(get_db)) -> TelemetryResponse:
    return TelemetryService(db).simulate_next(payload.truck_id)
