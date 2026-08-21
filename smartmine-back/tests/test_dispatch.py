from fastapi.testclient import TestClient

from app.main import app


def test_dispatch_recommend_and_apply() -> None:
    with TestClient(app) as client:
        rec = client.post("/api/v1/dispatch/recommend", json={"truck_id": "T-21"})
        assert rec.status_code == 200
        recommended = rec.json()["recommended_shovel"]

        apply_resp = client.post(
            "/api/v1/dispatch/apply",
            json={"truck_id": "T-21", "shovel_id": recommended},
        )

    assert apply_resp.status_code == 200
    mission = apply_resp.json()
    assert mission["truck_id"] == "T-21"
    assert mission["shovel_id"] == recommended
    assert mission["status"] == "assigned"
    assert mission["mission_id"] > 0


def test_mission_transition_valid_and_invalid() -> None:
    with TestClient(app) as client:
        rec = client.post("/api/v1/dispatch/recommend", json={"truck_id": "T-22"})
        assert rec.status_code == 200
        recommended = rec.json()["recommended_shovel"]

        apply_resp = client.post(
            "/api/v1/dispatch/apply",
            json={"truck_id": "T-22", "shovel_id": recommended},
        )
        assert apply_resp.status_code == 200
        mission_id = apply_resp.json()["mission_id"]

        transition = client.post(
            f"/api/v1/missions/{mission_id}/transition",
            json={"status": "en_route_to_shovel"},
        )
        assert transition.status_code == 200
        assert transition.json()["status"] == "en_route_to_shovel"

        invalid = client.post(
            f"/api/v1/missions/{mission_id}/transition",
            json={"status": "completed"},
        )
        assert invalid.status_code == 400
