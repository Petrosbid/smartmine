from pydantic import BaseModel, Field

from app.core.enums import RiskLevel


class PredictiveMaintenanceResponse(BaseModel):
    risk_level: RiskLevel
    risk_score: float = Field(ge=0, le=100)
    reason: str
    recommendation: str


class VehicleHealthResponse(BaseModel):
    overall_score: float = Field(ge=0, le=100)
    engine_score: float = Field(ge=0, le=100)
    transmission_score: float = Field(ge=0, le=100)
    tires_score: float = Field(ge=0, le=100)
    brakes_score: float = Field(ge=0, le=100)
    components: dict[str, float]
    warnings: list[str]
    predictive_maintenance: PredictiveMaintenanceResponse
