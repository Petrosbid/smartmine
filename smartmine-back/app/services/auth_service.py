from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestError, NotFoundError
from app.repositories.driver_repository import DriverRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.serializers import to_driver_schema, to_truck_schema


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.driver_repo = DriverRepository(db)
        self.truck_repo = TruckRepository(db)

    def login(self, payload: LoginRequest) -> LoginResponse:
        driver = self.driver_repo.get_by_code(payload.driver_id)
        if driver is None:
            raise NotFoundError(f"Driver {payload.driver_id} was not found")

        truck = self.truck_repo.get_by_code(payload.truck_id)
        if truck is None:
            raise NotFoundError(f"Truck {payload.truck_id} was not found")

        if driver.shift != payload.shift:
            raise BadRequestError("Shift does not match driver profile")

        access_token = f"demo-token-{payload.driver_id}-{payload.truck_id}-{payload.shift.value}"

        return LoginResponse(
            access_token=access_token,
            driver=to_driver_schema(driver),
            truck=to_truck_schema(truck, driver_code=driver.driver_code),
        )
