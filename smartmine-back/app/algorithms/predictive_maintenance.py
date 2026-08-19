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
        reasons.append("High engine temperature trend")

    if vib > 0.40:
        risk_score += (vib - 0.40) * 180
        reasons.append("Increasing vibration trend")

    if oil < 50:
        risk_score += (50 - oil) * 2
        reasons.append("Low oil pressure")

    risk_score = max(0.0, min(100.0, round(risk_score, 2)))

    if risk_score >= 75:
        risk_level = RiskLevel.HIGH
        recommendation = "Immediate maintenance inspection is recommended"
    elif risk_score >= 45:
        risk_level = RiskLevel.MEDIUM
        recommendation = "Inspect in the next scheduled maintenance window"
    else:
        risk_level = RiskLevel.LOW
        recommendation = "Continue monitoring with routine checks"

    reason_text = ", ".join(reasons) if reasons else "Telemetry trend is stable"

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "reason": reason_text,
        "recommendation": recommendation,
    }
