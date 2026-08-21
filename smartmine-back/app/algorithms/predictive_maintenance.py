from app.core.enums import RiskLevel


def predict_maintenance(
    engine_temperature: float | None,
    vibration: float | None,
    oil_pressure: float | None,
) -> dict[str, str | float | RiskLevel]:
    temp = engine_temperature or 85.0
    vib = vibration or 0.30
    oil = oil_pressure or 55.0

    risk_score = 20.0
    reasons: list[str] = []

    if temp > 90:
        risk_score += (temp - 90) * 3
        reasons.append("افزایش دمای کاری موتور بالاتر از آستانه مجاز")

    if vib > 0.40:
        risk_score += (vib - 0.40) * 180
        reasons.append("روند صعودی ارتعاشات شاسی و موتور")

    if oil < 50:
        risk_score += (50 - oil) * 2
        reasons.append("افت فشار روغن هیدرولیک و موتور")

    risk_score = max(0.0, min(100.0, round(risk_score, 2)))

    if risk_score >= 75:
        risk_level = RiskLevel.HIGH
        recommendation = "توقف عملیات و بازرسی فنی فوری موتور و سیستم روانکاری الزامی است"
    elif risk_score >= 45:
        risk_level = RiskLevel.MEDIUM
        recommendation = "بررسی سنسورها و سیستم خنک‌کننده در سرویس دوره‌ای شیفت آینده توصیه می‌شود"
    else:
        risk_level = RiskLevel.LOW
        recommendation = "پارامترها پایدار هستند؛ ادامه پایش مستمر از طریق IIoT کافی است"

    reason_text = "، ".join(reasons) if reasons else "روند سنسورها و تله‌متری در وضعیت پایدار و نرمال است"

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "reason": reason_text,
        "recommendation": recommendation,
    }

