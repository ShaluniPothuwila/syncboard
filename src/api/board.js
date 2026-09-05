import { apiFetch } from "./client";

export async function getBoard() {
  return apiFetch("/board");
}

export async function getStats() {
  return apiFetch("/stats");
}

export async function createTask(taskData) {
  return apiFetch("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(id, updates, version) {
  return apiFetch(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...updates, version }),
  });
}

export async function moveTask(id, columnId, index) {
  return apiFetch(`/tasks/${id}/move`, {
    method: "PATCH",
    body: JSON.stringify({ columnId, index }),
  });
}

export async function deleteTask(id) {
  return apiFetch(`/tasks/${id}`, {
    method: "DELETE",
  });
}