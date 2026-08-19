from app.algorithms.simulation import run_simulation
from app.schemas.simulation import ComparisonResponse, SimulationRunRequest, SimulationRunResponse


class SimulationService:
    @staticmethod
    def run(payload: SimulationRunRequest) -> SimulationRunResponse:
        data = run_simulation(
            truck_count=payload.truck_count,
            shovel_count=payload.shovel_count,
            dump_points=payload.dump_points,
            duration_hours=payload.duration_hours,
        )
        return SimulationRunResponse(
            **data,
            note="Simulation-based prototype result (research/demo model).",
        )

    @staticmethod
    def comparison() -> ComparisonResponse:
        traditional = {
            "production": 8420.0,
            "queue_time": 9.2,
            "cycle_time": 36.4,
            "idle_time": 52.0,
            "fuel_consumption": 410.0,
            "efficiency": 74.0,
        }
        smart = {
            "production": 9380.0,
            "queue_time": 6.1,
            "cycle_time": 29.8,
            "idle_time": 31.0,
            "fuel_consumption": 365.0,
            "efficiency": 88.0,
        }
        improvement = {
            key: round(((smart[key] - traditional[key]) / traditional[key]) * 100, 2)
            for key in traditional
            if traditional[key] != 0
        }
        return ComparisonResponse(traditional=traditional, smart=smart, improvement=improvement)
