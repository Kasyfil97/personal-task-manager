import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

# StaticPool ensures all connections share the same in-memory DB
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def create(title, priority="med", **kwargs):
    return client.post("/tasks", json={"title": title, "priority": priority, **kwargs})


# --- CRUD ---

def test_create_task():
    res = create("Buy groceries")
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Buy groceries"
    assert data["priority"] == "med"
    assert data["completed"] is False
    assert data["position"] == 1


def test_create_multiple_tasks_position():
    create("Task A")
    create("Task B")
    create("Task C")
    res = client.get("/tasks")
    tasks = res.json()
    assert [t["title"] for t in tasks] == ["Task A", "Task B", "Task C"]
    assert [t["position"] for t in tasks] == [1, 2, 3]


def test_list_tasks_excludes_completed():
    r1 = create("Active")
    r2 = create("To complete")
    client.patch(f"/tasks/{r2.json()['id']}/complete")
    res = client.get("/tasks")
    titles = [t["title"] for t in res.json()]
    assert "Active" in titles
    assert "To complete" not in titles


def test_get_completed():
    r = create("Done task")
    client.patch(f"/tasks/{r.json()['id']}/complete")
    res = client.get("/tasks/completed")
    assert len(res.json()) == 1
    assert res.json()[0]["completed"] is True


def test_update_task():
    r = create("Old title")
    task_id = r.json()["id"]
    res = client.patch(f"/tasks/{task_id}", json={"title": "New title", "priority": "high"})
    assert res.status_code == 200
    assert res.json()["title"] == "New title"
    assert res.json()["priority"] == "high"


def test_update_nonexistent_task():
    res = client.patch("/tasks/9999", json={"title": "Ghost"})
    assert res.status_code == 404


def test_delete_task():
    r = create("Temp task")
    task_id = r.json()["id"]
    res = client.delete(f"/tasks/{task_id}")
    assert res.status_code == 204
    # Verify gone
    tasks = client.get("/tasks").json()
    assert not any(t["id"] == task_id for t in tasks)


def test_delete_nonexistent_task():
    res = client.delete("/tasks/9999")
    assert res.status_code == 404


# --- Reorder ---

def test_reorder_tasks():
    ids = [create(f"Task {i}").json()["id"] for i in range(1, 4)]
    # Reverse order
    new_order = [{"id": ids[2], "position": 1}, {"id": ids[1], "position": 2}, {"id": ids[0], "position": 3}]
    res = client.patch("/tasks/reorder", json=new_order)
    assert res.status_code == 200
    updated = res.json()
    assert updated[0]["id"] == ids[2]
    assert updated[1]["id"] == ids[1]
    assert updated[2]["id"] == ids[0]


# --- Defer ---

def test_defer_pushes_to_end():
    ids = [create(f"Task {i}").json()["id"] for i in range(1, 5)]
    # Defer first task
    res = client.patch(f"/tasks/{ids[0]}/defer")
    assert res.status_code == 200
    tasks = client.get("/tasks").json()
    task_ids = [t["id"] for t in tasks]
    # Deferred task should now be last
    assert task_ids[-1] == ids[0]
    assert task_ids[:3] == ids[1:4]


def test_defer_nonexistent_task():
    res = client.patch("/tasks/9999/defer")
    assert res.status_code == 404


# --- Focus batch ---

def test_focus_batch_top_3():
    for i in range(1, 6):
        create(f"Task {i}")
    tasks = client.get("/tasks").json()
    # First 3 by position are the focus batch
    focus = tasks[:3]
    assert [t["title"] for t in focus] == ["Task 1", "Task 2", "Task 3"]


def test_focus_batch_fewer_than_3():
    create("Only task")
    tasks = client.get("/tasks").json()
    assert len(tasks) == 1
    assert tasks[0]["title"] == "Only task"


def test_complete_task():
    r = create("Finish me")
    task_id = r.json()["id"]
    res = client.patch(f"/tasks/{task_id}/complete")
    assert res.status_code == 200
    assert res.json()["completed"] is True
