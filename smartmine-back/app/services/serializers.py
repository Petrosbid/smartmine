from app.models.alert import Notification
from app.models.driver import Driver
from app.models.mission import Mission
from app.models.performance import PerformanceRecord
from app.models.telemetry import Telemetry
from app.models.truck import Truck
from app.schemas.dispatch import MissionResponse
from app.schemas.driver import DriverBase
from app.schemas.notification import NotificationResponse
from app.schemas.performance import PerformanceHistoryItem
from app.schemas.telemetry import TelemetryResponse
from app.schemas.truck import TruckResponse


def to_driver_schema(driver: Driver) -> DriverBase:
    return DriverBase(
        id=driver.driver_code,
        name=driver.name,
        shift=driver.shift,
        status=driver.status,
        truck_id=None,
    )


def to_truck_schema(truck: Truck, driver_code: str | None = None) -> TruckResponse:
    return TruckResponse(
        id=truck.truck_code,
        model=truck.model,
        status=truck.status,
        driver_id=driver_code,
        capacity_ton=truck.capacity_ton,
        fuel_level=truck.fuel_level,
        speed=truck.speed,
        latitude=truck.latitude,
        longitude=truck.longitude,
        health_score=truck.health_score,
        created_at=truck.created_at,
        updated_at=truck.updated_at,
    )


def to_telemetry_schema(row: Telemetry) -> TelemetryResponse:
    return TelemetryResponse(
        timestamp=row.timestamp,
        speed=row.speed,
        rpm=row.rpm,
        engine_temperature=row.engine_temperature,
        oil_pressure=row.oil_pressure,
        fuel_level=row.fuel_level,
        payload=row.payload,
        tire_pressure=row.tire_pressure,
        vibration=row.vibration,
        latitude=row.latitude,
        longitude=row.longitude,
    )


def to_mission_schema(mission: Mission, truck_code: str, shovel_code: str, crusher_code: str) -> MissionResponse:
    return MissionResponse(
        mission_id=mission.id,
        truck_id=truck_code,
        shovel_id=shovel_code,
        crusher_id=crusher_code,
        distance_km=mission.distance_km,
        eta_min=mission.eta_min,
        cycle_time_min=mission.cycle_time_min,
        status=mission.status.value,
        created_at=mission.created_at,
    )


def to_performance_history_schema(row: PerformanceRecord) -> PerformanceHistoryItem:
    return PerformanceHistoryItem(
        created_at=row.created_at,
        overall_score=row.overall_score,
        cycle_count=row.cycle_count,
        payload_ton=row.payload_ton,
    )


def to_notification_schema(row: Notification) -> NotificationResponse:
    return NotificationResponse(
        id=row.id,
        title=row.title,
        message=row.message,
        type=row.type,
        severity=row.severity,
        read=row.is_read,
        created_at=row.created_at,
    )
