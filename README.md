# SyncBoard

A Kanban-style task management web app — React frontend, Express/Node.js REST API backend, JWT authentication.

Plan tasks across **To Do**, **In Progress**, and **Done** columns, drag and drop them between stages, and manage everything through a real authenticated API (no more mock data).

## Features

- **JWT authentication** — register, log in, and stay logged in across page refreshes
- **Drag-and-drop task board** — reorder tasks within a column or move them across columns
- **Add / edit / delete tasks** — title, description, category, priority, due date, assignee
- **Live search** — filter tasks across all columns as you type
- **Optimistic concurrency control** — the API rejects a task edit if someone else changed it first, rather than silently overwriting their work
- **Project sidebar** — overall progress, team member status, upcoming deadlines

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS 4, @hello-pangea/dnd (drag-and-drop)
**Backend:** Node.js, Express 5, JWT (`jsonwebtoken`), bcrypt (`bcryptjs`)
**Data:** in-memory store for this milestone (see `server/docs/API.md` for details on why, and what changes next milestone)

## Project Structure
collabboard/
├── src/ # React frontend
│ ├── main.jsx
│ ├── App.jsx
│ ├── api/ # fetch wrappers for the backend (auth, board/tasks)
│ ├── context/AuthContext.jsx
│ ├── components/
│ └── mockData.js # still used for sidebar team/stats, not tasks
├── server/ # Express backend
│ ├── src/
│ │ ├── index.js # entry point
│ │ ├── app.js # Express app setup
│ │ ├── config/ # env var loading
│ │ ├── data/store.js # in-memory "database"
│ │ ├── models/ # User.js, Task.js
│ │ ├── controllers/ # authController.js, taskController.js
│ │ ├── routes/
│ │ └── middleware/ # JWT auth check, error handling
│ ├── docs/API.md # full API contract
│ └── package.json
└── package.json # frontend


## Getting Started

### Prerequisites
- Node.js v18 or later
- npm (comes with Node.js)

### 1. Clone the repo
```bash
git clone https://github.com/ShaluniPothuwila/syncboard.git
cd collabboard
```

### 2. Set up and run the backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder (copy from the example below):
```env
PORT=4000
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Start the API server:
```bash
npm run dev
```
You should see: `SyncBoard API listening on http://localhost:4000`

Leave this terminal running.

### 3. Set up and run the frontend

Open a **second terminal**, from the project root:
```bash
npm install
npm run dev
```
This starts the Vite dev server — open the printed URL, usually `http://localhost:5173`.

### 4. Log in

Both servers need to be running at the same time for the app to work. Log in with the seeded demo account, or register a new one:

- **Email:** `demo@syncboard.dev`
- **Password:** `password123`

## Other Scripts

**Frontend** (from project root):
```bash
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint       # run Oxlint
```

**Backend** (from `server/`):
```bash
npm start          # run without file-watching (production-style)
```

## API Documentation

Full endpoint reference (request/response bodies, error shapes) is in [`server/docs/API.md`](./server/docs/API.md).

A Postman collection is also available at [`server/docs/SyncBoard.postman_collection.json`](./server/docs/SyncBoard.postman_collection.json) — import it into Postman to try every endpoint directly.

## Known Limitations (by design, for this milestone)

- **Data is in-memory** — restarting the backend server resets tasks/users back to the seeded demo data. Persistent storage (MongoDB) is planned for the next milestone.
- **Single shared board** — all logged-in users currently see the same board, not per-user boards.

## QA Notes

- Verified register, login, and logout all work against the live API
- Verified the JWT persists across a page refresh, and clears correctly on logout
- Verified add/edit/delete task and drag-and-drop all persist to the backend (confirmed via `GET /api/board` reflecting changes)
- Verified a request to a protected route without a token is correctly rejected (`401`)