from app.schemas.performance import PerformanceAnalyzeRequest


def _clamp(score: float) -> float:
    return max(0.0, min(100.0, round(score, 2)))


def calculate_performance_score(payload: PerformanceAnalyzeRequest) -> dict[str, float | list[str]]:
    production_target = 380.0
    cycle_target = 12.0
    avg_cycle_target = 30.0
    wait_target = 35.0
    idle_target = 20.0
    fuel_target = 360.0

    # 1. Production Score (Tonnage + Cycle Count)
    production_score = _clamp(
        (payload.payload_ton / production_target) * 70.0 + (payload.cycle_count / cycle_target) * 30.0
    )

    # 2. Efficiency Score (Cycle Time, Queue Wait Time, Idle Time)
    efficiency_penalty = (
        max(0.0, payload.average_cycle_time - avg_cycle_target) * 1.2
        + max(0.0, payload.waiting_time - wait_target) * 0.5
        + max(0.0, payload.idle_time - idle_target) * 0.8
    )
    efficiency_score = _clamp(100.0 - efficiency_penalty)

    # 3. Safety Score (Speeding, Harsh Braking, Critical Incidents, Route Compliance)
    route_comp = getattr(payload, "route_compliance", 95.0) or 95.0
    route_penalty = max(0.0, 95.0 - route_comp) * 0.8
    safety_penalty = (
        payload.speeding_events * 6.0
        + payload.harsh_braking_events * 4.0
        + payload.safety_events * 10.0
        + route_penalty
    )
    safety_score = _clamp(100.0 - safety_penalty)

    # 4. Fuel Efficiency Score (Normalizes both hourly L/h and full-shift liters)
    actual_fuel = payload.fuel_consumption * 8.0 if payload.fuel_consumption <= 70.0 else payload.fuel_consumption
    fuel_penalty = max(0.0, actual_fuel - fuel_target) * 0.35
    fuel_score = _clamp(100.0 - fuel_penalty)

    # 5. Overall Weighted Performance Score
    overall_score = _clamp(
        production_score * 0.30 + efficiency_score * 0.25 + safety_score * 0.30 + fuel_score * 0.15
    )

    positive_factors: list[str] = []
    improvement_factors: list[str] = []

    # Granular Persian Positive & Improvement Factors
    if production_score >= 90:
        positive_factors.append("حجم تولید مطلوب و تکمیل چرخه‌های باربری فراتر از استاندارد شیفت")
    elif production_score >= 80:
        positive_factors.append("دستیابی به تناژ مصوب و چرخه‌های استاندارد شیفت کاری")
    else:
        improvement_factors.append("افزایش تعداد چرخه‌ها و ارتقای یکنواختی تناژ بارگیری در هر سرویس")

    if efficiency_score >= 85:
        positive_factors.append("مدیریت بهینه زمان چرخه باربری و حداقل توقف در صف شاول‌ها")
    else:
        improvement_factors.append("کاهش زمان معطلی در صف شاول و پرهیز از درجا کار کردن غیرضروری موتور")

    if safety_score >= 92:
        positive_factors.append("رعایت کامل سرعت مجاز، رانندگی ایمن و انطباق حداکثری با مسیرهای مصوب")
    else:
        improvement_factors.append("کنترل سرعت در سراشیبی‌ها، کاهش ترمزهای شدید و افزایش پایبندی به مسیر معدن")

    if fuel_score >= 85:
        positive_factors.append("رانندگی اقتصادی و مصرف سوخت بهینه با کنترل دور موتور در رمپ‌ها")
    else:
        improvement_factors.append("بهینه‌سازی مصرف گازوئیل از طریق رانندگی یکنواخت و کاهش درجا کار کردن در صف")

    if route_comp >= 95 and "انطباق" not in "".join(positive_factors):
        positive_factors.append("پایبندی عالی به مسیرهای استاندارد ترابری معدن")

    return {
        "production_score": production_score,
        "efficiency_score": efficiency_score,
        "safety_score": safety_score,
        "fuel_score": fuel_score,
        "overall_score": overall_score,
        "positive_factors": positive_factors,
        "improvement_factors": improvement_factors,
    }
