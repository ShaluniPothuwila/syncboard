import { useState, useEffect } from "react";
import { initialData } from "./mockData";
import Column from "./components/Column";
import Sidebar from "./components/Sidebar";
import ConflictModal from "./components/ConflictModal";
import { DragDropContext } from "@hello-pangea/dnd";
import { useAuth } from "./context/AuthContext";
import LoginForm from "./components/LoginForm";
import { getBoard, createTask, updateTask, deleteTask, moveTask, getStats } from "./api/board";
import { useOnlineStatus } from "./offline/useOnlineStatus";
import {
  saveBoardSnapshot,
  getBoardSnapshot,
  addPendingAction,
  getPendingActions,
  clearPendingActions,
} from "./offline/localDB";

const CATEGORY_COLORS = {
  "UI/UX": "bg-purple-100 text-purple-700",
  Backend: "bg-blue-100 text-blue-700",
  Frontend: "bg-sky-100 text-sky-700",
  Docs: "bg-emerald-100 text-emerald-700",
  Testing: "bg-indigo-100 text-indigo-700",
  Setup: "bg-emerald-100 text-emerald-700",
  Research: "bg-emerald-100 text-emerald-700",
};
const PRIORITY_COLORS = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100";

function enrichColumns(columns) {
  return columns.map((col) => ({
    ...col,
    tasks: col.tasks.map((task) => ({
      ...task,
      categoryColor: CATEGORY_COLORS[task.category] || "bg-slate-100 text-slate-600",
      priorityColor: PRIORITY_COLORS[task.priority] || "bg-slate-100 text-slate-600",
      assignee:
        initialData.team.find((m) => m.name === task.assignee)?.avatar || DEFAULT_AVATAR,
    })),
  }));
}

const emptyForm = { title: "", description: "", category: "Frontend", priority: "Medium", dueDate: "" };

export default function App() {
  const { user, logout } = useAuth();
  const isOnline = useOnlineStatus();

  const [data, setData] = useState(null);
  const [stats, setStats] = useState({ progress: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // On login, render from local cache immediately (instant, works offline),
  // then try to refresh from the real server in the background.
  useEffect(() => {
    if (!user) return;
    loadFromCacheThenServer();
  }, [user]);

  // Whenever we come back online, sync any queued offline changes.
  useEffect(() => {
    if (isOnline && user) {
      syncPendingActions();
    }
  }, [isOnline]);

  async function loadFromCacheThenServer() {
    const cached = await getBoardSnapshot();
    if (cached) {
      setData({ ...cached.board, columns: enrichColumns(cached.board.columns) });
      setStats(cached.stats);
      setLoading(false);
    }
    const pending = await getPendingActions();
    setPendingCount(pending.length);

    if (navigator.onLine) {
      await refreshBoard();
    } else if (!cached) {
      setLoading(false);
      setErrorMsg("You're offline and no cached data is available yet.");
    }
  }

  async function refreshBoard() {
    try {
      setErrorMsg("");
      const [board, statsData] = await Promise.all([getBoard(), getStats()]);
      const mappedStats = {
        progress: statsData.percentComplete,
        completed: statsData.completed,
        total: statsData.total,
      };
      setData({ ...board, columns: enrichColumns(board.columns) });
      setStats(mappedStats);
      await saveBoardSnapshot(board, mappedStats);
    } catch (err) {
      // Network failed - fall back silently to whatever's cached/in state.
      // The offline banner (driven by isOnline) tells the user what's going on.
      if (!data) {
        const cached = await getBoardSnapshot();
        if (cached) {
          setData({ ...cached.board, columns: enrichColumns(cached.board.columns) });
          setStats(cached.stats);
        } else {
          setErrorMsg(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function syncPendingActions() {
    const actions = await getPendingActions();
    if (actions.length === 0) return;

    setSyncing(true);
    const failures = [];

    for (const action of actions) {
      try {
        if (action.type === "create") {
          await createTask(action.payload);
        } else if (action.type === "update") {
          await updateTask(action.taskId, action.payload, action.version);
        } else if (action.type === "move") {
          await moveTask(action.taskId, action.columnId, action.index);
        } else if (action.type === "delete") {
          await deleteTask(action.taskId);
        }
      } catch (err) {
        if (err.status === 409) {
          failures.push(`"${action.payload?.title || action.taskId}" — someone else edited this while you were offline`);
        } else {
          failures.push(`${action.type} failed: ${err.message}`);
        }
      }
    }

    await clearPendingActions();
    setPendingCount(0);
    setSyncing(false);

    if (failures.length > 0) {
      alert(`Synced with some issues:\n\n${failures.join("\n")}\n\nPlease review these tasks.`);
    }

    await refreshBoard();
  }

  if (!user) {
    return <LoginForm />;
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading your board...
      </div>
    );
  }

  if (errorMsg && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-sm">
        {errorMsg}
      </div>
    );
  }

  const filteredColumns = data.columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      dueDate: form.dueDate,
    };

    if (!isOnline) {
      // Queue the action and apply an optimistic local update so the
      // board still feels responsive while offline.
      if (editingTask) {
        await addPendingAction({ type: "update", taskId: editingTask.id, payload, version: editingTask.version });
        setData((prev) => ({
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) => (t.id === editingTask.id ? { ...t, ...payload } : t)),
          })),
        }));
      } else {
        const tempId = `local-${Date.now()}`;
        await addPendingAction({ type: "create", payload: { columnId: "col-1", ...payload } });
        setData((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === "col-1"
              ? { ...col, tasks: [...col.tasks, { id: tempId, columnId: "col-1", ...payload, categoryColor: CATEGORY_COLORS[payload.category], priorityColor: PRIORITY_COLORS[payload.priority], assignee: DEFAULT_AVATAR, version: 1 }] }
              : col
          ),
        }));
      }
      const pending = await getPendingActions();
      setPendingCount(pending.length);
      setForm(emptyForm);
      setEditingTask(null);
      setIsModalOpen(false);
      return;
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload, editingTask.version);
      } else {
        await createTask({ columnId: "col-1", ...payload });
      }
      await refreshBoard();
      setForm(emptyForm);
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (err) {
      if (err.status === 409 && err.body?.current) {
        setConflict({ taskId: editingTask.id, myChanges: payload, serverTask: err.body.current });
        setIsModalOpen(false);
      } else {
        alert(err.message);
      }
    }
  };

  const handleDelete = async (taskId) => {
    if (!isOnline) {
      await addPendingAction({ type: "delete", taskId });
      setData((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        })),
      }));
      const pending = await getPendingActions();
      setPendingCount(pending.length);
      return;
    }

    try {
      await deleteTask(taskId);
      await refreshBoard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm(task);
    setIsModalOpen(true);
  };

  const handleKeepMine = async () => {
    try {
      await updateTask(conflict.taskId, conflict.myChanges);
      await refreshBoard();
    } catch (err) {
      alert(err.message);
    } finally {
      setConflict(null);
      setEditingTask(null);
      setForm(emptyForm);
    }
  };

  const handleUseServer = async () => {
    await refreshBoard();
    setConflict(null);
    setEditingTask(null);
    setForm(emptyForm);
  };

  const handleCancelConflict = () => {
    setConflict(null);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceColIndex = data.columns.findIndex((col) => col.id === source.droppableId);
    const destColIndex = data.columns.findIndex((col) => col.id === destination.droppableId);
    const sourceCol = data.columns[sourceColIndex];
    const destCol = data.columns[destColIndex];

    const sourceTasks = Array.from(sourceCol.tasks);
    const [movedTask] = sourceTasks.splice(source.index, 1);
    const destTasks = source.droppableId === destination.droppableId ? sourceTasks : Array.from(destCol.tasks);
    destTasks.splice(destination.index, 0, movedTask);

    const newColumns = [...data.columns];
    newColumns[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
    newColumns[destColIndex] = { ...destCol, tasks: destTasks };
    setData((prev) => ({ ...prev, columns: newColumns }));

    if (!isOnline) {
      await addPendingAction({ type: "move", taskId: draggableId, columnId: destination.droppableId, index: destination.index });
      const pending = await getPendingActions();
      setPendingCount(pending.length);
      return;
    }

    try {
      await moveTask(draggableId, destination.droppableId, destination.index);
      await refreshBoard();
    } catch (err) {
      alert(err.message);
      refreshBoard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {!isOnline && (
        <div className="bg-amber-100 text-amber-800 text-xs text-center py-1.5 font-medium">
          You're offline — showing cached data. Changes will sync automatically when you're back online.
          {pendingCount > 0 && ` (${pendingCount} change${pendingCount === 1 ? "" : "s"} waiting)`}
        </div>
      )}
      {isOnline && syncing && (
        <div className="bg-indigo-100 text-indigo-800 text-xs text-center py-1.5 font-medium">
          Syncing offline changes...
        </div>
      )}

      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-0.5 w-7 h-7 bg-indigo-50 p-1 rounded-lg">
            <span className="bg-red-400 rounded-sm"></span>
            <span className="bg-blue-500 rounded-sm"></span>
            <span className="bg-amber-400 rounded-sm"></span>
            <span className="bg-emerald-500 rounded-sm"></span>
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-none">{data.boardName}</h1>
            <p className="text-[11px] text-slate-400">{data.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="bg-slate-100 text-xs px-3 py-2 pl-8 rounded-lg w-52 outline-none border focus:border-indigo-400 focus:bg-white"
            />
            <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold"
          >
            + Add Task
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs text-slate-500 font-medium">{user.name}</span>
            <button onClick={logout} className="text-xs text-slate-400 hover:text-red-500">
              Log out
            </button>
          </div>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <main className="flex-1 p-6 flex gap-6 overflow-x-auto max-w-[1600px] w-full mx-auto">
          <div className="flex-1 flex gap-4 items-start min-w-[800px]">
            {filteredColumns.map((col) => (
              <Column key={col.id} column={col} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>

          <Sidebar stats={stats} team={initialData.team} upcomingDeadlines={initialData.upcomingDeadlines} />
        </main>
      </DragDropContext>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 w-80 rounded-lg">
            <h2 className="font-bold mb-2">{editingTask ? "Edit Task" : "Add Task"}</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                className="border p-2 text-sm"
                required
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="border p-2 text-sm"
              />
              <select name="category" value={form.category} onChange={handleChange} className="border p-2 text-sm">
                <option>Frontend</option>
                <option>Backend</option>
              </select>
              <select name="priority" value={form.priority} onChange={handleChange} className="border p-2 text-sm">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="border p-2 text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-sm">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-3 py-1 text-sm rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {conflict && (
        <ConflictModal
          myChanges={conflict.myChanges}
          serverTask={conflict.serverTask}
          onKeepMine={handleKeepMine}
          onUseServer={handleUseServer}
          onCancel={handleCancelConflict}
        />
      )}
    </div>
  );
}