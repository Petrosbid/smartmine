from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.core.enums import ShiftType
from app.models.driver import Driver
from app.models.performance import PerformanceRecord
from app.models.truck import Truck

from app.main import app


from tests.conftest import TestSessionLocal


def test_ai_and_simulation() -> None:
    with TestClient(app) as client:
        ai_resp = client.post(
            "/api/v1/ai/chat",
            json={
                "message": "وضعیت کامیون من چگونه است؟",
                "driver_id": "D-102",
                "truck_id": "T-27",
            },
        )
        assert ai_resp.status_code == 200
        assert "message" in ai_resp.json()
        assert len(ai_resp.json()["message"]) > 20

        sim = client.post(
            "/api/v1/simulation/run",
            json={"truck_count": 30, "shovel_count": 5, "dump_points": 3, "duration_hours": 4},
        )

    assert sim.status_code == 200
    sim_body = sim.json()
    assert sim_body["production"] > 0
    assert "note" in sim_body


def test_ai_context_uses_requested_driver_performance() -> None:
    with TestSessionLocal() as db:
        driver_a = db.query(Driver).filter(Driver.driver_code == "D-101").one()
        driver_b = db.query(Driver).filter(Driver.driver_code == "D-102").one()
        truck_b = db.query(Truck).filter(Truck.truck_code == "T-27").one()
        now = datetime.now(timezone.utc)

        db.add(
            PerformanceRecord(
                driver_id=driver_a.id,
                truck_id=truck_b.id,
                shift=ShiftType.MORNING,
                cycle_count=9,
                payload_ton=300,
                average_cycle_time=38,
                waiting_time=30,
                idle_time=20,
                fuel_consumption=330,
                speeding_events=0,
                harsh_braking_events=0,
                safety_events=0,
                notes="driver_a_perf",
                overall_score=99,
                production_score=95,
                efficiency_score=94,
                safety_score=93,
                fuel_score=92,
                created_at=now,
                updated_at=now,
            )
        )
        db.add(
            PerformanceRecord(
                driver_id=driver_b.id,
                truck_id=truck_b.id,
                shift=ShiftType.MORNING,
                cycle_count=8,
                payload_ton=280,
                average_cycle_time=39,
                waiting_time=32,
                idle_time=22,
                fuel_consumption=340,
                speeding_events=0,
                harsh_braking_events=0,
                safety_events=0,
                notes="driver_b_perf",
                overall_score=52,
                production_score=50,
                efficiency_score=51,
                safety_score=53,
                fuel_score=54,
                created_at=now,
                updated_at=now,
            )
        )
        db.commit()

    with TestClient(app) as client:
        ai_resp = client.post(
            "/api/v1/ai/chat",
            json={
                "message": "امتیاز عملکرد من چقدر است؟",
                "driver_id": "D-102",
                "truck_id": "T-27",
            },
        )
    assert ai_resp.status_code == 200
    context = ai_resp.json()["context"]
    assert context["driver_id"] == "D-102"
    assert context["performance_score"] == 52


def test_ai_specialized_domain_topics() -> None:
    with TestClient(app) as client:
        # Test Shovel Queue inquiry
        shovel_resp = client.post(
            "/api/v1/ai/chat",
            json={
                "message": "کدام شاول صف کمتری دارد و برای بارگیری مناسب‌تر است؟",
                "driver_id": "D-102",
                "truck_id": "T-27",
            },
        )
        assert shovel_resp.status_code == 200
        msg = shovel_resp.json()["message"]
        assert "شاول" in msg

        # Test Fuel / Engine heat inquiry
        fuel_resp = client.post(
            "/api/v1/ai/chat",
            json={
                "message": "چگونه مصرف سوخت و دمای موتور را در شیب‌ها کنترل کنم؟",
                "driver_id": "D-102",
                "truck_id": "T-27",
            },
        )
        assert fuel_resp.status_code == 200
        assert "سوخت" in fuel_resp.json()["message"] or "موتور" in fuel_resp.json()["message"]


def test_performance_ai_analysis_generation() -> None:
    payload = {
        "driver_id": "D-102",
        "truck_id": "T-27",
        "shift": "morning",
        "cycle_count": 14,
        "payload_ton": 450,
        "average_cycle_time": 29.5,
        "waiting_time": 25,
        "idle_time": 18,
        "fuel_consumption": 310,
        "speeding_events": 0,
        "harsh_braking_events": 1,
        "safety_events": 0,
        "notes": "Shift ended cleanly",
    }
    with TestClient(app) as client:
        response = client.post("/api/v1/performance/analyze", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert "ai_analysis" in body
    assert len(body["ai_analysis"]) > 50
    assert "تحلیل" in body["ai_analysis"] or "امتیاز" in body["ai_analysis"]

