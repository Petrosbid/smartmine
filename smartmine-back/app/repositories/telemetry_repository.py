from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.telemetry import Telemetry


class TelemetryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, row: Telemetry) -> Telemetry:
        self.db.add(row)
        self.db.flush()
        return row

    def get_for_truck(
        self,
        truck_id: int,
        from_dt: datetime | None,
        to_dt: datetime | None,
        limit: int,
    ) -> list[Telemetry]:
        stmt = select(Telemetry).where(Telemetry.truck_id == truck_id)
        if from_dt:
            stmt = stmt.where(Telemetry.timestamp >= from_dt)
        if to_dt:
            stmt = stmt.where(Telemetry.timestamp <= to_dt)
        stmt = stmt.order_by(Telemetry.timestamp.desc()).limit(limit)
        return list(self.db.scalars(stmt))

    def latest_for_truck(self, truck_id: int) -> Telemetry | None:
        stmt = (
            select(Telemetry)
            .where(Telemetry.truck_id == truck_id)
            .order_by(Telemetry.timestamp.desc())
            .limit(1)
        )
        return self.db.scalar(stmt)
