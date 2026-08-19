from datetime import datetime, timezone
import random

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.telemetry import Telemetry
from app.repositories.telemetry_repository import TelemetryRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.telemetry import TelemetryResponse
from app.services.serializers import to_telemetry_schema


class TelemetryService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.telemetry_repo = TelemetryRepository(db)
        self.truck_repo = TruckRepository(db)

    def get_truck_telemetry(
        self,
        truck_code: str,
        from_dt: datetime | None,
        to_dt: datetime | None,
        limit: int,
    ) -> list[TelemetryResponse]:
        truck = self.truck_repo.get_by_code(truck_code)
        if truck is None:
            raise NotFoundError(f"Truck {truck_code} was not found")

        rows = self.telemetry_repo.get_for_truck(truck.id, from_dt, to_dt, limit)
        return [to_telemetry_schema(row) for row in rows]

    def simulate_next(self, truck_code: str) -> TelemetryResponse:
        truck = self.truck_repo.get_by_code(truck_code)
        if truck is None:
            raise NotFoundError(f"Truck {truck_code} was not found")

        latest = self.telemetry_repo.latest_for_truck(truck.id)
        base_speed = latest.speed if latest and latest.speed is not None else 27.0
        base_rpm = latest.rpm if latest and latest.rpm is not None else 1820.0
        base_engine_temp = latest.engine_temperature if latest and latest.engine_temperature is not None else 87.0
        base_vibration = latest.vibration if latest and latest.vibration is not None else 0.31

        sample = Telemetry(
            truck_id=truck.id,
            timestamp=datetime.now(timezone.utc),
            speed=max(0.0, min(45.0, base_speed + random.uniform(-3, 3))),
            rpm=max(1200.0, min(2300.0, base_rpm + random.uniform(-55, 55))),
            engine_temperature=max(72.0, min(100.0, base_engine_temp + random.uniform(-2, 2))),
            oil_pressure=max(40.0, min(70.0, (latest.oil_pressure if latest and latest.oil_pressure else 56) + random.uniform(-1.5, 1.5))),
            fuel_level=max(0.0, min(100.0, (latest.fuel_level if latest and latest.fuel_level else 68) + random.uniform(-1.2, 0.2))),
            payload=max(0.0, min(truck.capacity_ton, (latest.payload if latest and latest.payload else 31.0) + random.uniform(-1.2, 1.2))),
            tire_pressure=max(95.0, min(115.0, (latest.tire_pressure if latest and latest.tire_pressure else 108) + random.uniform(-1, 1))),
            vibration=max(0.15, min(0.70, base_vibration + random.uniform(-0.04, 0.06))),
            latitude=truck.latitude + random.uniform(-0.005, 0.005),
            longitude=truck.longitude + random.uniform(-0.005, 0.005),
        )
        self.telemetry_repo.add(sample)
        self.db.commit()
        return to_telemetry_schema(sample)
