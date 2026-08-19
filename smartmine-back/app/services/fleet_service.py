from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.repositories.driver_repository import DriverRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.truck import TruckResponse
from app.services.serializers import to_truck_schema


class FleetService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.truck_repo = TruckRepository(db)
        self.driver_repo = DriverRepository(db)

    def list_trucks(self) -> list[TruckResponse]:
        drivers = {d.id: d.driver_code for d in self.driver_repo.list_all()}
        return [to_truck_schema(t, driver_code=drivers.get(t.driver_id)) for t in self.truck_repo.list_all()]

    def get_truck(self, truck_id: str) -> TruckResponse:
        truck = self.truck_repo.get_by_code(truck_id)
        if truck is None:
            raise NotFoundError(f"Truck {truck_id} was not found")

        driver_code = None
        if truck.driver_id is not None:
            driver = next((d for d in self.driver_repo.list_all() if d.id == truck.driver_id), None)
            driver_code = driver.driver_code if driver else None

        return to_truck_schema(truck, driver_code=driver_code)
