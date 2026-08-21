from pydantic import BaseModel, Field


class SimulationRunRequest(BaseModel):
    truck_count: int = Field(gt=0)
    shovel_count: int = Field(gt=0)
    dump_points: int = Field(gt=0)
    duration_hours: int = Field(gt=0)


class SimulationStep(BaseModel):
    step_hour: float
    produced_ton: float
    cycle_count: int
    queue_time: float
    fuel_liters: float
    event_message: str


class SimulationRunResponse(BaseModel):
    production: float
    average_queue_time: float
    average_cycle_time: float
    idle_time: float
    fuel_consumption: float
    efficiency: float
    truck_utilization: float
    note: str
    steps: list[SimulationStep] = Field(default_factory=list)
    event_logs: list[str] = Field(default_factory=list)


class ComparisonResponse(BaseModel):
    traditional: dict[str, float]
    smart: dict[str, float]
    improvement: dict[str, float]

