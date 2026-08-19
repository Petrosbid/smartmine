from fastapi.testclient import TestClient

from app.main import app


def test_login_success() -> None:
    payload = {
        "driver_id": "D-102",
        "truck_id": "T-27",
        "shift": "morning",
    }
    with TestClient(app) as client:
        response = client.post("/api/v1/auth/login", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["driver"]["id"] == "D-102"
    assert body["truck"]["id"] == "T-27"
