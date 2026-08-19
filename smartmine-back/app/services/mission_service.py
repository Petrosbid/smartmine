from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.mission import Crusher, Shovel
from app.models.truck import Truck
from app.repositories.mission_repository import MissionRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.dispatch import MissionResponse
from app.services.serializers import to_mission_schema


class MissionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.truck_repo = TruckRepository(db)
        self.mission_repo = MissionRepository(db)

    def get_current(self, truck_code: str) -> MissionResponse | None:
        truck = self.truck_repo.get_by_code(truck_code)
        if truck is None:
            raise NotFoundError(f"Truck {truck_code} was not found")

        mission = self.mission_repo.get_current_for_truck(truck.id)
        if mission is None:
            return None

        shovel = self.db.get(Shovel, mission.shovel_id)
        crusher = self.db.get(Crusher, mission.crusher_id)
        if shovel is None or crusher is None:
            raise NotFoundError("Mission dependencies are missing")

        return to_mission_schema(mission, truck.truck_code, shovel.shovel_code, crusher.crusher_code)

    def list_all(self) -> list[MissionResponse]:
        missions = self.mission_repo.list_all()
        result: list[MissionResponse] = []
        for mission in missions:
            truck = self.db.get(Truck, mission.truck_id)
            shovel = self.db.get(Shovel, mission.shovel_id)
            crusher = self.db.get(Crusher, mission.crusher_id)
            if truck and shovel and crusher:
                result.append(
                    to_mission_schema(mission, truck.truck_code, shovel.shovel_code, crusher.crusher_code)
                )
        return result
