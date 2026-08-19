from pydantic import BaseModel

from app.core.enums import ShiftType
from app.schemas.driver import DriverBase
from app.schemas.truck import TruckResponse


class LoginRequest(BaseModel):
    driver_id: str
    truck_id: str
    shift: ShiftType


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    driver: DriverBase
    truck: TruckResponse
