import Task from "./schemas/taskSchema.js";

export async function getBoardWithTasks() {
  const columnDefs = [
    { id: "col-1", title: "To Do", bgColor: "bg-blue-50/70 border-blue-100", badgeColor: "bg-blue-100 text-blue-700" },
    { id: "col-2", title: "In Progress", bgColor: "bg-amber-50/70 border-amber-100", badgeColor: "bg-amber-100 text-amber-800" },
    { id: "col-3", title: "Done", bgColor: "bg-emerald-50/70 border-emerald-100", badgeColor: "bg-emerald-100 text-emerald-800" },
  ];

  const allTasks = await Task.find().sort({ createdAt: 1 });

  const columns = columnDefs.map((col) => ({
    ...col,
    tasks: allTasks
      .filter((t) => t.columnId === col.id)
      .map(serializeTask),
  }));

  return {
    id: "board-1",
    boardName: "Sync Board",
    subtitle: "Project Task Management",
    columns,
  };
}

export async function findTaskById(id) {
  return Task.findById(id);
}

export async function createTask({ columnId, title, description, category, priority, dueDate, assignee, createdBy }) {
  const task = new Task({ columnId, title, description, category, priority, dueDate, assignee, createdBy });
  await task.save();
  return serializeTask(task);
}

export async function updateTask(id, updates, expectedVersion) {
  const task = await Task.findById(id);
  if (!task) return null;

  if (expectedVersion !== undefined && Number(expectedVersion) !== task.version) {
    const err = new Error("Task was modified by someone else since you loaded it");
    err.status = 409;
    err.code = "CONFLICT";
    err.current = serializeTask(task);
    throw err;
  }

  Object.assign(task, updates);
  task.version += 1;
  await task.save();
  return serializeTask(task);
}

export async function moveTask(id, { columnId }) {
  const task = await Task.findById(id);
  if (!task) return null;

  task.columnId = columnId;
  task.version += 1;
  await task.save();
  return serializeTask(task);
}

export async function deleteTask(id) {
  const result = await Task.findByIdAndDelete(id);
  return !!result;
}

export async function getTaskStats() {
  const [result] = await Task.aggregate([
    {
      $facet: {
        byColumn: [{ $group: { _id: "$columnId", count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
        overall: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: ["$completed", 1, 0] } },
            },
          },
        ],
      },
    },
  ]);

  const overall = result.overall[0] || { total: 0, completed: 0 };
  const percentComplete = overall.total === 0 ? 0 : Math.round((overall.completed / overall.total) * 100);

  return {
    total: overall.total,
    completed: overall.completed,
    percentComplete,
    byColumn: Object.fromEntries(result.byColumn.map((c) => [c._id, c.count])),
    byPriority: Object.fromEntries(result.byPriority.map((p) => [p._id, p.count])),
  };
}

function serializeTask(task) {
  return {
    id: task._id.toString(),
    columnId: task.columnId,
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    dueDate: task.dueDate,
    assignee: task.assignee,
    completed: task.completed,
    version: task.version,
  };
}