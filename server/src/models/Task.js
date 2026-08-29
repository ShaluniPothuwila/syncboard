import { db, genTaskId } from "../data/store.js";

/**
 * Same idea as User.js: these functions are the seam where Phase 3
 * plugs in Mongoose. Controllers never touch `db` directly.
 */

export async function getBoardWithTasks() {
  const columns = db.board.columns.map((col) => ({
    ...col,
    tasks: db.tasks.filter((t) => t.columnId === col.id),
  }));
  return { ...db.board, columns };
}

export async function findTaskById(id) {
  return db.tasks.find((t) => t.id === id) || null;
}

export async function createTask({ columnId, title, description, category, priority, dueDate, assignee }) {
  const column = db.board.columns.find((c) => c.id === columnId);
  if (!column) {
    const err = new Error(`Unknown column: ${columnId}`);
    err.status = 400;
    throw err;
  }

  const task = {
    id: genTaskId(),
    columnId,
    title,
    description: description || "",
    category: category || "General",
    priority: priority || "Medium",
    dueDate: dueDate || null,
    assignee: assignee || null,
    completed: false,
    version: 1,
  };
  db.tasks.push(task);
  return task;
}

/**
 * Optimistic concurrency: the caller must send the `version` they last
 * read. If it doesn't match the current version, someone else edited
 * this task first - we reject the write instead of silently
 * overwriting their change.
 */
export async function updateTask(id, updates, expectedVersion) {
  const task = await findTaskById(id);
  if (!task) return null;

  if (expectedVersion !== undefined && Number(expectedVersion) !== task.version) {
    const err = new Error("Task was modified by someone else since you loaded it");
    err.status = 409;
    err.code = "CONFLICT";
    err.current = task;
    throw err;
  }

  Object.assign(task, updates, { version: task.version + 1 });
  return task;
}

export async function moveTask(id, { columnId, index }) {
  const task = await findTaskById(id);
  if (!task) return null;

  const column = db.board.columns.find((c) => c.id === columnId);
  if (!column) {
    const err = new Error(`Unknown column: ${columnId}`);
    err.status = 400;
    throw err;
  }

  task.columnId = columnId;
  task.version += 1;

  if (typeof index === "number") {
    const others = db.tasks.filter((t) => t.id !== id);
    const sameColumn = others.filter((t) => t.columnId === columnId);
    const rest = others.filter((t) => t.columnId !== columnId);
    sameColumn.splice(index, 0, task);
    db.tasks.length = 0;
    db.tasks.push(...rest, ...sameColumn);
  }

  return task;
}

export async function deleteTask(id) {
  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  db.tasks.splice(idx, 1);
  return true;
}