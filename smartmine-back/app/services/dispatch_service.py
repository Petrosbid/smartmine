from sqlalchemy import select
from sqlalchemy.orm import Session

from app.algorithms.dispatch import recommend_dispatch
from app.core.enums import AlertSeverity, AlertType, MissionStatus, TruckStatus
from app.core.exceptions import BadRequestError, NotFoundError
from app.models.alert import Notification
from app.models.mission import Crusher, Mission, Shovel
from app.models.truck import Truck
from app.repositories.alert_repository import AlertRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.dispatch import DispatchRecommendationResponse, DispatchStateResponse, MissionResponse
from app.services.serializers import to_mission_schema


class DispatchService:
    _ACTIVE_STATUSES = {
        MissionStatus.ASSIGNED,
        MissionStatus.EN_ROUTE_TO_SHOVEL,
        MissionStatus.WAITING_FOR_LOADING,
        MissionStatus.LOADING,
        MissionStatus.HAULING,
        MissionStatus.WAITING_FOR_DUMP,
        MissionStatus.DUMPING,
    }

    _ALLOWED_TRANSITIONS = {
        MissionStatus.ASSIGNED: {MissionStatus.EN_ROUTE_TO_SHOVEL, MissionStatus.CANCELLED, MissionStatus.FAILED},
        MissionStatus.EN_ROUTE_TO_SHOVEL: {MissionStatus.WAITING_FOR_LOADING, MissionStatus.CANCELLED, MissionStatus.FAILED},
        MissionStatus.WAITING_FOR_LOADING: {MissionStatus.LOADING, MissionStatus.CANCELLED, MissionStatus.FAILED},
        MissionStatus.LOADING: {MissionStatus.HAULING, MissionStatus.CANCELLED, MissionStatus.FAILED},
        MissionStatus.HAULING: {MissionStatus.WAITING_FOR_DUMP, MissionStatus.CANCELLED, MissionStatus.FAILED},
        MissionStatus.WAITING_FOR_DUMP: {MissionStatus.DUMPING, MissionStatus.CANCELLED, MissionStatus.FAILED},
        MissionStatus.DUMPING: {MissionStatus.COMPLETED, MissionStatus.FAILED},
        MissionStatus.COMPLETED: set(),
        MissionStatus.CANCELLED: set(),
        MissionStatus.FAILED: set(),
    }

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
            {
                "from": s.shovel_code,
                "to": c.crusher_code,
                "distance_km": self._distance_km(s.latitude, s.longitude, c.latitude, c.longitude),
            }
            for s in shovels
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

        crushers = list(self.db.scalars(select(Crusher)))
        if not crushers:
            raise NotFoundError("No crusher is configured")
        crusher = min(
            crushers,
            key=lambda item: self._distance_km(shovel.latitude, shovel.longitude, item.latitude, item.longitude),
        )

        recommendation = self.recommend(truck_code)
        if recommendation.recommended_shovel != shovel_code:
            raise BadRequestError(
                f"Selected shovel {shovel_code} does not match current recommendation {recommendation.recommended_shovel}"
            )

        current = self.mission_repo.get_current_for_truck(truck.id)
        if current and current.shovel_id == shovel.id and current.status in self._ACTIVE_STATUSES:
            return to_mission_schema(current, truck.truck_code, shovel.shovel_code, crusher.crusher_code)
        if current and current.status in self._ACTIVE_STATUSES:
            raise BadRequestError("Truck already has an active mission")

        distance_to_shovel = self._distance_km(truck.latitude, truck.longitude, shovel.latitude, shovel.longitude)
        distance_to_crusher = self._distance_km(shovel.latitude, shovel.longitude, crusher.latitude, crusher.longitude)
        total_distance = round(distance_to_shovel + distance_to_crusher, 2)

        mission = Mission(
            truck_id=truck.id,
            driver_id=truck.driver_id,
            shovel_id=shovel.id,
            crusher_id=crusher.id,
            distance_km=total_distance,
            eta_min=max(5, int(8 + shovel.queue_count * 0.8)),
            cycle_time_min=round(29 + shovel.queue_count * 1.6, 2),
            status=MissionStatus.ASSIGNED,
        )
        self.mission_repo.save(mission)

        shovel.queue_count += 1
        truck.status = TruckStatus.IN_MISSION

        self.alert_repo.save(
            Notification(
                title="تخصیص مأموریت هوشمند جدید",
                message=f"کامیون {truck.truck_code} با موفقیت به {shovel.shovel_code} تخصیص یافت.",
                type=AlertType.MISSION,
                severity=AlertSeverity.INFO,
                is_read=False,
            )
        )


        self.db.commit()

        return to_mission_schema(mission, truck.truck_code, shovel.shovel_code, crusher.crusher_code)

    def transition(self, mission_id: int, status: str) -> MissionResponse:
        mission = self.db.get(Mission, mission_id)
        if mission is None:
            raise NotFoundError(f"Mission {mission_id} was not found")

        try:
            next_status = MissionStatus(status)
        except ValueError as exc:
            raise BadRequestError(f"Mission status {status} is invalid") from exc

        current_status = mission.status
        allowed = self._ALLOWED_TRANSITIONS[current_status]
        if next_status == current_status:
            raise BadRequestError(f"Mission is already in {current_status.value}")
        if next_status not in allowed:
            raise BadRequestError(f"Transition from {current_status.value} to {next_status.value} is not allowed")

        mission.status = next_status
        if next_status in {MissionStatus.COMPLETED, MissionStatus.CANCELLED, MissionStatus.FAILED}:
            truck = self.db.get(Truck, mission.truck_id)
            if truck is not None:
                truck.status = TruckStatus.AVAILABLE

        self.db.commit()
        self.db.refresh(mission)

        truck = self.db.get(Truck, mission.truck_id)
        shovel = self.db.get(Shovel, mission.shovel_id)
        crusher = self.db.get(Crusher, mission.crusher_id)
        if truck is None or shovel is None or crusher is None:
            raise NotFoundError("Mission dependencies are missing")
        return to_mission_schema(mission, truck.truck_code, shovel.shovel_code, crusher.crusher_code)

    @staticmethod
    def _distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        lat_km = (lat1 - lat2) * 111.0
        lon_km = (lon1 - lon2) * 111.0
        return round((lat_km**2 + lon_km**2) ** 0.5, 2)
