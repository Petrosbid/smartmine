from pydantic import BaseModel, Field


class DispatchRecommendRequest(BaseModel):
    truck_id: str


class DispatchRecommendationResponse(BaseModel):
    recommended_shovel: str
    estimated_cycle_time: float
    estimated_improvement: float
    reason: str
    score_breakdown: dict[str, float]


class DispatchApplyRequest(BaseModel):
    truck_id: str
    shovel_id: str


class DispatchStateShovel(BaseModel):
    id: str
    queue: int
    status: str


class DispatchStateResponse(BaseModel):
    trucks: list[dict[str, str]]
    shovels: list[DispatchStateShovel]
    crushers: list[dict[str, str]]
    routes: list[dict[str, float | str]]
    queues: list[dict[str, int | str]]
    missions: list[dict[str, str | float | int]]


class MissionResponse(BaseModel):
    truck_id: str
    shovel_id: str
    crusher_id: str
    distance_km: float
    eta_min: int
    cycle_time_min: float
    status: str
