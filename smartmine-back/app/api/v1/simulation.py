from fastapi import APIRouter

from app.schemas.simulation import SimulationRunRequest, SimulationRunResponse
from app.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.post("/run", response_model=SimulationRunResponse, summary="Run mining operation simulation")
def run_simulation(payload: SimulationRunRequest) -> SimulationRunResponse:
    return SimulationService.run(payload)
