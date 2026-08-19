from datetime import datetime

from pydantic import BaseModel

from app.core.enums import DriverStatus, ShiftType


class DriverBase(BaseModel):
    id: str
    name: str
    shift: ShiftType
    status: DriverStatus
    truck_id: str | None


class DriverProfileResponse(DriverBase):
    average_performance: float
    mission_count: int
    payload_total_ton: float
    safety_index: float
    created_at: datetime | None = None
    updated_at: datetime | None = None
