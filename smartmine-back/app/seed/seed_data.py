from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import AlertSeverity, AlertType, DriverStatus, MissionStatus, ShiftType, TruckStatus
from app.models.alert import Notification
from app.models.driver import Driver
from app.models.mission import Crusher, Mission, Shovel
from app.models.performance import PerformanceRecord
from app.models.telemetry import Telemetry
from app.models.truck import Truck


def seed(db: Session) -> None:
    _seed_trucks(db)
    _seed_drivers(db)
    _link_drivers_to_trucks(db)
    _seed_shovels(db)
    _seed_crushers(db)
    _seed_notifications(db)
    _seed_telemetry(db)
    _seed_performance(db)
    _seed_initial_mission(db)
    db.commit()


def _seed_trucks(db: Session) -> None:
    trucks = [
        ("T-21", "CAT 777", TruckStatus.AVAILABLE, 34.0, 72.0, 35.248, 58.987, 88.0),
        ("T-22", "CAT 777", TruckStatus.AVAILABLE, 34.0, 69.0, 35.251, 58.991, 85.0),
        ("T-23", "Komatsu HD785", TruckStatus.MAINTENANCE, 33.0, 54.0, 35.254, 58.993, 72.0),
        ("T-24", "Komatsu HD785", TruckStatus.OFFLINE, 33.0, 44.0, 35.247, 58.982, 65.0),
        ("T-27", "CAT 777", TruckStatus.AVAILABLE, 35.0, 68.0, 35.250, 58.990, 84.0),
    ]

    for code, model, status, capacity, fuel, lat, lon, health in trucks:
        existing = db.scalar(select(Truck).where(Truck.truck_code == code))
        if existing:
            continue
        db.add(
            Truck(
                truck_code=code,
                model=model,
                status=status,
                capacity_ton=capacity,
                fuel_level=fuel,
                speed=0.0,
                latitude=lat,
                longitude=lon,
                health_score=health,
            )
        )


def _seed_drivers(db: Session) -> None:
    drivers = [
        ("D-101", "راننده D-101", ShiftType.MORNING, DriverStatus.ACTIVE),
        ("D-102", "راننده D-102", ShiftType.MORNING, DriverStatus.ACTIVE),
        ("D-103", "راننده D-103", ShiftType.EVENING, DriverStatus.ACTIVE),
        ("D-104", "راننده D-104", ShiftType.NIGHT, DriverStatus.RESTING),
    ]

    for code, name, shift, status in drivers:
        existing = db.scalar(select(Driver).where(Driver.driver_code == code))
        if existing:
            continue
        db.add(
            Driver(
                driver_code=code,
                name=name,
                shift=shift,
                status=status,
            )
        )


def _link_drivers_to_trucks(db: Session) -> None:
    mapping = {
        "D-101": "T-21",
        "D-102": "T-27",
        "D-103": "T-22",
        "D-104": "T-24",
    }

    for driver_code, truck_code in mapping.items():
        driver = db.scalar(select(Driver).where(Driver.driver_code == driver_code))
        truck = db.scalar(select(Truck).where(Truck.truck_code == truck_code))
        if driver and truck:
            driver.truck_id = truck.id
            truck.driver_id = driver.id


def _seed_shovels(db: Session) -> None:
    shovels = [
        ("S-01", 2, 35.245, 58.976),
        ("S-02", 8, 35.240, 58.972),
        ("S-03", 2, 35.242, 58.981),
        ("S-04", 4, 35.238, 58.986),
        ("S-05", 1, 35.236, 58.989),
    ]

    for code, queue_count, lat, lon in shovels:
        existing = db.scalar(select(Shovel).where(Shovel.shovel_code == code))
        if existing:
            continue
        db.add(
            Shovel(
                shovel_code=code,
                queue_count=queue_count,
                status="active",
                latitude=lat,
                longitude=lon,
            )
        )


def _seed_crushers(db: Session) -> None:
    existing = db.scalar(select(Crusher).where(Crusher.crusher_code == "C-01"))
    if existing is None:
        db.add(
            Crusher(
                crusher_code="C-01",
                status="active",
                latitude=35.267,
                longitude=59.003,
            )
        )


def _seed_notifications(db: Session) -> None:
    if db.scalar(select(Notification).limit(1)) is not None:
        return

    rows = [
        Notification(
            title="افزایش ارتعاش موتور",
            message="ارتعاش کامیون T-27 در حال افزایش است.",
            type=AlertType.VEHICLE,
            severity=AlertSeverity.WARNING,
            is_read=False,
        ),
        Notification(
            title="مأموریت جدید ثبت شد",
            message="ماموریت جدید برای T-27 ایجاد شد.",
            type=AlertType.MISSION,
            severity=AlertSeverity.INFO,
            is_read=False,
        ),
        Notification(
            title="تراکم بالا در شاول S-02",
            message="صف انتظار شاول S-02 بالا است.",
            type=AlertType.MISSION,
            severity=AlertSeverity.WARNING,
            is_read=True,
        ),
    ]
    db.add_all(rows)


def _seed_telemetry(db: Session) -> None:
    truck = db.scalar(select(Truck).where(Truck.truck_code == "T-27"))
    if truck is None:
        return

    existing = db.scalar(select(Telemetry).where(Telemetry.truck_id == truck.id).limit(1))
    if existing is not None:
        return

    now = datetime.now(timezone.utc)
    for i in range(60):
        ts = now - timedelta(minutes=60 - i)
        db.add(
            Telemetry(
                truck_id=truck.id,
                timestamp=ts,
                speed=24 + (i % 6),
                rpm=1760 + i * 3,
                engine_temperature=84 + (i % 5),
                oil_pressure=56 - (i % 4),
                fuel_level=max(40.0, 74 - i * 0.3),
                payload=30 + (i % 4) * 0.9,
                tire_pressure=107 + (i % 2),
                vibration=0.25 + (i % 5) * 0.02,
                latitude=35.248 + (i % 3) * 0.001,
                longitude=58.988 + (i % 3) * 0.001,
            )
        )


def _seed_performance(db: Session) -> None:
    driver = db.scalar(select(Driver).where(Driver.driver_code == "D-102"))
    truck = db.scalar(select(Truck).where(Truck.truck_code == "T-27"))
    if driver is None or truck is None:
        return

    existing = db.scalar(select(PerformanceRecord).where(PerformanceRecord.driver_id == driver.id).limit(1))
    if existing is not None:
        return

    base = datetime.now(timezone.utc)
    for idx in range(7):
        created = base - timedelta(days=6 - idx)
        row = PerformanceRecord(
            driver_id=driver.id,
            truck_id=truck.id,
            shift=ShiftType.MORNING,
            cycle_count=10 + idx,
            payload_ton=340 + idx * 8,
            average_cycle_time=32 - idx * 0.2,
            waiting_time=45 - idx,
            idle_time=31 - idx * 0.5,
            fuel_consumption=372 - idx * 2,
            speeding_events=1,
            harsh_braking_events=2,
            safety_events=0,
            route_compliance=94.0 + (idx % 4),
            notes="Seeded demo performance",
            overall_score=79 + idx,
            production_score=80 + idx,
            efficiency_score=74 + idx,
            safety_score=90 - (idx % 2),
            fuel_score=78 + idx,
            created_at=created,
            updated_at=created,
        )
        db.add(row)


def _seed_initial_mission(db: Session) -> None:
    truck = db.scalar(select(Truck).where(Truck.truck_code == "T-27"))
    shovel = db.scalar(select(Shovel).where(Shovel.shovel_code == "S-03"))
    crusher = db.scalar(select(Crusher).where(Crusher.crusher_code == "C-01"))
    driver = db.scalar(select(Driver).where(Driver.driver_code == "D-102"))

    if not (truck and shovel and crusher and driver):
        return

    existing = db.scalar(select(Mission).where(Mission.truck_id == truck.id).limit(1))
    if existing is not None:
        return

    db.add(
        Mission(
            truck_id=truck.id,
            driver_id=driver.id,
            shovel_id=shovel.id,
            crusher_id=crusher.id,
            distance_km=2.4,
            eta_min=8,
            cycle_time_min=31.0,
            status=MissionStatus.EN_ROUTE_TO_SHOVEL,
        )
    )


def main() -> None:
    from app.core.database import SessionLocal, init_db

    init_db()
    with SessionLocal() as db:
        seed(db)


if __name__ == "__main__":
    main()
