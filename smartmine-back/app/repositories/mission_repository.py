from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mission import Mission
from app.core.enums import MissionStatus


class MissionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Mission]:
        return list(self.db.scalars(select(Mission).order_by(Mission.updated_at.desc())))

    def get_current_for_truck(self, truck_db_id: int) -> Mission | None:
        active_statuses = (
            MissionStatus.ASSIGNED,
            MissionStatus.EN_ROUTE_TO_SHOVEL,
            MissionStatus.WAITING_FOR_LOADING,
            MissionStatus.LOADING,
            MissionStatus.HAULING,
            MissionStatus.WAITING_FOR_DUMP,
            MissionStatus.DUMPING,
        )
        stmt = (
            select(Mission)
            .where(Mission.truck_id == truck_db_id)
            .where(Mission.status.in_(active_statuses))
            .order_by(Mission.updated_at.desc())
            .limit(1)
        )
        return self.db.scalar(stmt)

    def save(self, mission: Mission) -> Mission:
        self.db.add(mission)
        self.db.flush()
        return mission
