from math import sqrt


def recommend_dispatch(
    truck_position: tuple[float, float],
    truck_health: float,
    shovels: list[dict[str, float | int | str]],
) -> tuple[dict[str, float | str], dict[str, float]]:
    best: dict[str, float | str] | None = None
    best_score = -1.0
    best_breakdown: dict[str, float] = {}

    tx, ty = truck_position

    for shovel in shovels:
        queue = float(shovel["queue"])
        sx = float(shovel["latitude"])
        sy = float(shovel["longitude"])
        status = str(shovel["status"])

        distance = sqrt((tx - sx) ** 2 + (ty - sy) ** 2) * 111
        travel_time = distance / 24 * 60

        queue_component = max(0.0, 100 - queue * 12)
        distance_component = max(0.0, 100 - distance * 8)
        travel_component = max(0.0, 100 - travel_time * 0.9)
        availability_component = 100.0 if status == "active" else 20.0
        health_component = truck_health

        score = (
            queue_component * 0.30
            + distance_component * 0.20
            + travel_component * 0.20
            + availability_component * 0.15
            + health_component * 0.15
        )

        if score > best_score:
            best_score = score
            best = {
                "shovel_id": str(shovel["id"]),
                "estimated_cycle_time": round(24 + queue * 1.8 + travel_time * 0.35, 2),
                "estimated_improvement": round(max(0.0, 18 - queue * 1.2), 2),
                "reason": f"Low queue ({int(queue)}) and shorter travel distance ({distance:.2f} km).",
            }
            best_breakdown = {
                "queue_weight": round(queue_component, 2),
                "distance_weight": round(distance_component, 2),
                "travel_time_weight": round(travel_component, 2),
                "availability_weight": round(availability_component, 2),
                "health_weight": round(health_component, 2),
            }

    if best is None:
        raise ValueError("No shovel candidates available")

    return best, best_breakdown
