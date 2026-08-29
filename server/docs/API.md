# SyncBoard API — Contract (Phase 2)

Base URL: `http://localhost:4000/api`

All request/response bodies are JSON. Protected routes require:


---

## Auth

### `POST /auth/register`
Create a new account.

**Body**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "at least 8 chars" }
```

**Response `201`**
```json
{ "token": "eyJ...", "user": { "id": "u2", "name": "Alice", "email": "alice@example.com" } }
```

**Errors**: `400` missing/invalid fields, `409` email already registered.

---

### `POST /auth/login`
**Body**
```json
{ "email": "demo@syncboard.dev", "password": "password123" }
```

**Response `200`**
```json
{ "token": "eyJ...", "user": { "id": "u1", "name": "Demo User", "email": "demo@syncboard.dev" } }
```

**Errors**: `401` invalid email or password.

---

### `GET /auth/me` 🔒
Returns the currently authenticated user.

**Response `200`**
```json
{ "user": { "id": "u1", "name": "Demo User", "email": "demo@syncboard.dev" } }
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

**Response `201`**: the created task object (same shape as above).

**Errors**: `400` missing columnId/title or unknown columnId.

---

### `PATCH /tasks/:id`
Edit a task. Send the fields you want to change, plus the `version` you last read (optimistic concurrency check).

**Body**
```json
{ "title": "New title", "priority": "High", "version": 1 }
```

**Response `200`**: the updated task, with `version` incremented by 1.

**Errors**:
- `404` task not found
- `409 CONFLICT` — someone else updated this task since you loaded it. Response includes the current server-side copy under `"current"` so the client can show a diff or ask the user to retry:
```json
{ "error": "Task was modified by someone else since you loaded it", "code": "CONFLICT", "current": { "...": "..." } }
```

---

### `PATCH /tasks/:id/move`
Move a task to a (possibly different) column and position — used for drag-and-drop.

**Body**
```json
{ "columnId": "col-2", "index": 0 }
```

**Response `200`**: the updated task.

**Errors**: `404` task not found, `400` unknown columnId.

---

### `DELETE /tasks/:id`
**Response `204`**: empty body.

**Errors**: `404` task not found.

---

## Error shape
Every error response follows the same shape:
```json
{ "error": "human-readable message" }
```
Some also include `code` (e.g. `"CONFLICT"`) or `current` (the server's current version of a resource), as noted above.

## Notes for Phase 3
- Data currently lives in memory (`server/src/data/store.js`) and resets on server restart. Phase 3 swaps this for MongoDB/Mongoose behind the same `models/*.js` functions — no controller or route changes needed.
- The `version` field on tasks is already wired for optimistic concurrency; a future phase can surface `409 CONFLICT` responses in the UI (e.g. "someone else edited this task — reload?").