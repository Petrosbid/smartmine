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
            "production": round(((smart["production"] - traditional["production"]) / traditional["production"]) * 100, 1),
            "queue_time": round(((traditional["queue_time"] - smart["queue_time"]) / traditional["queue_time"]) * 100, 1),
            "cycle_time": round(((traditional["cycle_time"] - smart["cycle_time"]) / traditional["cycle_time"]) * 100, 1),
            "idle_time": round(((traditional["idle_time"] - smart["idle_time"]) / traditional["idle_time"]) * 100, 1),
            "fuel_consumption": round(((traditional["fuel_consumption"] - smart["fuel_consumption"]) / traditional["fuel_consumption"]) * 100, 1),
            "efficiency": round(smart["efficiency"] - traditional["efficiency"], 1),
        }
        return ComparisonResponse(traditional=traditional, smart=smart, improvement=improvement)

