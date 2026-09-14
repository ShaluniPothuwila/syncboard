# SyncBoard API — Contract

**Local base URL:** `http://localhost:4000/api`
**Production base URL:** `https://syncboard-pzi2.onrender.com/api`

All request/response bodies are JSON. Protected routes (marked 🔒) require an `Authorization: Bearer <token>` header.

---

## Health

`GET /health`

Simple uptime/status check, no authentication required. Used by hosting platforms (Render/Railway) and Docker's HEALTHCHECK to confirm the service is running.

**Response `200`**
```json
{ "status": "ok" }
```

---

## Auth

Both `/auth/register` and `/auth/login` are rate-limited to prevent abuse. Excessive requests return `429 Too Many Requests`.

### `POST /auth/register`

Create a new account.

**Body**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "at least 8 chars"
}
```

**Response `201`**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "u2",
    "name": "Alice",
    "email": "alice@example.com"
  }
}
```

**Errors:** `400` missing/invalid fields or password under 8 characters · `409` email already registered

---

### `POST /auth/login`

**Body**
```json
{
  "email": "demo@syncboard.dev",
  "password": "password123"
}
```

**Response `200`**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "u1",
    "name": "Demo User",
    "email": "demo@syncboard.dev"
  }
}
```

**Errors:** `400` missing email or password · `401` invalid email or password

---

### `GET /auth/me` 🔒

Returns the currently authenticated user.

**Response `200`**
```json
{
  "user": {
    "id": "u1",
    "name": "Demo User",
    "email": "demo@syncboard.dev"
  }
}
```

---

## Board & Tasks

All routes below require `Authorization: Bearer <token>` 🔒.

### `GET /board`

Returns the board with columns and their tasks nested inside.

**Response `200`**
```json
{
  "id": "board-1",
  "boardName": "Sync Board",
  "subtitle": "Project Task Management",
  "columns": [
    {
      "id": "col-1",
      "title": "To Do",
      "bgColor": "bg-blue-50/70 border-blue-100",
      "badgeColor": "bg-blue-100 text-blue-700",
      "tasks": [
        {
          "id": "t1",
          "columnId": "col-1",
          "title": "Design Login Page",
          "description": "...",
          "category": "UI/UX",
          "priority": "High",
          "dueDate": "2026-08-20",
          "assignee": "Alice Johnson",
          "completed": false,
          "version": 1
        }
      ]
    }
  ]
}
```

---

### `POST /tasks`

Create a task in a column.

**Body**
```json
{
  "columnId": "col-1",
  "title": "Write tests",
  "description": "optional",
  "category": "Testing",
  "priority": "Medium",
  "dueDate": "2026-09-01",
  "assignee": "Diana White"
}
```

`columnId` and `title` are required; everything else is optional.

**Response `201`:** the created task object (same shape as above)
**Errors:** `400` missing columnId or title

> **Note:** `columnId` is not currently validated against the real column list — sending an unrecognized `columnId` will still create the task, and it simply won't appear in any rendered column.

---

### `PATCH /tasks/:id`

Edit a task. Send the fields you want to change, plus the `version` you last read (optimistic concurrency check).

**Body**
```json
{
  "title": "New title",
  "priority": "High",
  "version": 1
}
```

**Response `200`:** the updated task, with `version` incremented by 1

**Errors:**
- `404` task not found
- `409 CONFLICT` — someone else updated this task since you loaded it. Response includes the current server-side copy under `"current"` so the client can show a diff or ask the user to retry:
```json
{
  "error": "Task was modified by someone else since you loaded it",
  "code": "CONFLICT",
  "current": { "...": "..." }
}
```

---

### `PATCH /tasks/:id/move`

Move a task to a (possibly different) column — used for drag-and-drop.

**Body**
```json
{
  "columnId": "col-2",
  "index": 0
}
```

**Response `200`:** the updated task
**Errors:** `404` task not found · `400` missing columnId

> **Note:** `index` is accepted but not currently persisted — moving a task between columns is saved, but reordering tasks within the same column is visual only and resets to creation order on refresh.

---

### `DELETE /tasks/:id`

**Response `204`:** empty body
**Errors:** `404` task not found

---

### `GET /stats` 🔒

Returns aggregated task statistics for the board (used by the Project Overview / sidebar).

**Response `200`**
```json
{
  "total": 12,
  "completed": 5,
  "percentComplete": 42,
  "byColumn": {
    "col-1": 4,
    "col-2": 3,
    "col-3": 5
  },
  "byPriority": {
    "High": 3,
    "Medium": 6,
    "Low": 3
  }
}
```

- `percentComplete` is `Math.round(completed / total * 100)`, and is `0` when there are no tasks (avoids divide-by-zero).
- `byColumn` and `byPriority` are dynamic objects keyed by whatever `columnId`/`priority` values actually exist in the data — an empty column or unused priority simply won't appear as a key.

---

## Real-time updates

Every task mutation (`POST /tasks`, `PATCH /tasks/:id`, `PATCH /tasks/:id/move`, `DELETE /tasks/:id`) also broadcasts the change over Socket.IO to all connected clients, so other logged-in users see updates instantly without refreshing.

---

## Error shape

Every error response follows the same shape:
```json
{ "error": "human-readable message" }
```

Some also include `code` (e.g. `"CONFLICT"`) or `current` (the server's current version of a resource), as noted above.

---

## Implementation Notes

- Data lives in MongoDB/Mongoose (`server/src/models/Task.js`), backed by a real Atlas cluster rather than an in-memory store, so it survives server restarts.
- The `version` field on tasks is used for optimistic concurrency; `409 CONFLICT` responses are surfaced in the UI via `ConflictModal.jsx` and were tested with simulated simultaneous edits across two browser windows.
- `GET /stats` powers the sidebar's Project Overview panel, wired up in `App.jsx`.
- Offline support (PouchDB local cache + action queue) is implemented in `src/offline/localDB.js` and `src/offline/useOnlineStatus.js`. Queued actions sync automatically on reconnect; verified via DevTools network throttling.
