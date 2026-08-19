from app.schemas.performance import PerformanceAnalyzeRequest


def _clamp(score: float) -> float:
    return max(0.0, min(100.0, round(score, 2)))


def calculate_performance_score(payload: PerformanceAnalyzeRequest) -> dict[str, float | list[str]]:
    production_target = 380.0
    cycle_target = 12.0
    avg_cycle_target = 30.0
    wait_target = 40.0
    idle_target = 25.0
    fuel_target = 360.0

    production_score = _clamp(
        (payload.payload_ton / production_target) * 70 + (payload.cycle_count / cycle_target) * 30
    )

    efficiency_penalty = (
        max(0.0, payload.average_cycle_time - avg_cycle_target) * 1.2
        + max(0.0, payload.waiting_time - wait_target) * 0.5
        + max(0.0, payload.idle_time - idle_target) * 0.8
    )
    efficiency_score = _clamp(100 - efficiency_penalty)

    safety_penalty = (
        payload.speeding_events * 6.0
        + payload.harsh_braking_events * 4.0
        + payload.safety_events * 8.0
    )
    safety_score = _clamp(100 - safety_penalty)

    fuel_penalty = max(0.0, payload.fuel_consumption - fuel_target) * 0.35
    fuel_score = _clamp(100 - fuel_penalty)

    overall_score = _clamp(
        production_score * 0.30 + efficiency_score * 0.25 + safety_score * 0.30 + fuel_score * 0.15
    )

    positive_factors: list[str] = []
    improvement_factors: list[str] = []

    if production_score >= 85:
        positive_factors.append("Strong production output")
    else:
        improvement_factors.append("Increase cycle count and payload consistency")

    if efficiency_score >= 85:
        positive_factors.append("Efficient cycle execution")
    else:
        improvement_factors.append("Reduce waiting and idle time")

    if safety_score >= 90:
        positive_factors.append("Safe driving behavior")
    else:
        improvement_factors.append("Lower speeding, harsh braking, and safety incidents")

    if fuel_score >= 85:
        positive_factors.append("Good fuel efficiency")
    else:
        improvement_factors.append("Improve fuel efficiency through smoother driving")

    return {
        "production_score": production_score,
        "efficiency_score": efficiency_score,
        "safety_score": safety_score,
        "fuel_score": fuel_score,
        "overall_score": overall_score,
        "positive_factors": positive_factors,
        "improvement_factors": improvement_factors,
    }
