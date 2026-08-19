from datetime import datetime

from pydantic import BaseModel, Field


class TelemetryResponse(BaseModel):
    timestamp: datetime
    speed: float | None = None
    rpm: float | None = None
    engine_temperature: float | None = None
    oil_pressure: float | None = None
    fuel_level: float | None = Field(default=None, ge=0, le=100)
    payload: float | None = Field(default=None, ge=0)
    tire_pressure: float | None = None
    vibration: float | None = None
    latitude: float | None = None
    longitude: float | None = None


class TelemetrySimulateRequest(BaseModel):
    truck_id: str
