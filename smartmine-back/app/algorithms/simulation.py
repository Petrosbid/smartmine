def run_simulation(
    truck_count: int,
    shovel_count: int,
    dump_points: int,
    duration_hours: int,
) -> dict[str, float]:
    resource_ratio = truck_count / max(1, shovel_count)
    congestion_factor = max(0.8, min(2.2, resource_ratio / 6))
    dump_factor = max(0.7, min(1.2, dump_points / 3))

    base_cycles = truck_count * duration_hours * 1.7 / congestion_factor
    average_payload = 31.5
    production = round(base_cycles * average_payload * dump_factor, 2)

    average_queue_time = round(max(2.0, 4.5 * congestion_factor / dump_factor), 2)
    average_cycle_time = round(max(18.0, 24 + congestion_factor * 5 - shovel_count * 0.6), 2)
    idle_time = round(max(8.0, duration_hours * 14 * congestion_factor / dump_factor), 2)
    fuel_consumption = round(duration_hours * truck_count * (7.5 + congestion_factor * 0.8), 2)

    efficiency = round(max(40.0, min(98.0, 92 - (average_queue_time * 1.4) - (average_cycle_time - 24))), 2)
    truck_utilization = round(max(45.0, min(96.0, 88 - (idle_time / max(1.0, duration_hours * 2)))), 2)

    return {
        "production": production,
        "average_queue_time": average_queue_time,
        "average_cycle_time": average_cycle_time,
        "idle_time": idle_time,
        "fuel_consumption": fuel_consumption,
        "efficiency": efficiency,
        "truck_utilization": truck_utilization,
    }
