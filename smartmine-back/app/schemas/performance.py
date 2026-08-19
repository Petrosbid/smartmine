from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import ShiftType


class PerformanceAnalyzeRequest(BaseModel):
    driver_id: str
    truck_id: str
    shift: ShiftType
    cycle_count: int = Field(ge=0)
    payload_ton: float = Field(ge=0)
    average_cycle_time: float = Field(gt=0)
    waiting_time: float = Field(ge=0)
    idle_time: float = Field(ge=0)
    fuel_consumption: float = Field(ge=0)
    speeding_events: int = Field(ge=0)
    harsh_braking_events: int = Field(ge=0)
    safety_events: int = Field(ge=0)
    notes: str | None = None


class PerformanceAnalyzeResponse(BaseModel):
    overall_score: float
    production_score: float
    efficiency_score: float
    safety_score: float
    fuel_score: float
    positive_factors: list[str]
    improvement_factors: list[str]
    ai_analysis: str


class PerformanceHistoryItem(BaseModel):
    created_at: datetime
    overall_score: float
    cycle_count: int
    payload_ton: float
