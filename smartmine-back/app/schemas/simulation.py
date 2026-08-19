from pydantic import BaseModel, Field


class SimulationRunRequest(BaseModel):
    truck_count: int = Field(gt=0)
    shovel_count: int = Field(gt=0)
    dump_points: int = Field(gt=0)
    duration_hours: int = Field(gt=0)


class SimulationRunResponse(BaseModel):
    production: float
    average_queue_time: float
    average_cycle_time: float
    idle_time: float
    fuel_consumption: float
    efficiency: float
    truck_utilization: float
    note: str


class ComparisonResponse(BaseModel):
    traditional: dict[str, float]
    smart: dict[str, float]
    improvement: dict[str, float]
