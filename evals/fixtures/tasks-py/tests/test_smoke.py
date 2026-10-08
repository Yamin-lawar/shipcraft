from fastapi.testclient import TestClient

from app.digest import run_digest
from app.main import create_app


def client():
    app = create_app()
    return TestClient(app), app.state.db


def login(c, email):
    return {"authorization": "Bearer " + c.post("/login", json={"email": email, "password": "password1"}).json()["token"]}


def test_login_list_projects_and_create_task():
    c, _ = client()
    h = login(c, "alice@example.com")
    assert len(c.get("/projects", headers=h).json()) == 1
    assert c.post("/projects/1/tasks", headers=h, json={"title": "Plan sprint"}).status_code == 201
    assert len(c.get("/projects/1/tasks", headers=h).json()) == 2


def test_non_member_cannot_list_or_create_tasks():
    c, _ = client()
    h = login(c, "bob@example.com")
    assert c.get("/projects/1/tasks", headers=h).status_code == 404
    assert c.post("/projects/1/tasks", headers=h, json={"title": "x"}).status_code == 404


def test_invites_validate_email():
    c, _ = client()
    h = login(c, "alice@example.com")
    assert c.post("/projects/1/invites", headers=h, json={"email": "nope"}).status_code == 400
    assert c.post("/projects/1/invites", headers=h, json={"email": "new@example.com"}).status_code == 201


def test_csv_import_creates_tasks():
    c, _ = client()
    h = login(c, "alice@example.com")
    out = c.post("/projects/1/import", headers=h, content="title,due\nA,2026-10-20\nB,2026-10-21")
    assert out.json()["imported"] == 2


def test_digest_records_a_run():
    _, db = client()
    assert run_digest(db) == 2
    assert db.execute("SELECT COUNT(*) FROM digest_runs").fetchone()[0] == 1
