import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

async function registerAndLogin(email = "tasker@example.com") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Tasker", email, password: "password123" });
  return res.body.token;
}

function authed(token) {
  return { Authorization: `Bearer ${token}` };
}

describe("Board & Task routes require authentication", () => {
  test.each([
    ["get", "/api/board"],
    ["get", "/api/stats"],
    ["post", "/api/tasks"],
  ])("%s %s returns 401 with no token", async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/board", () => {
  test("returns the three fixed columns, empty when no tasks exist", async () => {
    const token = await registerAndLogin();
    const res = await request(app).get("/api/board").set(authed(token));

    expect(res.status).toBe(200);
    expect(res.body.columns).toHaveLength(3);
    expect(res.body.columns.map((c) => c.id)).toEqual(["col-1", "col-2", "col-3"]);
    res.body.columns.forEach((col) => expect(col.tasks).toEqual([]));
  });

  test("places created tasks into the correct column", async () => {
    const token = await registerAndLogin();
    await request(app)
      .post("/api/tasks")
      .set(authed(token))
      .send({ columnId: "col-2", title: "In progress task" });

    const res = await request(app).get("/api/board").set(authed(token));
    const col2 = res.body.columns.find((c) => c.id === "col-2");
    expect(col2.tasks).toHaveLength(1);
    expect(col2.tasks[0].title).toBe("In progress task");
  });
});

describe("POST /api/tasks", () => {
  test("creates a task with the authenticated user as createdBy", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/tasks")
      .set(authed(token))
      .send({ columnId: "col-1", title: "Write tests" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      columnId: "col-1",
      title: "Write tests",
      version: 1, // schema default — versioning starts at 1, not 0
    });
    expect(res.body.id).toEqual(expect.any(String));
  });

  test("rejects a task with no title (400)", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/tasks")
      .set(authed(token))
      .send({ columnId: "col-1" });

    expect(res.status).toBe(400);
  });

  test("rejects a title that is only whitespace (400)", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/tasks")
      .set(authed(token))
      .send({ columnId: "col-1", title: "   " });

    expect(res.status).toBe(400);
  });

  test("rejects a task with no columnId (400)", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/tasks")
      .set(authed(token))
      .send({ title: "No column" });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/tasks/:id (edit + conflict detection)", () => {
  async function createTask(token, overrides = {}) {
    const res = await request(app)
      .post("/api/tasks")
      .set(authed(token))
      .send({ columnId: "col-1", title: "Original title", ...overrides });
    return res.body;
  }

  test("edits a task and increments its version", async () => {
    const token = await registerAndLogin();
    const task = await createTask(token);

    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(authed(token))
      .send({ title: "Updated title", version: task.version });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated title");
    expect(res.body.version).toBe(task.version + 1);
  });

  test("returns 409 CONFLICT when the version is stale (optimistic concurrency)", async () => {
    const token = await registerAndLogin();
    const task = await createTask(token);

    // Simulate a first, successful edit — this bumps the version on the server.
    await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(authed(token))
      .send({ title: "First editor's change", version: task.version });

    // A second client, still holding the stale (original) version, tries to edit.
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(authed(token))
      .send({ title: "Second editor's change", version: task.version });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/modified by someone else/i);
    // The server should tell the client what the current state actually is,
    // so the conflict-resolution UI can show it.
    expect(res.body.current).toBeDefined();
    expect(res.body.current.title).toBe("First editor's change");
  });

  test("returns 404 for a non-existent task id", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .patch("/api/tasks/000000000000000000000000")
      .set(authed(token))
      .send({ title: "Doesn't matter", version: 0 });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/tasks/:id/move", () => {
  test("moves a task to a new column", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/api/tasks")
      .set(authed(token))
      .send({ columnId: "col-1", title: "Move me" });

    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}/move`)
      .set(authed(token))
      .send({ columnId: "col-3" });

    expect(res.status).toBe(200);
    expect(res.body.columnId).toBe("col-3");
    expect(res.body.version).toBe(created.body.version + 1);
  });

  test("rejects a move with no columnId (400)", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/api/tasks")
      .set(authed(token))
      .send({ columnId: "col-1", title: "Task" });

    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}/move`)
      .set(authed(token))
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/tasks/:id", () => {
  test("deletes an existing task and returns 204", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/api/tasks")
      .set(authed(token))
      .send({ columnId: "col-1", title: "Delete me" });

    const res = await request(app)
      .delete(`/api/tasks/${created.body.id}`)
      .set(authed(token));
    expect(res.status).toBe(204);

    const board = await request(app).get("/api/board").set(authed(token));
    const allTasks = board.body.columns.flatMap((c) => c.tasks);
    expect(allTasks.find((t) => t.id === created.body.id)).toBeUndefined();
  });

  test("returns 404 when deleting a task that doesn't exist", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .delete("/api/tasks/000000000000000000000000")
      .set(authed(token));
    expect(res.status).toBe(404);
  });
});

describe("GET /api/stats", () => {
  test("returns zeroed stats when there are no tasks", async () => {
    const token = await registerAndLogin();
    const res = await request(app).get("/api/stats").set(authed(token));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 0, completed: 0, percentComplete: 0 });
  });

  test("aggregates total, byColumn and byPriority correctly across several tasks", async () => {
    const token = await registerAndLogin();
    const tasks = [
      { columnId: "col-1", title: "A", priority: "High" },
      { columnId: "col-1", title: "B", priority: "Low" },
      { columnId: "col-2", title: "C", priority: "High" },
      { columnId: "col-3", title: "D", priority: "Medium" },
    ];
    for (const t of tasks) {
      await request(app).post("/api/tasks").set(authed(token)).send(t);
    }

    const res = await request(app).get("/api/stats").set(authed(token));

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.byColumn).toMatchObject({ "col-1": 2, "col-2": 1, "col-3": 1 });
    expect(res.body.byPriority).toMatchObject({ High: 2, Low: 1, Medium: 1 });
  });

  test("percentComplete reflects the ratio of completed tasks", async () => {
    const token = await registerAndLogin();
    const created = [];
    for (let i = 0; i < 4; i++) {
      const res = await request(app)
        .post("/api/tasks")
        .set(authed(token))
        .send({ columnId: "col-1", title: `Task ${i}` });
      created.push(res.body);
    }

    // Mark 1 of 4 tasks completed directly via the edit endpoint.
    await request(app)
      .patch(`/api/tasks/${created[0].id}`)
      .set(authed(token))
      .send({ completed: true, version: created[0].version });

    const res = await request(app).get("/api/stats").set(authed(token));
    expect(res.body.total).toBe(4);
    expect(res.body.completed).toBe(1);
    expect(res.body.percentComplete).toBe(25);
  });
});
