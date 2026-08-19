from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.truck import TruckResponse
from app.services.fleet_service import FleetService

router = APIRouter(prefix="/trucks", tags=["Trucks"])


@router.get("", response_model=list[TruckResponse], summary="List trucks")
def list_trucks(db: Session = Depends(get_db)) -> list[TruckResponse]:
    return FleetService(db).list_trucks()


@router.get("/{truck_id}", response_model=TruckResponse, summary="Get truck by ID")
def get_truck(truck_id: str, db: Session = Depends(get_db)) -> TruckResponse:
    return FleetService(db).get_truck(truck_id)
