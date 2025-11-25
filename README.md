# Digital Item Catalog Viewer

This React + Vite + TypeScript app connects to a FastAPI backend to list items, view item details, and submit a form tied to an item.

## Run

- Install frontend deps: `npm install`
- Start FastAPI items backend:
  - `cd ../items-backend`
  - `python -m pip install -r requirements.txt`
  - `python -m uvicorn main:app --reload --port 8001`
- Start frontend:
  - `npm run dev`
  - Open `http://localhost:5173`

## Features

- List items fetched from `GET /items`
- Search/filter on title and short description
- Item details via `GET /items/{id}`
- Submission form posts to `POST /items/{id}/submit`
- Loading indicators and error messages for all API calls

## Endpoints (Items Backend)

- `GET /items` → returns list of items
- `GET /items/{id}` → returns single item
- `POST /items/{id}/submit` → accepts `{ name, email, message }` and returns `{ status, count }`
