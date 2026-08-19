from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.performance import PerformanceRecord


class PerformanceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, row: PerformanceRecord) -> PerformanceRecord:
        self.db.add(row)
        self.db.flush()
        return row

    def history(self, driver_db_id: int | None = None, limit: int = 20) -> list[PerformanceRecord]:
        stmt = select(PerformanceRecord).order_by(PerformanceRecord.created_at.desc()).limit(limit)
        if driver_db_id is not None:
            stmt = stmt.where(PerformanceRecord.driver_id == driver_db_id)
        return list(self.db.scalars(stmt))

    def latest(self, driver_db_id: int | None = None) -> PerformanceRecord | None:
        stmt = select(PerformanceRecord).order_by(PerformanceRecord.created_at.desc()).limit(1)
        if driver_db_id is not None:
            stmt = stmt.where(PerformanceRecord.driver_id == driver_db_id)
        return self.db.scalar(stmt)
