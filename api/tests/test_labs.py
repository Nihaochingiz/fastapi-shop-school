from datetime import datetime, timezone
from pathlib import Path

import bcrypt
import jwt
import pytest
import yaml
from fastapi import FastAPI
from fastapi.testclient import TestClient
from psycopg.conninfo import conninfo_to_dict
from sqlalchemy import inspect

from learner_checks import INVALID_DISKS, assert_ping, transactional_session
from shop.lab.database import get_session, make_engine
from shop.lab.models import LabDisk
from shop.lab.security import hash_password, issue_token, verify_password
from shop.lab.settings import Settings
from shop.main import app

DISK = {"title": "Gran Turismo 4", "price_rub": 990, "stock": 3}
USER = {"username": "tolyashop", "password": "training password only"}
API_ROOT = Path(__file__).resolve().parents[1]


def test_lesson_01_describes_client_server_and_api(client):
    assert client.get("/api/lab/info").json() == {
        "client": "React", "server": "FastAPI", "api": "HTTP/JSON",
    }


def test_lesson_02_first_endpoint(client):
    response = client.get("/api/lab/ping")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_lesson_05_cache_header_and_http_method(client):
    response = client.get("/api/lab/headers")
    assert response.headers["content-type"].startswith("application/json")
    assert response.headers.get("cache-control") == "no-store"
    assert client.post("/api/lab/headers").status_code == 405


def test_lesson_07_reads_real_postgresql_database(client, database):
    data = client.get("/api/lab/db").json()
    assert data["version"].split(".")[0].isdigit()
    assert data.get("database") == conninfo_to_dict(database)["dbname"]


def test_lesson_08_orm_count_reflects_real_rows(client):
    assert client.get("/api/lab/disks/count").json() == {"count": 0}
    assert client.post("/api/lab/disks", json=DISK).status_code == 201
    assert client.get("/api/lab/disks/count").json() == {"count": 1}


def test_lesson_09_uses_dependency_override(client):
    class Probe:
        def scalar(self, statement):
            assert str(statement) == "SELECT 1"
            return 0

    original = app.dependency_overrides.copy()
    try:
        assert client.get("/api/lab/session").json() == {"ready": True}
        app.dependency_overrides[get_session] = Probe
        assert client.get("/api/lab/session").json() == {"ready": False}
    finally:
        app.dependency_overrides = original


def test_lesson_10_crud_cycle_in_postgresql(client):
    created = client.post("/api/lab/disks", json=DISK)
    assert created.status_code == 201
    disk_id = created.json()["id"]
    path = f"/api/lab/disks/{disk_id}"
    assert client.get(path).json() == created.json()
    payload = {**DISK, "title": "Gran Turismo 4 – Platinum", "stock": 1}
    updated = client.put(path, json=payload)
    assert updated.status_code == 200
    assert updated.json() == {**payload, "id": disk_id}
    assert client.get(path).json() == updated.json()
    assert client.delete(path).status_code == 204
    assert client.get(path).status_code == 404
    assert client.put(path, json=payload).status_code == 404


def test_lesson_11_alembic_index_exists_in_postgresql(client):
    indexes = inspect(app.state.lab_engine).get_indexes("lab_disks")
    assert any(index["name"] == "ix_lab_disks_title" and index["column_names"] == ["title"]
               for index in indexes)


def test_lesson_12_about_router_is_registered(client):
    response = client.get("/api/lab/about")
    assert response.status_code == 200
    assert response.json() == {"module": "shop.lab.about"}
    operation = client.get("/openapi.json").json()["paths"]["/api/lab/about"]["get"]
    assert "Учебная лаборатория" in operation["tags"]


def test_lesson_13_service_calculates_total_from_repository(client):
    disk_id = client.post("/api/lab/disks", json=DISK).json()["id"]
    assert client.get(f"/api/lab/quote/{disk_id}?quantity=3").json() == {"total_rub": 2970}
    assert client.get("/api/lab/quote/999").status_code == 404


def test_lesson_14_reads_settings_from_environment(database, monkeypatch):
    monkeypatch.setenv("SHOP_LABEL", "Полка Толи")
    with TestClient(app) as client:
        assert client.get("/api/lab/settings").json() == {"shop_label": "Полка Толи"}


def test_lesson_15_bcrypt_salt_rounds_and_verification():
    first = hash_password(USER["password"], rounds=4)
    second = hash_password(USER["password"], rounds=4)
    assert first.split("$")[2] == "04"
    assert first != second
    assert verify_password(USER["password"], first)
    assert not bcrypt.checkpw(b"wrong password", first.encode("ascii"))


def test_lesson_16_register_and_login_without_exposing_hash(client):
    created = client.post("/api/lab/register", json=USER)
    assert created.status_code == 201
    assert set(created.json()) == {"id", "username"}
    assert client.post("/api/lab/login", json=USER).status_code == 200
    wrong = {**USER, "password": "another wrong password"}
    assert client.post("/api/lab/login", json=wrong).status_code == 401
    assert client.post("/api/lab/register", json=USER).status_code == 409


def test_lesson_17_signed_jwt_uses_configured_expiration():
    settings = Settings(database_url="postgresql://unused", token_minutes=5)
    now = datetime.now(timezone.utc)
    token = issue_token(7, settings, now=now)
    claims = jwt.decode(token, settings.jwt_secret.get_secret_value(), algorithms=["HS256"])
    assert claims["sub"] == "7"
    assert claims["exp"] - claims["iat"] == 300


def test_lesson_18_bearer_challenge_and_protected_body(client):
    rejected = client.get("/api/lab/me")
    assert rejected.status_code == 401
    assert client.get("/api/lab/me", headers={"Authorization": "Bearer invalid"}).status_code == 401
    created = client.post("/api/lab/register", json=USER).json()
    token = client.post("/api/lab/login", json=USER).json()["access_token"]
    assert client.get("/api/lab/me", headers={"Authorization": f"Bearer {token}"}).json() == created
    assert rejected.headers.get("www-authenticate") == "Bearer"


def test_lesson_19_student_test_detects_broken_response():
    sample = FastAPI()

    @sample.get("/api/lab/ping")
    def healthy():
        return {"status": "ok"}

    with TestClient(sample) as client:
        assert_ping(client)

    broken = FastAPI()

    @broken.get("/api/lab/ping")
    def unhealthy():
        return {"status": "failed"}

    with TestClient(broken) as client, pytest.raises(AssertionError):
        assert_ping(client)


def test_lesson_20_inner_commit_and_rollback_leave_outer_transaction(database, client):
    engine = make_engine(database)
    original = app.dependency_overrides.copy()
    try:
        with engine.connect() as connection:
            outer = connection.begin()

            def override():
                with transactional_session(connection) as session:
                    yield session

            app.dependency_overrides[get_session] = override
            try:
                created = client.post("/api/lab/disks", json=DISK)
                assert created.status_code == 201
                disk_id = created.json()["id"]
                with transactional_session(connection) as session:
                    assert session.get(LabDisk, disk_id) is not None
                    session.add(LabDisk(**DISK))
                    session.flush()
                    session.rollback()
                    assert outer.is_active
                assert len(client.get("/api/lab/disks").json()) == 1
            finally:
                if outer.is_active:
                    outer.rollback()
                app.dependency_overrides = original
        assert client.get("/api/lab/disks").json() == []
    finally:
        engine.dispose()


@pytest.mark.parametrize(("payload", "field"), INVALID_DISKS)
def test_lesson_21_invalid_values_return_422_with_field(client, payload, field):
    response = client.post("/api/lab/disks", json=payload)
    assert response.status_code == 422
    assert ["body", field] in [error["loc"] for error in response.json()["detail"]]
    assert client.get("/api/lab/disks").json() == []


def test_lesson_21_negative_test_matrix_covers_input_contract():
    assert {field for _, field in INVALID_DISKS} >= {"title", "price_rub", "stock"}


def read_compose():
    mounted = Path("/course/compose.yaml")
    path = mounted if mounted.is_file() else API_ROOT.parent / "compose.yaml"
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def test_lesson_22_container_labels():
    labels = read_compose()["services"]["api"].get("labels", {})
    if isinstance(labels, list):
        labels = dict(label.split("=", 1) for label in labels)
    assert labels.get("org.disc-school.component") == "fastapi"


def test_lesson_23_dockerfile_exposes_port():
    lines = (API_ROOT / "Dockerfile").read_text(encoding="utf-8").splitlines()
    assert any("8000" in line.split()[1:] for line in lines if line.strip().startswith("EXPOSE "))


def test_lesson_24_compose_web_healthcheck_targets_the_api_proxy():
    web = read_compose()["services"]["web"]
    check = web.get("healthcheck", {})
    command = " ".join(check.get("test", []))
    assert "http://127.0.0.1:5173/api/health" in command
    assert check.get("timeout")
    assert check.get("retries", 0) > 0
    assert web["depends_on"]["api"]["condition"] == "service_healthy"
