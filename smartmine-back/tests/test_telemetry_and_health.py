from fastapi.testclient import TestClient

from app.main import app


def test_telemetry_and_health() -> None:
    with TestClient(app) as client:
        telemetry = client.get("/api/v1/trucks/T-27/telemetry?limit=5")
        assert telemetry.status_code == 200
        assert isinstance(telemetry.json(), list)

        simulate = client.post("/api/v1/telemetry/simulate", json={"truck_id": "T-27"})
        assert simulate.status_code == 200

        health = client.get("/api/v1/trucks/T-27/health")

    assert health.status_code == 200
    body = health.json()
    assert "overall_score" in body
    assert "predictive_maintenance" in body
