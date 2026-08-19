from abc import ABC, abstractmethod
import logging

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.repositories.performance_repository import PerformanceRepository
from app.repositories.telemetry_repository import TelemetryRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.ai import AIChatRequest, AIChatResponse
from app.services.vehicle_health_service import VehicleHealthService

logger = logging.getLogger(__name__)


class AIService(ABC):
    @abstractmethod
    def chat(self, payload: AIChatRequest) -> AIChatResponse:
        raise NotImplementedError


class _AIContextBuilder:
    def __init__(self, db: Session) -> None:
        self.truck_repo = TruckRepository(db)
        self.telemetry_repo = TelemetryRepository(db)
        self.performance_repo = PerformanceRepository(db)
        self.vehicle_health_service = VehicleHealthService(db)

    def build(self, payload: AIChatRequest) -> tuple[dict[str, object], str | None]:
        truck = self.truck_repo.get_by_code(payload.truck_id)
        if truck is None:
            return {}, "کامیون یافت نشد."

        telemetry = self.telemetry_repo.latest_for_truck(truck.id)
        latest_perf = self.performance_repo.latest()
        health = self.vehicle_health_service.get_health(payload.truck_id)

        context = {
            "driver_id": payload.driver_id,
            "truck_id": payload.truck_id,
            "performance_score": latest_perf.overall_score if latest_perf else None,
            "speed": telemetry.speed if telemetry else None,
            "engine_temperature": telemetry.engine_temperature if telemetry else None,
            "fuel_level": telemetry.fuel_level if telemetry else None,
            "vehicle_health": health.overall_score,
            "maintenance_risk": health.predictive_maintenance.risk_level.value,
            "maintenance_reason": health.predictive_maintenance.reason,
        }
        return context, None


class MockAIService(AIService):
    def __init__(self, db: Session) -> None:
        self.ctx_builder = _AIContextBuilder(db)

    def chat(self, payload: AIChatRequest) -> AIChatResponse:
        context, error_message = self.ctx_builder.build(payload)
        if error_message:
            return AIChatResponse(message=error_message, sources=[], context={})

        question = payload.message.strip()
        response = "در نمونه اولیه، تحلیل براساس داده‌های فعلی انجام می‌شود."

        performance_score = context.get("performance_score")

        if "امتیاز" in question:
            if performance_score is not None:
                response = f"امتیاز کلی اخیر {float(performance_score):.0f} است. تمرکز روی کاهش زمان انتظار توصیه می‌شود."
            else:
                response = "هنوز داده عملکردی ثبت نشده است. لطفاً فرم عملکرد را تکمیل کنید."
        elif "کامیون" in question or "سلامت" in question:
            response = (
                f"سلامت کامیون {payload.truck_id} برابر {float(context['vehicle_health']):.0f} است. "
                f"سطح ریسک نگهداری: {context['maintenance_risk']}."
            )
        elif "مأموریت" in question or "ماموریت" in question:
            response = "برای کاهش زمان چرخه، شاول‌های با صف کمتر اولویت دارند."

        return AIChatResponse(
            message=response,
            sources=["performance_records", "telemetry", "vehicle_health"],
            context=context,
        )


class GoogleGenAIService(AIService):
    def __init__(self, db: Session, api_key: str, model: str) -> None:
        self.ctx_builder = _AIContextBuilder(db)
        self.model = model

        if not api_key:
            raise ValueError("AI_API_KEY is required for google provider")

        try:
            from google import genai
        except Exception as exc:  # pragma: no cover
            raise RuntimeError("google-genai library is not installed") from exc

        self.client = genai.Client(api_key=api_key)

    def chat(self, payload: AIChatRequest) -> AIChatResponse:
        context, error_message = self.ctx_builder.build(payload)
        if error_message:
            return AIChatResponse(message=error_message, sources=[], context={})

        prompt = self._build_prompt(payload.message, context)

        result = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
        )

        generated = (result.text or "").strip()
        if not generated:
            generated = "پاسخ از مدل دریافت نشد. لطفاً دوباره تلاش کنید."

        return AIChatResponse(
            message=generated,
            sources=["gemini", "performance_records", "telemetry", "vehicle_health"],
            context=context,
        )

    @staticmethod
    def _build_prompt(user_message: str, context: dict[str, object]) -> str:
        return (
            "You are SmartMine AI assistant for a mining fleet thesis prototype. "
            "Respond in Persian. Use concise, practical guidance based on provided context. "
            "Do not invent unavailable data.\n\n"
            f"User question: {user_message}\n"
            f"Context JSON: {context}\n"
        )


def get_ai_service(db: Session) -> AIService:
    settings = get_settings()

    if settings.ai_provider.lower() == "google":
        try:
            return GoogleGenAIService(
                db=db,
                api_key=settings.ai_api_key,
                model=settings.ai_model,
            )
        except Exception as exc:
            logger.warning("Google AI provider failed; falling back to mock: %s", exc)
            return MockAIService(db)

    return MockAIService(db)
