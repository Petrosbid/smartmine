from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.vehicle_health import VehicleHealthResponse
from app.services.vehicle_health_service import VehicleHealthService

router = APIRouter(tags=["Vehicle Health"])


@router.get(
    "/trucks/{truck_id}/health",
    response_model=VehicleHealthResponse,
    summary="Get vehicle health and predictive maintenance assessment",
)
def get_vehicle_health(truck_id: str, db: Session = Depends(get_db)) -> VehicleHealthResponse:
    return VehicleHealthService(db).get_health(truck_id)
