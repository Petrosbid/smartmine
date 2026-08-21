from datetime import datetime, timezone
import math

from sqlalchemy.orm import Session

from app.core.enums import MissionStatus
from app.core.exceptions import NotFoundError
from app.models.telemetry import Telemetry
from app.repositories.mission_repository import MissionRepository
from app.repositories.telemetry_repository import TelemetryRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.telemetry import TelemetryResponse
from app.services.serializers import to_telemetry_schema


class TelemetryService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.telemetry_repo = TelemetryRepository(db)
        self.truck_repo = TruckRepository(db)
        self.mission_repo = MissionRepository(db)

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
        mission = self.mission_repo.get_current_for_truck(truck.id)
        mission_status = mission.status if mission is not None else MissionStatus.ASSIGNED

        base_speed = latest.speed if latest and latest.speed is not None else 10.0
        base_rpm = latest.rpm if latest and latest.rpm is not None else 1400.0
        base_engine_temp = latest.engine_temperature if latest and latest.engine_temperature is not None else 84.0
        base_vibration = latest.vibration if latest and latest.vibration is not None else 0.25
        base_fuel = latest.fuel_level if latest and latest.fuel_level is not None else 68.0
        base_payload = latest.payload if latest and latest.payload is not None else 0.0
        base_oil = latest.oil_pressure if latest and latest.oil_pressure is not None else 56.0
        base_tire = latest.tire_pressure if latest and latest.tire_pressure is not None else 108.0

        step = (latest.id if latest else 0) + 1
        wave = math.sin(step / 4)

        speed_targets = {
            MissionStatus.ASSIGNED: 5.0,
            MissionStatus.EN_ROUTE_TO_SHOVEL: 30.0,
            MissionStatus.WAITING_FOR_LOADING: 1.0,
            MissionStatus.LOADING: 0.0,
            MissionStatus.HAULING: 28.0,
            MissionStatus.WAITING_FOR_DUMP: 2.0,
            MissionStatus.DUMPING: 0.0,
            MissionStatus.COMPLETED: 0.0,
            MissionStatus.CANCELLED: 0.0,
            MissionStatus.FAILED: 0.0,
        }
        rpm_targets = {
            MissionStatus.ASSIGNED: 1300.0,
            MissionStatus.EN_ROUTE_TO_SHOVEL: 1900.0,
            MissionStatus.WAITING_FOR_LOADING: 1250.0,
            MissionStatus.LOADING: 1350.0,
            MissionStatus.HAULING: 1950.0,
            MissionStatus.WAITING_FOR_DUMP: 1200.0,
            MissionStatus.DUMPING: 1300.0,
            MissionStatus.COMPLETED: 1100.0,
            MissionStatus.CANCELLED: 1100.0,
            MissionStatus.FAILED: 1100.0,
        }
        payload_delta = {
            MissionStatus.LOADING: +1.8,
            MissionStatus.HAULING: +0.2,
            MissionStatus.DUMPING: -2.4,
        }.get(mission_status, 0.0)
        fuel_delta = {
            MissionStatus.EN_ROUTE_TO_SHOVEL: -0.45,
            MissionStatus.HAULING: -0.6,
            MissionStatus.LOADING: -0.2,
            MissionStatus.DUMPING: -0.15,
        }.get(mission_status, -0.08)

        speed = self._approach(base_speed, speed_targets[mission_status], 5.0) + wave * 0.8
        rpm = self._approach(base_rpm, rpm_targets[mission_status], 120.0) + wave * 15.0
        engine_temp = self._approach(base_engine_temp, 90.0 if speed > 5 else 84.0, 1.2) + wave * 0.4
        payload = max(0.0, min(truck.capacity_ton, base_payload + payload_delta))
        fuel = max(0.0, min(100.0, base_fuel + fuel_delta))
        oil = max(40.0, min(70.0, base_oil + (0.2 if rpm > 1700 else -0.15)))
        tire = max(95.0, min(115.0, base_tire + wave * 0.2))
        vibration = max(0.12, min(0.85, base_vibration + (0.03 if speed > 20 else -0.01) + wave * 0.01))
        lat, lon = self._move_position(truck.latitude, truck.longitude, speed, step)

        sample = Telemetry(
            truck_id=truck.id,
            timestamp=datetime.now(timezone.utc),
            speed=max(0.0, min(45.0, speed)),
            rpm=max(900.0, min(2300.0, rpm)),
            engine_temperature=max(72.0, min(105.0, engine_temp)),
            oil_pressure=oil,
            fuel_level=fuel,
            payload=payload,
            tire_pressure=tire,
            vibration=vibration,
            latitude=lat,
            longitude=lon,
        )
        self.telemetry_repo.add(sample)
        self.db.commit()
        return to_telemetry_schema(sample)

    @staticmethod
    def _approach(current: float, target: float, max_delta: float) -> float:
        if current < target:
            return min(target, current + max_delta)
        return max(target, current - max_delta)

    @staticmethod
    def _move_position(lat: float, lon: float, speed: float, step: int) -> tuple[float, float]:
        if speed < 1.0:
            return lat, lon
        drift = speed / 10000
        return lat + math.sin(step / 7) * drift, lon + math.cos(step / 7) * drift
