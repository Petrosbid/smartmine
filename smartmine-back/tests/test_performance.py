from fastapi.testclient import TestClient

from app.main import app


def test_performance_analyze() -> None:
    payload = {
        "driver_id": "D-102",
        "truck_id": "T-27",
        "shift": "morning",
        "cycle_count": 12,
        "payload_ton": 384,
        "average_cycle_time": 31.5,
        "waiting_time": 42,
        "idle_time": 28,
        "fuel_consumption": 365,
        "speeding_events": 1,
        "harsh_braking_events": 2,
        "safety_events": 0,
        "notes": "test",
    }
    with TestClient(app) as client:
        response = client.post("/api/v1/performance/analyze", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert 0 <= body["overall_score"] <= 100
    assert body["production_score"] >= 0
    assert isinstance(body["improvement_factors"], list)
