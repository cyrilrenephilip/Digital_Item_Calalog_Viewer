# Task Submission Workflow Backend

Primary backend: Node.js + Express. Microservice: FastAPI (Python).

## Run Services

- Primary service:
  - `npm install`
  - `npm start` → `http://localhost:3001`
- Microservice:
  - `cd ../notify-microservice`
  - `python -m pip install -r requirements.txt`
  - `python -m uvicorn main:app --reload --port 8002`

## Endpoints (Primary)

- `GET /tasks` → list tasks
- `GET /tasks/{id}` → get task
- `POST /tasks` → create task `{ title, description, max_submissions }`
- `POST /tasks/{id}/submit` → submit payload; returns `{ status, submissions_count }`

## Concurrency Protection

`POST /tasks/{id}/submit` guarded with an in-memory lock using `async-lock`. It serializes updates to a given task's submission counter to enforce `max_submissions` even under concurrent requests.

## Microservice Call

On successful submission, the primary backend `POST`s to microservice `http://localhost:8002/notify` with `{ task_id, data }`.

## Test Frontend

Simple HTML test page is served from `http://localhost:3001/` (static `public/index.html`). It can load tasks, view details, and submit.
