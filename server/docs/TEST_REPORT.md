# SyncBoard — Test Report

**Date:** September 2026
**Scope:** Backend API (Jest + Supertest) and Frontend components (Vitest + React Testing Library)

## Summary

| Layer | Framework | Test Files | Tests | Status |
|---|---|---|---|---|
| Backend | Jest + Supertest | 2 | 33 | ✅ All passing |
| Frontend | Vitest + React Testing Library | 5 | 28 | ✅ All passing |
| **Total** | | **7** | **61** | ✅ All passing |

Both suites run automatically on every push via GitHub Actions CI (`.github/workflows/ci.yml`), so regressions are caught before merging.

## Backend Test Coverage

Run against a real, disposable in-memory MongoDB instance (`mongodb-memory-server`) — not mocks — so tests exercise the actual Mongoose schemas, validation, and aggregation pipelines.

| File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| **Overall** | **92.09%** | **82.85%** | **87.5%** | **94.57%** |
| app.js | 100% | 100% | 100% | 100% |
| authController.js | 100% | 100% | 100% | 100% |
| taskController.js | 97.05% | 92.3% | 100% | 100% |
| Task.js (model) | 94.87% | 91.66% | 91.66% | 97.22% |
| User.js (model) | 92.3% | 50% | 100% | 92.3% |
| taskSchema.js | 100% | 100% | 100% | 100% |
| userSchema.js | 87.5% | 50% | 100% | 100% |
| jwt.js / asyncHandler.js | 100% | 100% | 100% | 100% |

### What's tested (`tests/auth.test.js` — 13 tests)
- User registration, including duplicate-email rejection (409) and validation errors (400)
- Case-insensitive email matching on login
- Login with correct/incorrect credentials
- Password minimum length enforcement
- `GET /api/auth/me` — valid token, missing token, malformed token

### What's tested (`tests/tasks.test.js` — 20 tests)
- All board/task routes reject unauthenticated requests (401)
- Board structure (3 fixed columns) and task placement
- Task creation, including validation (missing title/columnId, whitespace-only title)
- Task editing and **optimistic concurrency / conflict detection**: a stale `version` on edit correctly returns `409` with the server's current state attached, which powers the frontend's conflict-resolution modal
- Task moving between columns
- Task deletion, including 404 for non-existent tasks
- `GET /api/stats` — the MongoDB `$facet` aggregation, verified for empty boards, multi-task `byColumn`/`byPriority` breakdowns, and `percentComplete` math

## Frontend Test Coverage

| File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Button.jsx | 100% | 100% | 100% | 100% |
| Column.jsx | 100% | 100% | 100% | 100% |
| ConflictModal.jsx | 100% | 75% | 100% | 100% |
| TaskCard.jsx | 100% | 100% | 100% | 100% |
| AuthContext.jsx | 100% | 100% | 100% | 100% |

### What's tested
- **Button** — all four variants (primary/secondary/ghost/danger), click handling, disabled state, icon rendering, native prop forwarding
- **Column** — renders task count badge correctly, renders every task passed in
- **ConflictModal** — renders both "my changes" and "server" versions side by side, and each of the three resolution buttons (Overwrite mine / Discard mine / Cancel) calls exactly the right callback
- **TaskCard** — renders all task fields, due-date formatting, completed-state checkmark, Edit/Delete button callbacks fire with the correct task data
- **AuthContext** — login (remember-me → localStorage vs session-only → sessionStorage), register, logout (clears both storages), and session restoration on page refresh

## Manual QA (see README.md)

In addition to automated tests, the following was manually verified against the live API and UI:
- Full register → login → logout flow against the live backend
- JWT persistence across page refresh
- Add/edit/delete/drag-and-drop tasks persisting to MongoDB (confirmed via Atlas Data Explorer)
- Conflict resolution UI tested end-to-end using two browser windows (normal + incognito) editing the same task simultaneously
- Offline support: board renders from cache with no connection, actions queue while offline, and auto-sync on reconnect (tested via DevTools network throttling)

## Known Gaps (Honest Limitations)

The following are **not yet covered** by automated tests and are flagged as future work rather than claimed as tested:
- `App.jsx` (main integration/state logic) — large surface area, better suited to end-to-end tests than unit tests
- `LoginForm.jsx`, `Sidebar.jsx` — presentational, lower risk, not yet tested
- `src/api/*` (fetch wrapper layer) and `src/offline/*` (PouchDB caching/sync) — verified manually (see QA Notes) but not yet covered by automated tests
- No end-to-end (E2E) tests yet (e.g. Playwright/Cypress) — all current tests are unit/integration level

## How to Run

**Backend:**
```bash
cd server
npm test                # run tests
npm run test:coverage   # run tests with coverage report
```

**Frontend:**
```bash
npm test                # run tests
npm run test:coverage   # run tests with coverage report
```

Both are also run automatically on every push via GitHub Actions (see the "Actions" tab on the repository).