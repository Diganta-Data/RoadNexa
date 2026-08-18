"""Tests for /health endpoint."""

import pytest
from fastapi.testclient import TestClient

from iris.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_returns_200(client):
    res = client.get("/health")
    assert res.status_code == 200


def test_health_status_healthy(client):
    data = client.get("/health").json()
    assert data["status"] == "healthy"


def test_health_has_version(client):
    data = client.get("/health").json()
    assert "version" in data


def test_health_has_timestamp(client):
    data = client.get("/health").json()
    assert "timestamp" in data


def test_health_has_uptime(client):
    data = client.get("/health").json()
    assert "uptime_seconds" in data
    assert data["uptime_seconds"] >= 0
