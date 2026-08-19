from fastapi.testclient import TestClient

from app.main import app


def test_dispatch_recommend_and_apply() -> None:
    with TestClient(app) as client:
        rec = client.post("/api/v1/dispatch/recommend", json={"truck_id": "T-27"})
        assert rec.status_code == 200
        recommended = rec.json()["recommended_shovel"]

        apply_resp = client.post(
            "/api/v1/dispatch/apply",
            json={"truck_id": "T-27", "shovel_id": recommended},
        )

    assert apply_resp.status_code == 200
    mission = apply_resp.json()
    assert mission["truck_id"] == "T-27"
    assert mission["shovel_id"] == recommended
