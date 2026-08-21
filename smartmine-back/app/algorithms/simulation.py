def run_simulation(
    truck_count: int,
    shovel_count: int,
    dump_points: int,
    duration_hours: int,
) -> dict[str, float | list[dict[str, float | int | str]] | list[str]]:
    resource_ratio = truck_count / max(1, shovel_count)
    congestion_factor = max(0.8, min(2.2, resource_ratio / 6.0))
    dump_factor = max(0.7, min(1.2, dump_points / 3.0))

    base_cycles = truck_count * duration_hours * 1.7 / congestion_factor
    average_payload = 31.5
    production = round(base_cycles * average_payload * dump_factor, 2)

    average_queue_time = round(max(2.0, 4.5 * congestion_factor / dump_factor), 2)
    average_cycle_time = round(max(18.0, 24.0 + congestion_factor * 5.0 - shovel_count * 0.6), 2)
    idle_time = round(max(8.0, duration_hours * 14.0 * congestion_factor / dump_factor), 2)
    fuel_consumption = round(duration_hours * truck_count * (7.5 + congestion_factor * 0.8), 2)

    efficiency = round(max(40.0, min(98.0, 92.0 - (average_queue_time * 1.4) - (average_cycle_time - 24.0))), 2)
    truck_utilization = round(max(45.0, min(96.0, 88.0 - (idle_time / max(1.0, duration_hours * 2.0)))), 2)

    # Step-by-step progress & event log generator
    steps: list[dict[str, float | int | str]] = []
    event_logs: list[str] = []

    total_steps = max(1, duration_hours)
    step_duration = duration_hours / total_steps

    step_messages = [
        "شروع شیفت: استقرار ناوگان ترابری در موقعیت‌های بارگیری و فعال‌سازی سنسورهای IIoT",
        "ساعت اول: جریان روان باربری و تخلیه بدون وقفه در سنگ‌شکن مرکزی",
        "نیمه شیفت: پایش گلوگاه‌های ترافیکی شاول‌ها و ارسال دستورات دیسپچ پویا",
        "ساعت میانی: افزایش حجم استخراج سنگ و تثبیت سرعت پایدار در رمپ‌ها",
        "اوج تولید: تکمیل موفق چرخه‌های باربری با حداقل زمان انتظار در صف",
        "پایش نهایی: ارزیابی بهره‌وری OEE و ثبت آمارهای تولید شیفت معدن",
    ]

    for step_i in range(1, total_steps + 1):
        ratio = step_i / total_steps
        current_hour = round(step_i * step_duration, 1)
        cum_prod = round(production * ratio, 1)
        cum_cycles = int(base_cycles * ratio)
        cum_fuel = round(fuel_consumption * ratio, 1)
        q_time = round(max(1.8, average_queue_time * (0.8 + 0.4 * (step_i % 3))), 1)

        msg_idx = min(len(step_messages) - 1, int(ratio * (len(step_messages) - 1)))
        step_msg = f"ساعت {current_hour}: {step_messages[msg_idx]} (تولید تجمعی: {cum_prod:,.0f} تن)"

        steps.append({
            "step_hour": current_hour,
            "produced_ton": cum_prod,
            "cycle_count": cum_cycles,
            "queue_time": q_time,
            "fuel_liters": cum_fuel,
            "event_message": step_msg,
        })
        event_logs.append(step_msg)

    return {
        "production": production,
        "average_queue_time": average_queue_time,
        "average_cycle_time": average_cycle_time,
        "idle_time": idle_time,
        "fuel_consumption": fuel_consumption,
        "efficiency": efficiency,
        "truck_utilization": truck_utilization,
        "steps": steps,
        "event_logs": event_logs,
    }

