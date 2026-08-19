from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.dispatch import MissionResponse
from app.services.mission_service import MissionService

router = APIRouter(prefix="/missions", tags=["Dispatch"])


@router.get(
    "/current",
    response_model=MissionResponse | None,
    summary="Get current mission for a truck",
)
def current_mission(
    truck_id: str = Query(...),
    db: Session = Depends(get_db),
) -> MissionResponse | None:
    return MissionService(db).get_current(truck_id)


@router.get("", response_model=list[MissionResponse], summary="List missions")
def list_missions(db: Session = Depends(get_db)) -> list[MissionResponse]:
    return MissionService(db).list_all()
