from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.dispatch import (
    DispatchApplyRequest,
    DispatchRecommendationResponse,
    DispatchRecommendRequest,
    DispatchStateResponse,
    MissionResponse,
)
from app.services.dispatch_service import DispatchService

router = APIRouter(prefix="/dispatch", tags=["Dispatch"])


@router.get("/state", response_model=DispatchStateResponse, summary="Get current dispatch state")
def get_dispatch_state(db: Session = Depends(get_db)) -> DispatchStateResponse:
    return DispatchService(db).state()


@router.post(
    "/recommend",
    response_model=DispatchRecommendationResponse,
    summary="Recommend optimal shovel for a truck",
)
def recommend_dispatch(
    payload: DispatchRecommendRequest,
    db: Session = Depends(get_db),
) -> DispatchRecommendationResponse:
    return DispatchService(db).recommend(payload.truck_id)


@router.post("/apply", response_model=MissionResponse, summary="Apply dispatch assignment")
def apply_dispatch(payload: DispatchApplyRequest, db: Session = Depends(get_db)) -> MissionResponse:
    return DispatchService(db).apply(payload.truck_id, payload.shovel_id)
