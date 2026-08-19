from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.truck import Truck
from app.repositories.driver_repository import DriverRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.performance_repository import PerformanceRepository
from app.schemas.driver import DriverProfileResponse


class ProfileService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.driver_repo = DriverRepository(db)
        self.performance_repo = PerformanceRepository(db)
        self.mission_repo = MissionRepository(db)

    def get_driver_profile(self, driver_code: str) -> DriverProfileResponse:
        driver = self.driver_repo.get_by_code(driver_code)
        if driver is None:
            raise NotFoundError(f"Driver {driver_code} was not found")

        perf = self.performance_repo.history(driver.id, limit=100)
        missions = [m for m in self.mission_repo.list_all() if m.driver_id == driver.id]

        avg_perf = round(sum(item.overall_score for item in perf) / len(perf), 2) if perf else 0.0
        payload_total = round(sum(item.payload_ton for item in perf), 2) if perf else 0.0
        safety_index = round(sum(item.safety_score for item in perf) / len(perf), 2) if perf else 0.0

        truck_code = None
        if driver.truck_id:
            truck = self.db.get(Truck, driver.truck_id)
            truck_code = truck.truck_code if truck else None

        return DriverProfileResponse(
            id=driver.driver_code,
            name=driver.name,
            shift=driver.shift,
            status=driver.status,
            truck_id=truck_code,
            average_performance=avg_perf,
            mission_count=len(missions),
            payload_total_ton=payload_total,
            safety_index=safety_index,
            created_at=driver.created_at,
            updated_at=driver.updated_at,
        )
