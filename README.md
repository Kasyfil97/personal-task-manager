# Personal Task Manager

A fullstack task manager with **Focus Mode** — shows only the top 3 tasks and forces you to complete or defer each before the next batch appears.

## Stack

- **Backend:** FastAPI + SQLite (SQLAlchemy)
- **Frontend:** React (Vite) + Tailwind CSS + dnd-kit

## Features

- Create, edit, delete tasks (title, due date, priority, notes)
- Manual drag-and-drop reordering
- **Focus Mode:** top 3 incomplete tasks by position; complete or defer to advance
- Defer pushes a task to the end of the queue
- Collapsible completed tasks section
- Priority color badges (high/med/low) + overdue date highlighting

---

## Development

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# API at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

### Backend tests

```bash
cd backend
source .venv/bin/activate
pytest -v
```

### E2E tests (requires both servers running)

```bash
cd frontend
npx playwright test
```

---

## Docker (Production)

```bash
git clone <repo-url> personal-task-manager
cd personal-task-manager
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8000

SQLite data is persisted in `./data/tasks.db` via a bind mount.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | /tasks | List incomplete tasks (ordered by position) |
| GET | /tasks/completed | List completed tasks |
| POST | /tasks | Create task |
| PATCH | /tasks/{id} | Update task fields |
| PATCH | /tasks/{id}/complete | Mark complete |
| PATCH | /tasks/{id}/defer | Push to end of queue |
| PATCH | /tasks/reorder | Bulk reorder (drag-and-drop) |
| DELETE | /tasks/{id} | Delete task |
