from fastapi import APIRouter

from app.schemas.simulation import ComparisonResponse
from app.services.simulation_service import SimulationService

router = APIRouter(tags=["Simulation"])


@router.get("/comparison", response_model=ComparisonResponse, summary="Compare traditional vs smart operation")
def get_comparison() -> ComparisonResponse:
    return SimulationService.comparison()
