from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.mission import Crusher, Shovel
from app.models.truck import Truck
from app.repositories.alert_repository import AlertRepository
from app.repositories.driver_repository import DriverRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.performance_repository import PerformanceRepository
from app.repositories.telemetry_repository import TelemetryRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.dashboard import DashboardResponse
from app.services.serializers import (
    to_driver_schema,
    to_mission_schema,
    to_performance_history_schema,
    to_telemetry_schema,
    to_truck_schema,
)


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.driver_repo = DriverRepository(db)
        self.truck_repo = TruckRepository(db)
        self.telemetry_repo = TelemetryRepository(db)
        self.performance_repo = PerformanceRepository(db)
        self.mission_repo = MissionRepository(db)
        self.alert_repo = AlertRepository(db)

    def get_dashboard(self, driver_id: str = "D-102") -> DashboardResponse:
        driver = self.driver_repo.get_by_code(driver_id)
        if driver is None:
            raise NotFoundError(f"Driver {driver_id} was not found")

        if driver.truck_id is None:
            raise NotFoundError(f"Driver {driver_id} has no assigned truck")

        truck = self.db.get(Truck, driver.truck_id)
        if truck is None:
            raise NotFoundError("Assigned truck was not found")

        latest_telemetry = self.telemetry_repo.latest_for_truck(truck.id)
        latest_perf = self.performance_repo.latest(driver.id)
        perf_history = self.performance_repo.history(driver.id, limit=7)

        mission = self.mission_repo.get_current_for_truck(truck.id)
        mission_schema = None
        if mission:
            shovel = self.db.get(Shovel, mission.shovel_id)
            crusher = self.db.get(Crusher, mission.crusher_id)
            if shovel and crusher:
                mission_schema = to_mission_schema(mission, truck.truck_code, shovel.shovel_code, crusher.crusher_code)

        alerts = self.alert_repo.list_all(read=False)[:5]

        trucks = self.truck_repo.list_all()
        fleet = {
            "total": len(trucks),
            "available": len([t for t in trucks if t.status.value == "available"]),
            "in_mission": len([t for t in trucks if t.status.value == "in_mission"]),
            "offline": len([t for t in trucks if t.status.value == "offline"]),
        }

        performance = {
            "overall_score": latest_perf.overall_score if latest_perf else 0.0,
            "production_score": latest_perf.production_score if latest_perf else 0.0,
            "efficiency_score": latest_perf.efficiency_score if latest_perf else 0.0,
        }

        return DashboardResponse(
            driver=to_driver_schema(driver),
            truck=to_truck_schema(truck, driver_code=driver.driver_code),
            current_mission=mission_schema,
            telemetry=to_telemetry_schema(latest_telemetry) if latest_telemetry else None,
            performance=performance,
            fleet=fleet,
            alerts=[
                {
                    "id": a.id,
                    "title": a.title,
                    "severity": a.severity.value,
                    "type": a.type.value,
                    "read": a.is_read,
                }
                for a in alerts
            ],
            recent_performance=[to_performance_history_schema(item) for item in perf_history],
            ai_recommendation={
                "message": "Reduce waiting time by prioritizing low-queue shovels.",
            },
        )
