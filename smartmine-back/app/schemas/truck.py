from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import TruckStatus


class TruckResponse(BaseModel):
    id: str
    model: str
    status: TruckStatus
    driver_id: str | None
    capacity_ton: float
    fuel_level: float = Field(ge=0, le=100)
    speed: float
    latitude: float
    longitude: float
    health_score: float = Field(ge=0, le=100)
    created_at: datetime | None = None
    updated_at: datetime | None = None
