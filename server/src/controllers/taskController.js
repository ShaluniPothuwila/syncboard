import {
  getBoardWithTasks,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  getTaskStats,
} from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getBoard = asyncHandler(async (req, res) => {
  const board = await getBoardWithTasks();
  res.json(board);
});

export const addTask = asyncHandler(async (req, res) => {
  const { columnId, title, description, category, priority, dueDate, assignee } = req.body;

  if (!columnId || !title || !title.trim()) {
    return res.status(400).json({ error: "columnId and title are required" });
  }

  const task = await createTask({
    columnId, title, description, category, priority, dueDate, assignee,
    createdBy: req.user._id,
  });
  res.status(201).json(task);
});

export const editTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { version, ...updates } = req.body;

  const task = await updateTask(id, updates, version);
  if (!task) return res.status(404).json({ error: "Task not found" });

  res.json(task);
});

export const moveTaskHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { columnId, index } = req.body;

  if (!columnId) {
    return res.status(400).json({ error: "columnId is required" });
  }

  const task = await moveTask(id, { columnId, index });
  if (!task) return res.status(404).json({ error: "Task not found" });

  res.json(task);
});

export const removeTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteTask(id);
  if (!deleted) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await getTaskStats();
  res.json(stats);
});