# SyncBoard

A Kanban-style task management web app — React frontend, Express/Node.js REST API backend, JWT authentication, MongoDB persistence.

Plan tasks across **To Do**, **In Progress**, and **Done** columns, drag and drop them between stages, and manage everything through a real authenticated API backed by a real database — including offline support and conflict resolution.

## Features

- **JWT authentication** — register, log in, and stay logged in across page refreshes
- **Drag-and-drop task board** — reorder tasks within a column or move them across columns
- **Add / edit / delete tasks** — title, description, category, priority, due date, assignee
- **Live search** — filter tasks across all columns as you type
- **Optimistic concurrency control with conflict resolution UI** — if someone else edited a task first, a modal lets you overwrite with your version, discard yours and keep the server's, or cancel
- **Persistent storage** — tasks and users are stored in MongoDB (Atlas), surviving server restarts
- **Live project stats** — sidebar pulls real aggregated numbers (total/completed/percent/by-column/by-priority) from a `GET /api/stats` MongoDB aggregation, no more hardcoded values
- **Offline support** — the board keeps working without a connection: it renders from a local PouchDB cache, queues any actions (add/edit/move/delete) made while offline, and automatically syncs them once the connection comes back
- **Project sidebar** — overall progress, team member status, upcoming deadlines

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS 4, @hello-pangea/dnd (drag-and-drop), PouchDB (`pouchdb-browser`, `pouchdb-find`) for offline caching and sync
**Backend:** Node.js, Express 5, JWT (`jsonwebtoken`), bcrypt (`bcryptjs`)
**Database:** MongoDB Atlas via Mongoose — see `server/docs/API.md` for schema details and the `/stats` aggregation pipeline

## Project Structure
collabboard/
├── client/ # React frontend
│ ├── src/
│ │ ├── main.jsx
│ │ ├── App.jsx
│ │ ├── api/ # fetch wrappers for the backend (auth, board/tasks)
│ │ ├── context/AuthContext.jsx
│ │ ├── components/
│ │ ├── realtime/socket.js # Socket.IO client
│ │ ├── offline/ # localDB.js (PouchDB cache/queue), useOnlineStatus.js
│ │ └── mockData.js # still used for sidebar team info, not tasks
│ ├── tests/ # Vitest + React Testing Library
│ ├── Dockerfile # multi-stage build -> nginx
│ ├── nginx.conf
│ └── package.json
├── server/ # Express backend
│ ├── src/
│ │ ├── index.js # entry point
│ │ ├── app.js # Express app setup
│ │ ├── config/ # env var loading, db.js (MongoDB connection)
│ │ ├── models/
│ │ │ ├── schemas/ # userSchema.js, taskSchema.js (Mongoose schemas)
│ │ │ ├── User.js
│ │ │ └── Task.js
│ │ ├── controllers/ # authController.js, taskController.js
│ │ ├── routes/
│ │ ├── realtime/io.js # Socket.IO server
│ │ └── middleware/ # JWT auth check, error handling
│ ├── tests/ # Jest + Supertest
│ ├── docs/ # API.md (full API contract), Postman collection
│ ├── Dockerfile
│ └── package.json
├── docker-compose.yml # runs client + server together
└── .env.example # env vars docker-compose interpolates


## Getting Started

### Prerequisites
- Node.js v18 or later
- npm (comes with Node.js)
- A MongoDB Atlas cluster (free tier is fine) — you'll need its connection string

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

Create a `.env` file in the `server` folder (copy from `.env.example`):
```env
PORT=4000
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
MONGO_URI=replace-with-your-mongodb-atlas-connection-string
```

`MONGO_URI` comes from your MongoDB Atlas cluster (Atlas → Database → Connect → Drivers). Make sure your current IP is allowed under Atlas → Network Access, or add `0.0.0.0/0` to allow access from anywhere during development.

Start the API server:
```bash
npm run dev
```
You should see: `SyncBoard API listening on http://localhost:4000` followed by a MongoDB connection confirmation.

Leave this terminal running.

### 3. Set up and run the frontend

Open a **second terminal**, from the `client` folder:
```bash
cd client
npm install
npm run dev
```
This starts the Vite dev server — open the printed URL, usually `http://localhost:5173`.

### 4. Log in

Both servers need to be running at the same time for the app to work. Log in with the seeded demo account, or register a new one:

- **Email:** `demo@syncboard.dev`
- **Password:** `password123`

## Other Scripts

**Frontend** (from `client/`):
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

A Postman collection is also available at [`server/docs/SyncBoard.postman_collection.json`](./server/docs/SyncBoard.postman_collection.json) — import it into Postman to try every endpoint directly, including `GET /stats`.

## Known Limitations

- **Single shared board** — all logged-in users currently see the same board, not per-user boards.
- **Conflict detection is version-based** — edits carry a version number checked against the server; simultaneous edits to the *same* task correctly surface a conflict, but this doesn't cover every possible race condition under heavy concurrent load.

## QA Notes

- Verified register, login, and logout all work against the live API
- Verified the JWT persists across a page refresh, and clears correctly on logout
- Verified add/edit/delete task and drag-and-drop all persist to MongoDB (confirmed via `GET /api/board` reflecting changes, and via Atlas Data Explorer)
- Verified a request to a protected route without a token is correctly rejected (`401`)
- Verified conflict detection and all three resolution paths (Overwrite mine / Discard mine / Cancel) using two browser windows (one normal, one incognito) editing the same task simultaneously
- Verified offline support: board renders from cache with no connection, actions queue while offline, and auto-sync on reconnect (tested via DevTools network throttling)