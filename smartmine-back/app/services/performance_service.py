from sqlalchemy.orm import Session

from app.algorithms.performance import calculate_performance_score
from app.core.exceptions import NotFoundError
from app.models.performance import PerformanceRecord
from app.repositories.driver_repository import DriverRepository
from app.repositories.performance_repository import PerformanceRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.performance import (
    PerformanceAnalyzeRequest,
    PerformanceAnalyzeResponse,
    PerformanceHistoryItem,
)
from app.services.ai_service import get_ai_service
from app.services.serializers import to_performance_history_schema


class PerformanceService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.driver_repo = DriverRepository(db)
        self.truck_repo = TruckRepository(db)
        self.performance_repo = PerformanceRepository(db)

    def analyze(self, payload: PerformanceAnalyzeRequest) -> PerformanceAnalyzeResponse:
        driver = self.driver_repo.get_by_code(payload.driver_id)
        if driver is None:
            raise NotFoundError(f"Driver {payload.driver_id} was not found")

        truck = self.truck_repo.get_by_code(payload.truck_id)
        if truck is None:
            raise NotFoundError(f"Truck {payload.truck_id} was not found")

        score = calculate_performance_score(payload)

        ai_analysis = get_ai_service(self.db).analyze_performance(
            driver_code=driver.driver_code,
            truck_code=truck.truck_code,
            payload=payload,
            score=score,
        )

        record = PerformanceRecord(
            driver_id=driver.id,
            truck_id=truck.id,
            shift=payload.shift,
            cycle_count=payload.cycle_count,
            payload_ton=payload.payload_ton,
            average_cycle_time=payload.average_cycle_time,
            waiting_time=payload.waiting_time,
            idle_time=payload.idle_time,
            fuel_consumption=payload.fuel_consumption,
            speeding_events=payload.speeding_events,
            harsh_braking_events=payload.harsh_braking_events,
            safety_events=payload.safety_events,
            route_compliance=payload.route_compliance,
            notes=payload.notes,
            overall_score=float(score["overall_score"]),
            production_score=float(score["production_score"]),
            efficiency_score=float(score["efficiency_score"]),
            safety_score=float(score["safety_score"]),
            fuel_score=float(score["fuel_score"]),
        )
        self.performance_repo.add(record)
        self.db.commit()

        return PerformanceAnalyzeResponse(
            overall_score=float(score["overall_score"]),
            production_score=float(score["production_score"]),
            efficiency_score=float(score["efficiency_score"]),
            safety_score=float(score["safety_score"]),
            fuel_score=float(score["fuel_score"]),
            positive_factors=list(score["positive_factors"]),
            improvement_factors=list(score["improvement_factors"]),
            ai_analysis=ai_analysis,
        )

    def history(self, driver_id: str | None, limit: int = 20) -> list[PerformanceHistoryItem]:
        db_driver_id = None
        if driver_id is not None:
            driver = self.driver_repo.get_by_code(driver_id)
            if driver is None:
                raise NotFoundError(f"Driver {driver_id} was not found")
            db_driver_id = driver.id

        rows = self.performance_repo.history(db_driver_id, limit)
        return [to_performance_history_schema(row) for row in rows]

    @staticmethod
    def _build_analysis_text(overall_score: float | list[str], improvements: float | list[str]) -> str:
        score = float(overall_score)
        suggestions = ", ".join(improvements) if isinstance(improvements, list) and improvements else "keep stable operating patterns"
        return (
            f"Overall score is {score:.0f}. This is a deterministic prototype assessment. "
            f"Recommended focus: {suggestions}."
        )
