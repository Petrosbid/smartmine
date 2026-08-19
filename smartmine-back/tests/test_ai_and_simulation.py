from fastapi.testclient import TestClient

from app.main import app


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

        sim = client.post(
            "/api/v1/simulation/run",
            json={"truck_count": 30, "shovel_count": 5, "dump_points": 3, "duration_hours": 4},
        )

    assert sim.status_code == 200
    sim_body = sim.json()
    assert sim_body["production"] > 0
    assert "note" in sim_body
