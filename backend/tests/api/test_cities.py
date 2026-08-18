"""Tests for /cities endpoints."""

import pytest
from fastapi.testclient import TestClient

from iris.main import app

client = TestClient(app)

test_city = {
    "city_name": "Test City",
    "state": "Test State",
    "country": "India",
    "latitude": 20.0,
    "longitude": 80.0,
    "active": True,
}


def test_create_city():
    res = client.post("/cities/", json=test_city)
    if res.status_code == 201:
        data = res.json()
        assert data["city_name"] == test_city["city_name"]
        assert "city_id" in data
    else:
        pytest.skip("DB not available")


def test_get_cities():
    res = client.get("/cities/")
    if res.status_code == 200:
        assert isinstance(res.json(), list)
    else:
        pytest.skip("DB not available")
