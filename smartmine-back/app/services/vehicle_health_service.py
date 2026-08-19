from sqlalchemy.orm import Session

from app.algorithms.predictive_maintenance import predict_maintenance
from app.core.exceptions import NotFoundError
from app.repositories.telemetry_repository import TelemetryRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.vehicle_health import PredictiveMaintenanceResponse, VehicleHealthResponse


class VehicleHealthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.truck_repo = TruckRepository(db)
        self.telemetry_repo = TelemetryRepository(db)

    def get_health(self, truck_code: str) -> VehicleHealthResponse:
        truck = self.truck_repo.get_by_code(truck_code)
        if truck is None:
            raise NotFoundError(f"Truck {truck_code} was not found")

        latest = self.telemetry_repo.latest_for_truck(truck.id)

        engine_score = max(50.0, 96.0 - ((latest.engine_temperature if latest and latest.engine_temperature else 87) - 84) * 2.1)
        transmission_score = max(55.0, truck.health_score - 3)
        tires_score = max(60.0, 96.0 - abs((latest.tire_pressure if latest and latest.tire_pressure else 108) - 108) * 1.8)
        brakes_score = max(60.0, truck.health_score + 2)

        overall = round((engine_score + transmission_score + tires_score + brakes_score) / 4, 2)

        warnings: list[str] = []
        if latest and latest.vibration and latest.vibration > 0.4:
            warnings.append("High vibration detected")
        if latest and latest.engine_temperature and latest.engine_temperature > 92:
            warnings.append("Engine temperature exceeds safe threshold")

        prediction = predict_maintenance(
            latest.engine_temperature if latest else None,
            latest.vibration if latest else None,
            latest.oil_pressure if latest else None,
        )

        return VehicleHealthResponse(
            overall_score=overall,
            engine_score=round(engine_score, 2),
            transmission_score=round(transmission_score, 2),
            tires_score=round(tires_score, 2),
            brakes_score=round(brakes_score, 2),
            components={
                "engine": round(engine_score, 2),
                "transmission": round(transmission_score, 2),
                "tires": round(tires_score, 2),
                "brakes": round(brakes_score, 2),
            },
            warnings=warnings,
            predictive_maintenance=PredictiveMaintenanceResponse(**prediction),
        )
