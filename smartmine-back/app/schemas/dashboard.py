from pydantic import BaseModel

from app.schemas.dispatch import MissionResponse
from app.schemas.driver import DriverBase
from app.schemas.performance import PerformanceHistoryItem
from app.schemas.telemetry import TelemetryResponse
from app.schemas.truck import TruckResponse


class DashboardResponse(BaseModel):
    driver: DriverBase
    truck: TruckResponse
    current_mission: MissionResponse | None
    telemetry: TelemetryResponse | None
    performance: dict[str, float]
    fleet: dict[str, int]
    alerts: list[dict[str, str | int | bool]]
    recent_performance: list[PerformanceHistoryItem]
    ai_recommendation: dict[str, str]
