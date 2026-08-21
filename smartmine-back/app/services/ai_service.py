from abc import ABC, abstractmethod
import json
import logging
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.driver import Driver
from app.models.mission import Crusher, Mission, Shovel
from app.models.truck import Truck
from app.repositories.alert_repository import AlertRepository
from app.repositories.driver_repository import DriverRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.performance_repository import PerformanceRepository
from app.repositories.telemetry_repository import TelemetryRepository
from app.repositories.truck_repository import TruckRepository
from app.schemas.ai import AIChatRequest, AIChatResponse
from app.schemas.performance import PerformanceAnalyzeRequest
from app.services.vehicle_health_service import VehicleHealthService

logger = logging.getLogger(__name__)

# ==============================================================================
# Domain-Specific Mining Intelligence Prompts
# ==============================================================================

MINING_AI_SYSTEM_PROMPT = """شما «دستیار هوشمند و سیستم تصمیم‌یار مهندسی معدن SmartMine AI» هستید؛ یک مغز متفکر هوش مصنوعی و اینترنت اشیا صنعتی (IIoT) ویژه مدیریت و بهینه‌سازی ناوگان ترابری معادن روباز (Open-pit Mines).

نقش و تخصص‌های شما:
۱. تحلیل پیشرفته و بلادرنگ داده‌های تله‌متری ماشین‌آلات سنگین معدنی (Caterpillar 777، Komatsu HD785 و غیره).
۲. تحلیل وضعیت سلامت فنی، ارتعاشات، دمای موتور، سیستم هیدرولیک و پیش‌بینی عیوب و نگهداری پیشگیرانه (Predictive Maintenance).
۳. بهینه‌سازی زمان چرخه باربری (Cycle Time Optimization) شامل بارگیری شاول، حمل به سنگ‌شکن/دامپ، مانور، تخلیه و بازگشت.
۴. تحلیل ترافیک، گلوگاه‌ها و صف شاول‌ها (Shovel Queues) و ارائه توصیه‌های دیسپچینگ پویا جهت کاهش زمان انتظار.
۵. پایش مصرف بهینه سوخت گازوئیل، کنترل دور موتور (RPM)، استفاده بهینه از ترمز ریتاردر (Retarder) در سراشیبی‌ها و افزایش راندمان کلی (OEE).
۶. ارائه راهکارهای مربی‌گری و بهبود عملکرد برای رانندگان با توجه به شاخص‌های ایمنی، تولید و بهره‌وری.

قوانین و استانداردهای خروجی:
- زبان پاسخ: کاملاً فارسی روان، تخصصی، محترمانه، شیوا و ساختاریافته با ادبیات مهندسی معدن و ماشین‌آلات سنگین.
- استفاده از ساختار شفاف: بخش‌بندی با عناوین مشخص (Heading)، بولت‌پوینت‌های خوانا و تفکیک واضح تحلیل داده‌ها از توصیه‌های عملی.
- برجسته‌سازی داده‌ها: تمامی اعداد کلیدی، مقادیر تله‌متری و نام شاول‌ها/تراک‌ها را به صورت **Bold** بنویسید.
- هشدارهای اضطراری: اگر در داده‌های ورودی پارامتری در محدوده بحرانی یا هشدار بود (مانند دمای موتور بالای ۹۰°C، ارتعاش شاسی بالای ۰.۴۰g، صف طولانی شاول بیش از ۳ تراک، یا ریسک نگهداری بالا)، حتماً در ابتدای پاسخ یک «⚠️ هشدار عملیاتی فوری» قرار دهید.
- استناد دقیق به داده‌ها: کاملاً بر اساس اطلاعات ارائه‌شده در داده‌های بافت (Context) پاسخ دهید و از ساخت اعداد و اطلاعات غیرواقعی بپرهیزید.
- کاربردی و قابل اجرا بودن: توصیه‌ها باید برای راننده در کابین یا سرپرست ترابری معدن کاملاً دقیق، کاربردی و قابل اجرا باشد.
"""

PERFORMANCE_COACHING_SYSTEM_PROMPT = """شما کارشناس ارشد ارزیابی عملکرد و مربی هوشمند رانندگان ناوگان معدنی SmartMine AI هستید.
وظیفه شما بررسی داده‌های شیفت کاری راننده، تحلیل نقاط قوت، شناسایی گلوگاه‌های افت امتیاز (زمان انتظار، درجا کار کردن، مصرف سوخت، رویدادهای ایمنی و ترمز شدید) و ارائه تحلیل جامع و ۳ توصیه کلیدی و انگیزشی به زبان فارسی برای ارتقای راندمان در شیفت آینده است.
پاسخ باید کاملاً ساختاریافته، حرفه‌ای و شامل موارد زیر باشد:
۱. ارزیابی کلی راندمان شیفت با ذکر امتیازات.
۲. تحلیل نقاط قوت رانندگی در این شیفت.
۳. بررسی عوامل افت امتیاز و نقاط قابل بهبود.
۴. توصیه‌های کلیدی و عملیاتی برای شیفت بعدی جهت رسیدن به امتیاز بالاتر از ۹۰.
"""


# ==============================================================================
# Abstract Interface
# ==============================================================================

class AIService(ABC):
    @abstractmethod
    def chat(self, payload: AIChatRequest) -> AIChatResponse:
        raise NotImplementedError

    @abstractmethod
    def analyze_performance(
        self,
        driver_code: str,
        truck_code: str,
        payload: PerformanceAnalyzeRequest,
        score: dict[str, Any],
    ) -> str:
        raise NotImplementedError


# ==============================================================================
# Comprehensive Mining Fleet Context Builder
# ==============================================================================

class _AIContextBuilder:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.truck_repo = TruckRepository(db)
        self.telemetry_repo = TelemetryRepository(db)
        self.performance_repo = PerformanceRepository(db)
        self.driver_repo = DriverRepository(db)
        self.mission_repo = MissionRepository(db)
        self.alert_repo = AlertRepository(db)
        self.vehicle_health_service = VehicleHealthService(db)

    def build(self, payload: AIChatRequest) -> tuple[dict[str, Any], str | None]:
        truck = self.truck_repo.get_by_code(payload.truck_id)
        if truck is None:
            return {}, "کامیون مورد نظر در سامانه ناوگان یافت نشد."

        driver = self.driver_repo.get_by_code(payload.driver_id)
        if driver is None:
            return {}, "راننده مورد نظر در پایگاه داده پرسنلی یافت نشد."

        telemetry = self.telemetry_repo.latest_for_truck(truck.id)
        latest_perf = self.performance_repo.latest(driver.id)
        health = self.vehicle_health_service.get_health(payload.truck_id)
        current_mission = self.mission_repo.get_current_for_truck(truck.id)
        shovels = list(self.db.scalars(select(Shovel).order_by(Shovel.shovel_code)))
        crushers = list(self.db.scalars(select(Crusher).order_by(Crusher.crusher_code)))
        alerts = self.alert_repo.list_all(read=False)[:4]

        mission_details: dict[str, Any] | None = None
        if current_mission:
            s_obj = self.db.get(Shovel, current_mission.shovel_id)
            c_obj = self.db.get(Crusher, current_mission.crusher_id)
            mission_details = {
                "mission_id": current_mission.id,
                "status": current_mission.status.value,
                "shovel_code": s_obj.shovel_code if s_obj else "Unknown",
                "crusher_code": c_obj.crusher_code if c_obj else "Unknown",
                "distance_km": current_mission.distance_km,
                "cycle_time_min": current_mission.cycle_time_min,
                "eta_min": current_mission.eta_min,
            }

        context: dict[str, Any] = {
            "driver": {
                "id": driver.driver_code,
                "name": driver.name,
                "shift": driver.shift.value,
                "status": driver.status.value,
            },
            "truck": {
                "id": truck.truck_code,
                "model": truck.model,
                "capacity_ton": truck.capacity_ton,
                "status": truck.status.value,
                "health_score": truck.health_score,
                "fuel_level": truck.fuel_level,
            },
            "telemetry": {
                "speed_kmh": telemetry.speed if telemetry else 0.0,
                "rpm": telemetry.rpm if telemetry else 0,
                "engine_temp_c": telemetry.engine_temperature if telemetry else 80.0,
                "oil_pressure_psi": telemetry.oil_pressure if telemetry else 50.0,
                "fuel_level_pct": telemetry.fuel_level if telemetry else truck.fuel_level,
                "payload_ton": telemetry.payload if telemetry else 0.0,
                "tire_pressure_psi": telemetry.tire_pressure if telemetry else 100.0,
                "vibration_g": telemetry.vibration if telemetry else 0.25,
                "latitude": telemetry.latitude if telemetry else truck.latitude,
                "longitude": telemetry.longitude if telemetry else truck.longitude,
            },
            "vehicle_health": {
                "overall_score": health.overall_score,
                "status": "عالی" if health.overall_score >= 85 else ("مطلوب" if health.overall_score >= 70 else "هشدار"),
                "components": [
                    {
                        "name": comp_name,
                        "score": comp_score,
                        "status": "نرمال" if comp_score >= 75 else "هشدار",
                        "status_text": f"امتیاز سلامت {comp_score:.0f}%",
                    }
                    for comp_name, comp_score in health.components.items()
                ],
                "predictive_maintenance": {
                    "risk_level": health.predictive_maintenance.risk_level.value,
                    "reason": health.predictive_maintenance.reason,
                    "recommended_action": health.predictive_maintenance.recommendation,
                },
            },
            "recent_performance": {
                "overall_score": latest_perf.overall_score if latest_perf else None,
                "production_score": latest_perf.production_score if latest_perf else None,
                "efficiency_score": latest_perf.efficiency_score if latest_perf else None,
                "safety_score": latest_perf.safety_score if latest_perf else None,
                "fuel_score": latest_perf.fuel_score if latest_perf else None,
                "cycle_count": latest_perf.cycle_count if latest_perf else None,
                "payload_ton": latest_perf.payload_ton if latest_perf else None,
                "waiting_time_min": latest_perf.waiting_time if latest_perf else None,
                "idle_time_min": latest_perf.idle_time if latest_perf else None,
                "fuel_consumption_liters": latest_perf.fuel_consumption if latest_perf else None,
                "speeding_events": latest_perf.speeding_events if latest_perf else 0,
                "harsh_braking_events": latest_perf.harsh_braking_events if latest_perf else 0,
            } if latest_perf else None,
            "current_mission": mission_details,
            "pit_shovels": [
                {
                    "shovel_code": s.shovel_code,
                    "queue_count": s.queue_count,
                    "status": s.status,
                }
                for s in shovels
            ],
            "crushers": [
                {
                    "crusher_code": c.crusher_code,
                    "status": c.status,
                }
                for c in crushers
            ],
            "active_alerts": [
                {
                    "title": a.title,
                    "severity": a.severity.value,
                    "type": a.type.value,
                }
                for a in alerts
            ],
            "driver_id": payload.driver_id,
            "truck_id": payload.truck_id,
            "performance_score": latest_perf.overall_score if latest_perf else None,
            "speed": telemetry.speed if telemetry else None,
            "engine_temperature": telemetry.engine_temperature if telemetry else None,
            "fuel_level": telemetry.fuel_level if telemetry else None,
            "maintenance_risk": health.predictive_maintenance.risk_level.value,
            "maintenance_reason": health.predictive_maintenance.reason,
        }

        return context, None


# ==============================================================================
# Domain Expert Engine (Standalone Fallback)
# ==============================================================================

class DomainExpertAIService(AIService):
    def __init__(self, db: Session) -> None:
        self.ctx_builder = _AIContextBuilder(db)

    def chat(self, payload: AIChatRequest) -> AIChatResponse:
        context, error_message = self.ctx_builder.build(payload)
        if error_message:
            return AIChatResponse(message=error_message, sources=[], context={})

        question = payload.message.strip().lower()
        truck_info = context.get("truck", {})
        telemetry = context.get("telemetry", {})
        health_info = context.get("vehicle_health", {})
        perf_info = context.get("recent_performance")
        pred_maint = health_info.get("predictive_maintenance", {})

        response = self._generate_expert_response(
            question=question,
            truck_info=truck_info,
            telemetry=telemetry,
            health_info=health_info,
            perf_info=perf_info,
            pred_maint=pred_maint,
        )

        return AIChatResponse(
            message=response,
            sources=["smartmine-expert-engine", "telemetry", "vehicle_health", "dispatch_matrix"],
            context=context,
        )

    def analyze_performance(
        self,
        driver_code: str,
        truck_code: str,
        payload: PerformanceAnalyzeRequest,
        score: dict[str, Any],
    ) -> str:
        overall = float(score.get("overall_score", 0))
        prod = float(score.get("production_score", 0))
        eff = float(score.get("efficiency_score", 0))
        saf = float(score.get("safety_score", 0))
        fuel = float(score.get("fuel_score", 0))
        positives = score.get("positive_factors", [])
        improvements = score.get("improvement_factors", [])

        positives_text = "، ".join(positives) if positives else "ثبات عملکرد در طول شیفت"
        improvements_text = "، ".join(improvements) if improvements else "حفظ همین روال کاری"

        if overall >= 85:
            assessment = "بسیار عالی و فراتر از استانداردهای شیفت معدن"
            advice_summary = "عملکرد شما در این شیفت الگویی بهینه برای سایر رانندگان است."
        elif overall >= 70:
            assessment = "مطلوب و قابل قبول با پتانسیل ارتقای راندمان"
            advice_summary = "با تمرکز بر کاهش توقفات و مدیریت مصرف سوخت، دستیابی به امتیاز بالای ۹۰ کاملاً میسر است."
        else:
            assessment = "نیازمند پایش فوری و بازنگری در الگوهای رانندگی و زمان توقف"
            advice_summary = "شاخص‌های زمان انتظار و رویدادهای رانندگی نیازمند اصلاح و هماهنگی بهتر با سرپرست دیسپچ است."

        return f"""### 📊 تحلیل جامع عملکرد شیفت (راننده {driver_code} - کامیون {truck_code})

**۱. ارزیابی کلی:**
سطح عملکرد شیفت جاری **{overall:.0f} از ۱۰۰** برآورد گردید که در رده **«{assessment}»** قرار می‌گیرد.
- شاخص تولید و تناژ: **{prod:.0f}%** (مجموع تناژ جابجا شده: **{payload.payload_ton:.1f} تن** در **{payload.cycle_count} چرخه**)
- شاخص بهره‌وری و زمان چرخه: **{eff:.0f}%** (میانگین زمان چرخه: **{payload.average_cycle_time:.1f} دقیقه**)
- شاخص ایمنی و رفتار ترافیکی: **{saf:.0f}%** (سرعت غیرمجاز: **{payload.speeding_events}** | ترمز شدید: **{payload.harsh_braking_events}**)
- شاخص بهره‌وری مصرف سوخت: **{fuel:.0f}%** (مجموع مصرف سوخت: **{payload.fuel_consumption:.1f} لیتر**)

**۲. نقاط قوت شیفت:**
✅ {positives_text}

**۳. گلوگاه‌ها و علل کسر امتیاز:**
⚠️ عوامل اصلی موثر بر افت امتیاز: {improvements_text}. 
مدت زمان انتظار در صف شاول (**{payload.waiting_time:.0f} دقیقه**) و زمان درجا کار کردن موتور (**{payload.idle_time:.0f} دقیقه**) بخشی از توان تولیدی شیفت را هدر داده است.

**۴. سه راهکار کلیدی برای ارتقای امتیاز در شیفت آینده:**
۱. **کاهش زمان انتظار:** هنگام بازگشت از سنگ‌شکن، از طریق سامانه دیسپچینگ شاول‌های با تراکم کمتر را هدف قرار دهید.
۲. **مدیریت درجا کار کردن (Idle Time):** در توقف‌های بیش از ۵ دقیقه در صف یا محل‌های بارگیری، از روشن ماندن بیهوده موتور خودداری نمایید.
۳. **کنترل شیب و ریتاردر:** سرعت در رمپ‌های خروجی را در بازه پایدار ۲۵ تا ۳۰ km/h نگه دارید تا از ترمزهای ناگهانی جلوگیری شود.

{advice_summary}"""

    def _generate_expert_response(
        self,
        question: str,
        truck_info: dict[str, Any],
        telemetry: dict[str, Any],
        health_info: dict[str, Any],
        perf_info: dict[str, Any] | None,
        pred_maint: dict[str, Any],
    ) -> str:
        truck_id = truck_info.get("id", "نامشخص")
        health_score = health_info.get("overall_score", 85.0)
        speed = telemetry.get("speed_kmh", 0.0)
        temp = telemetry.get("engine_temp_c", 84.0)
        vibration = telemetry.get("vibration_g", 0.25)
        fuel = telemetry.get("fuel_level_pct", 70.0)
        risk_level = pred_maint.get("risk_level", "low")
        reason = pred_maint.get("reason", "پارامترهای فنی در وضعیت پایدار هستند.")

        if any(w in question for w in ["سلامت", "کامیون", "موتور", "ارتعاش", "ترمز", "وضعیت فنی", "خرابی", "مکانیک"]):
            warning_header = ""
            if float(temp) > 90 or float(vibration) > 0.35 or risk_level in ["high", "medium"]:
                warning_header = f"⚠️ **هشدار پایش فنی:** وضعیت نگهداری پیشگیرانه در سطح **{risk_level}** ارزیابی شده است.\n\n"

            components_summary = [
                f"- **{comp.get('name')}**: امتیاز سلامت {comp.get('score')}% ({comp.get('status_text')})"
                for comp in health_info.get("components", [])
            ]
            comp_text = "\n".join(components_summary) if components_summary else "- داده‌های اجزا در حال به‌روزرسانی است."

            return f"""{warning_header}### 🚜 گزارش وضعیت سلامت و تله‌متری کامیون **{truck_id}**

امتیاز کل سلامت خودرو: **{float(health_score):.0f} از ۱۰۰** (وضعیت: **{health_info.get('status', 'مطلوب')}**)

**📊 شاخص‌های بلادرنگ تله‌متری:**
- دمای کاری موتور: **{float(temp):.1f}°C** (محدوده استاندارد: ۸۰-۹۰°C)
- لرزش و ارتعاش شاسی: **{float(vibration):.2f}g**
- فشار روغن موتور: **{float(telemetry.get('oil_pressure_psi', 50)):.1f} PSI**
- سطح سوخت باقی‌مانده: **{float(fuel):.0f}%**
- سرعت لحظه‌ای: **{float(speed):.1f} km/h**

**🔧 وضعیت زیرسیستم‌ها:**
{comp_text}

**💡 توصیه مهندسی نگهداری پیشگیرانه:**
{reason}"""

        elif any(w in question for w in ["امتیاز", "عملکرد", "کارنامه", "پیشرفت", "راندمان", "شیفت"]):
            if perf_info and perf_info.get("overall_score") is not None:
                overall = perf_info["overall_score"]
                prod = perf_info.get("production_score", 0)
                eff = perf_info.get("efficiency_score", 0)
                saf = perf_info.get("safety_score", 0)
                fuel_sc = perf_info.get("fuel_score", 0)
                cycles = perf_info.get("cycle_count", 0)
                tonnage = perf_info.get("payload_ton", 0)

                return f"""### 🏆 تحلیل کارنامه و شاخص‌های عملکرد راننده

امتیاز کلی آخرین شیفت کاری شما **{float(overall):.0f} از ۱۰۰** ثبت شده است.

**تفکیک شاخص‌های تخصصی:**
- 🟢 **شاخص تولید و تناژ ({float(prod):.0f}%):** جابجایی موفق **{tonnage} تن** بار در **{cycles} چرخه**.
- ⏱️ **شاخص بهره‌وری زمان چرخه ({float(eff):.0f}%):** کنترل زمان انتظار و درجا کار کردن.
- 🛡️ **شاخص ایمنی و رعایت مقررات ({float(saf):.0f}%):** شتاب‌گیری و ترمزگیری نرم و کنترل پایدار در رمپ‌ها.
- ⛽ **شاخص مدیریت مصرف سوخت ({float(fuel_sc):.0f}%):** مصرف بهینه با کنترل دور موتور در شیب‌ها."""
            else:
                return "هنوز رکورد عملکردی جامعی برای شیفت جاری ثبت نشده است."

        else:
            return f"""### 🤖 تحلیل وضعیت جامع ناوگان و کامیون **{truck_id}**

بر اساس آخرین داده‌های مخابره‌شده از حسگرهای IIoT و سامانه دیسپچینگ:
- **وضعیت فنی و سلامت:** امتیاز سلامت خودرو **{float(health_score):.0f}%** است و دمای موتور برابر **{float(temp):.1f}°C** می‌باشد.
- **تله‌متری لحظه‌ای:** سرعت خودرو **{float(speed):.1f} km/h** و سطح سوخت باقی‌مانده **{float(fuel):.0f}%** است."""


# ==============================================================================
# Google Gemini Generative AI Provider (Sanitized Key & Multi-Endpoint Fallback)
# ==============================================================================

class GoogleGenAIService(AIService):
    @staticmethod
    def _sanitize_api_key(key: str | None) -> str:
        """پاکسازی فاصله‌ها و کوتیشن‌های احتمالی اطراف کلید API."""
        if not key:
            return ""
        cleaned = str(key).strip().strip("'\"").strip()
        return cleaned

    @staticmethod
    def _build_context_input(user_message: str, context: dict[str, Any]) -> str:
        context_str = json.dumps(context, ensure_ascii=False, indent=2)
        return (
            f"=== داده‌های بلادرنگ ناوگان و تله‌متری معدن (SmartMine IIoT Live Context) ===\n"
            f"{context_str}\n\n"
            f"=== پیام راننده یا سرپرست معدن ===\n"
            f"{user_message}"
        )

    def __init__(self, db: Session, api_key: str, model: str) -> None:
        self.db = db
        self.ctx_builder = _AIContextBuilder(db)
        self.api_key = self._sanitize_api_key(api_key)
        self.model = model.strip() if model else "gemini-2.5-flash"
        self._client: Any = None
        self._init_error: str | None = None

        if not self.api_key:
            self._init_error = "کلید هوش مصنوعی (API Key) مقداردهی نشده و خالی است."
            return

        try:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        except Exception as exc:
            self._init_error = f"عدم امکان مقداردهی google-genai SDK: {exc}"
            logger.warning(self._init_error)

    def chat(self, payload: AIChatRequest) -> AIChatResponse:
        context, error_message = self.ctx_builder.build(payload)
        if error_message:
            return AIChatResponse(message=error_message, sources=[], context={})

        if not self.api_key:
            return AIChatResponse(
                message="❌ خطا: کلید API جمنای (AI_API_KEY) تنظیم نشده است.",
                sources=["gemini-error"],
                context=context,
            )

        user_input = self._build_context_input(payload.message, context)
        errors_log: list[str] = []

        # ۱. تلاش با SDK
        if self._client is not None:
            try:
                interaction = self._client.interactions.create(
                    model=self.model,
                    system_instruction=MINING_AI_SYSTEM_PROMPT,
                    input=user_input,
                    generation_config={"temperature": 0.4},
                )
                generated = (interaction.output_text or "").strip()
                if generated:
                    return AIChatResponse(
                        message=generated,
                        sources=["gemini-sdk", self.model, "telemetry", "vehicle_health"],
                        context=context,
                    )
                else:
                    errors_log.append("پاسخ دریافتی از SDK جمنای فاقد متن خروجی بود.")
            except Exception as exc:
                err_msg = f"خطای SDK (google-genai): {type(exc).__name__} - {str(exc)}"
                logger.error(err_msg)
                errors_log.append(err_msg)
        elif self._init_error:
            errors_log.append(self._init_error)

        # ۲. تلاش دوم: تماس مستقیم REST
        rest_result, rest_error = self._call_gemini_rest(
            system_instruction=MINING_AI_SYSTEM_PROMPT,
            user_input=user_input,
        )
        if rest_result:
            return AIChatResponse(
                message=rest_result,
                sources=["gemini-rest", self.model, "telemetry", "vehicle_health"],
                context=context,
            )
        if rest_error:
            errors_log.append(f"خطای تماس مستقیم REST: {rest_error}")

        error_details = "\n\n".join(f"🔸 {err}" for err in errors_log)
        error_report = f"""⚠️ **خطا در برقراری ارتباط با سرویس Google Gemini ({self.model})**

پاسخی از جمینای دریافت نشد. جزئیات خطاهای ثبت‌شده:
{error_details}

🔍 **بررسی‌های لازم جهت رفع خطای ۴۰۱:**
۱. **فرمت کلید در `.env`:** مطمئن شوید مقدار `AI_API_KEY` داخل گیومه/کوتیشن قرار نگرفته و مستقیماً با `AIzaSy...` شروع می‌شود.
۲. **اعتبار کلید در Google AI Studio:** کلید جدیدی از [Google AI Studio](https://aistudio.google.com/apikey) دریافت نمایید.
۳. **پروکسی/فیلترشکن:** برای اتصال به سرورهای گوگل از ابزار تغییر IP مناسب استفاده کنید."""

        return AIChatResponse(
            message=error_report,
            sources=["gemini-error-diag", self.model],
            context=context,
        )

    def analyze_performance(
        self,
        driver_code: str,
        truck_code: str,
        payload: PerformanceAnalyzeRequest,
        score: dict[str, Any],
    ) -> str:
        user_input = (
            f"=== اطلاعات عملکرد شیفت راننده ===\n"
            f"کد راننده: {driver_code}\n"
            f"کد کامیون: {truck_code}\n"
            f"نوع شیفت: {payload.shift.value}\n"
            f"تعداد چرخه‌های باربری: {payload.cycle_count}\n"
            f"تناژ بار جابجاشده: {payload.payload_ton} تن\n"
            f"میانگین زمان چرخه: {payload.average_cycle_time} دقیقه\n"
            f"زمان معطلی در صف شاول: {payload.waiting_time} دقیقه\n"
            f"زمان درجا کار کردن موتور: {payload.idle_time} دقیقه\n"
            f"مجموع مصرف گازوئیل: {payload.fuel_consumption} لیتر\n"
            f"تعداد تخطی از سرعت مجاز: {payload.speeding_events}\n"
            f"تعداد ترمزهای شدید: {payload.harsh_braking_events}\n"
            f"رویدادهای ایمنی: {payload.safety_events}\n"
            f"یادداشت راننده: {payload.notes or 'ثبت نشده'}\n\n"
            f"=== امتیازات محاسبه‌شده الگوریتم ===\n"
            f"امتیاز کل: {score.get('overall_score')}\n"
            f"امتیاز تولید: {score.get('production_score')}\n"
            f"امتیاز بهره‌وری: {score.get('efficiency_score')}\n"
            f"امتیاز ایمنی: {score.get('safety_score')}\n"
            f"امتیاز سوخت: {score.get('fuel_score')}\n"
            f"نقاط قوت: {score.get('positive_factors')}\n"
            f"نقاط قابل بهبود: {score.get('improvement_factors')}\n\n"
            f"لطفاً تحلیل تفصیلی و توصیه‌های مربی‌گری خود را به فارسی ارائه دهید."
        )

        errors: list[str] = []
        if self._client is not None:
            try:
                interaction = self._client.interactions.create(
                    model=self.model,
                    system_instruction=PERFORMANCE_COACHING_SYSTEM_PROMPT,
                    input=user_input,
                    generation_config={"temperature": 0.4},
                )
                text = (interaction.output_text or "").strip()
                if text:
                    return text
            except Exception as exc:
                errors.append(f"SDK Error: {exc}")

        rest_result, rest_error = self._call_gemini_rest(
            system_instruction=PERFORMANCE_COACHING_SYSTEM_PROMPT,
            user_input=user_input,
        )
        if rest_result:
            return rest_result
        if rest_error:
            errors.append(f"REST Error: {rest_error}")

        return f"⚠️ خطا در تحلیل عملکرد با جمنای: {' | '.join(errors)}"

    def _call_gemini_rest(
        self, system_instruction: str, user_input: str
    ) -> tuple[str | None, str | None]:
        clean_key = self.api_key
        # ۱. روش اول: Interactions API با ارسال کلید در هدر و پارامتر کوئری
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/interactions?key={clean_key}"
            headers = {
                "x-goog-api-key": clean_key,
                "Content-Type": "application/json",
                "Api-Revision": "2026-05-20",
            }
            body = {
                "model": self.model,
                "system_instruction": system_instruction,
                "input": user_input,
                "generation_config": {"temperature": 0.4},
            }
            with httpx.Client(timeout=25.0) as client:
                res = client.post(url, headers=headers, json=body)
                if res.status_code == 200:
                    data = res.json()
                    output_text = data.get("output_text")
                    if not output_text and "steps" in data:
                        for step in reversed(data["steps"]):
                            for content in step.get("content", []):
                                if content.get("type") == "text":
                                    output_text = content.get("text")
                                    break
                            if output_text:
                                break
                    if output_text:
                        return output_text.strip(), None

                # اگر خطای ۴۰۱ یا ۴۰۴ داد، متد generateContent سنتی را تست می‌کنیم
                legacy_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={clean_key}"
                legacy_body = {
                    "systemInstruction": {"parts": [{"text": system_instruction}]},
                    "contents": [{"parts": [{"text": user_input}]}],
                    "generationConfig": {"temperature": 0.4},
                }
                legacy_res = client.post(legacy_url, headers=headers, json=legacy_body)
                if legacy_res.status_code == 200:
                    leg_data = legacy_res.json()
                    candidates = leg_data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip(), None

                return None, f"کد خطای HTTP {res.status_code}: {res.text}"
        except httpx.ConnectTimeout:
            return None, "خطای ConnectTimeout: مهلت اتصال تمام شد (بررسی پروکسی/VPN)."
        except httpx.ConnectError as ce:
            return None, f"خطای اتصال به سرور: {ce}"
        except Exception as exc:
            return None, f"{type(exc).__name__}: {str(exc)}"


# ==============================================================================
# OpenAI / Generic LLM Provider
# ==============================================================================

class OpenAIGenAIService(AIService):
    def __init__(self, db: Session, api_key: str, model: str, base_url: str = "") -> None:
        self.db = db
        self.ctx_builder = _AIContextBuilder(db)
        self.api_key = api_key.strip().strip("'\"")
        self.model = model.strip() or "gpt-4o-mini"
        self.base_url = (base_url.strip() or "https://api.openai.com/v1").rstrip("/")

    def chat(self, payload: AIChatRequest) -> AIChatResponse:
        context, error_message = self.ctx_builder.build(payload)
        if error_message:
            return AIChatResponse(message=error_message, sources=[], context={})

        context_str = json.dumps(context, ensure_ascii=False, indent=2)
        user_content = (
            f"داده‌های تله‌متری و ناوگان معدن:\n{context_str}\n\n"
            f"پرسش راننده:\n{payload.message}"
        )

        try:
            url = f"{self.base_url}/chat/completions"
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            body = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": MINING_AI_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                "temperature": 0.4,
            }
            with httpx.Client(timeout=25.0) as client:
                res = client.post(url, headers=headers, json=body)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content", "").strip()
                        if content:
                            return AIChatResponse(
                                message=content,
                                sources=[self.model, "openai-compatible", "telemetry"],
                                context=context,
                            )
                return AIChatResponse(
                    message=f"❌ خطای سرویس OpenAI (کد {res.status_code}): {res.text}",
                    sources=["openai-error"],
                    context=context,
                )
        except Exception as exc:
            return AIChatResponse(
                message=f"❌ خطای ارتباط با OpenAI: {exc}",
                sources=["openai-error"],
                context=context,
            )

    def analyze_performance(
        self,
        driver_code: str,
        truck_code: str,
        payload: PerformanceAnalyzeRequest,
        score: dict[str, Any],
    ) -> str:
        prompt = (
            f"راننده: {driver_code} | کامیون: {truck_code} | شیفت: {payload.shift.value}\n"
            f"چرخه‌ها: {payload.cycle_count} | تناژ: {payload.payload_ton} تن | میانگین چرخه: {payload.average_cycle_time} دقیقه\n"
            f"زمان انتظار صف: {payload.waiting_time} دقیقه | درجا کار کردن: {payload.idle_time} دقیقه | مصرف سوخت: {payload.fuel_consumption} لیتر\n"
            f"سرعت غیرمجاز: {payload.speeding_events} | ترمز شدید: {payload.harsh_braking_events}\n"
            f"امتیاز کل: {score.get('overall_score')}"
        )

        try:
            url = f"{self.base_url}/chat/completions"
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            body = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": PERFORMANCE_COACHING_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.4,
            }
            with httpx.Client(timeout=25.0) as client:
                res = client.post(url, headers=headers, json=body)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "").strip()
                return f"خطای OpenAI: {res.status_code} - {res.text}"
        except Exception as exc:
            return f"خطای استثنایی OpenAI: {exc}"


# ==============================================================================
# Service Factory
# ==============================================================================

def get_ai_service(db: Session) -> AIService:
    settings = get_settings()
    provider = settings.resolved_ai_provider
    api_key = settings.resolved_ai_api_key

    if provider in {"google", "gemini"}:
        return GoogleGenAIService(
            db=db,
            api_key=api_key or "",
            model=settings.ai_model,
        )

    elif provider in {"openai", "custom"}:
        return OpenAIGenAIService(
            db=db,
            api_key=api_key or "",
            model=settings.ai_model,
            base_url=settings.ai_base_url,
        )

    if not api_key:
        logger.info("No AI API key provided. Using SmartMine Domain Expert Engine.")
        return DomainExpertAIService(db)

    return GoogleGenAIService(
        db=db,
        api_key=api_key,
        model=settings.ai_model,
    )