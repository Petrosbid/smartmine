from sqlalchemy import select
from sqlalchemy.orm import Session

from app.algorithms.dispatch import recommend_dispatch
from app.core.enums import AlertSeverity, AlertType, MissionStatus, TruckStatus
from app.core.exceptions import BadRequestError, NotFoundError
from app.models.alert import Notification
from app.models.mission import Crusher, Mission, Shovel
from app.repositories.alert_repository import AlertRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.dispatch import (
    DispatchRecommendationResponse,
    DispatchStateResponse,
    MissionResponse,
)
from app.services.serializers import to_mission_schema


class DispatchService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.truck_repo = TruckRepository(db)
        self.mission_repo = MissionRepository(db)
        self.alert_repo = AlertRepository(db)

    def state(self) -> DispatchStateResponse:
        trucks = self.truck_repo.list_all()
        shovels = list(self.db.scalars(select(Shovel).order_by(Shovel.shovel_code)))
        crushers = list(self.db.scalars(select(Crusher).order_by(Crusher.crusher_code)))
        missions = self.mission_repo.list_all()

        truck_data = [{"id": t.truck_code, "status": t.status.value} for t in trucks]
        shovel_data = [{"id": s.shovel_code, "queue": s.queue_count, "status": s.status} for s in shovels]
        crusher_data = [{"id": c.crusher_code, "status": c.status} for c in crushers]

        mission_data = []
        for mission in missions:
            truck = next((t for t in trucks if t.id == mission.truck_id), None)
            shovel = next((s for s in shovels if s.id == mission.shovel_id), None)
            if truck and shovel:
                mission_data.append(
                    {
                        "truck_id": truck.truck_code,
                        "shovel_id": shovel.shovel_code,
                        "eta_min": mission.eta_min,
                        "status": mission.status.value,
                    }
                )

        routes = [
            {"from": s.shovel_code, "to": c.crusher_code, "distance_km": 2.1 + index * 0.2}
            for index, s in enumerate(shovels)
            for c in crushers
        ]

        queues = [{"shovel": s.shovel_code, "trucks": s.queue_count} for s in shovels]

        return DispatchStateResponse(
            trucks=truck_data,
            shovels=shovel_data,
            crushers=crusher_data,
            routes=routes,
            queues=queues,
            missions=mission_data,
        )

    def recommend(self, truck_code: str) -> DispatchRecommendationResponse:
        truck = self.truck_repo.get_by_code(truck_code)
        if truck is None:
            raise NotFoundError(f"Truck {truck_code} was not found")

        if truck.status in {TruckStatus.OFFLINE, TruckStatus.MAINTENANCE}:
            raise BadRequestError(f"Truck {truck_code} is not available for dispatch")

        shovels = list(self.db.scalars(select(Shovel)))
        shovel_payload = [
            {
                "id": s.shovel_code,
                "queue": s.queue_count,
                "status": s.status,
                "latitude": s.latitude,
                "longitude": s.longitude,
            }
            for s in shovels
        ]

        best, breakdown = recommend_dispatch((truck.latitude, truck.longitude), truck.health_score, shovel_payload)

        return DispatchRecommendationResponse(
            recommended_shovel=str(best["shovel_id"]),
            estimated_cycle_time=float(best["estimated_cycle_time"]),
            estimated_improvement=float(best["estimated_improvement"]),
            reason=str(best["reason"]),
            score_breakdown=breakdown,
        )

    def apply(self, truck_code: str, shovel_code: str) -> MissionResponse:
        truck = self.truck_repo.get_by_code(truck_code)
        if truck is None:
            raise NotFoundError(f"Truck {truck_code} was not found")

        shovel = self.db.scalar(select(Shovel).where(Shovel.shovel_code == shovel_code))
        if shovel is None:
            raise NotFoundError(f"Shovel {shovel_code} was not found")

        crusher = self.db.scalar(select(Crusher).order_by(Crusher.id).limit(1))
        if crusher is None:
            raise NotFoundError("No crusher is configured")

        current = self.mission_repo.get_current_for_truck(truck.id)
        if current and current.shovel_id == shovel.id and current.status in {
            MissionStatus.READY,
            MissionStatus.IN_PROGRESS,
            MissionStatus.WAITING,
        }:
            return to_mission_schema(current, truck.truck_code, shovel.shovel_code, crusher.crusher_code)

        mission = Mission(
            truck_id=truck.id,
            driver_id=truck.driver_id,
            shovel_id=shovel.id,
            crusher_id=crusher.id,
            distance_km=2.3,
            eta_min=max(5, int(8 + shovel.queue_count * 0.8)),
            cycle_time_min=round(29 + shovel.queue_count * 1.6, 2),
            status=MissionStatus.IN_PROGRESS,
        )
        self.mission_repo.save(mission)

        shovel.queue_count += 1
        truck.status = TruckStatus.IN_MISSION

        self.alert_repo.save(
            Notification(
                title="New dispatch applied",
                message=f"{truck.truck_code} assigned to {shovel.shovel_code}",
                type=AlertType.MISSION,
                severity=AlertSeverity.INFO,
                is_read=False,
            )
        )

        self.db.commit()

        return to_mission_schema(mission, truck.truck_code, shovel.shovel_code, crusher.crusher_code)
