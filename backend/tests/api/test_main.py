from fastapi.testclient import TestClient
from app.api.main import app


def test_greet_message():
    client = TestClient(app)
    response = client.get("/greet")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Hello World!"
    }

def test_nonexisting_path():
    client = TestClient(app)
    response = client.get("/something")

    assert response.status_code == 404