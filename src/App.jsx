import { useState, useEffect } from "react";
import { initialData } from "./mockData";
import Column from "./components/Column";
import Sidebar from "./components/Sidebar";
import { DragDropContext } from "@hello-pangea/dnd";
import { useAuth } from "./context/AuthContext";
import LoginForm from "./components/LoginForm";
import { getBoard, createTask, updateTask, deleteTask, moveTask } from "./api/board";

// The API returns plain category/priority strings, not the Tailwind
// classes the UI needs - these lookup tables fill that gap.
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

export default function App() {
  const { user, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Frontend",
    priority: "Medium",
    dueDate: "",
  });

  // Fetch the real board once we know we're logged in.
  useEffect(() => {
    if (!user) return;
    refreshBoard();
  }, [user]);

  async function refreshBoard() {
    try {
      setLoading(true);
      setErrorMsg("");
      const board = await getBoard();
      setData({ ...board, columns: enrichColumns(board.columns) });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Not logged in yet -> show the login/register screen instead of the board.
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

  //SEARCH FILTER
  const filteredColumns = data.columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  //FORM CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //ADD/EDIT TASK
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title: form.title,
          description: form.description,
          category: form.category,
          priority: form.priority,
          dueDate: form.dueDate,
        }, editingTask.version);
      } else {
        await createTask({
          columnId: "col-1",
          title: form.title,
          description: form.description,
          category: form.category,
          priority: form.priority,
          dueDate: form.dueDate,
        });
      }
      await refreshBoard();
    } catch (err) {
      alert(err.message); // e.g. a 409 conflict if someone else edited it first
    }

    //reset
    setForm({
      title: "",
      description: "",
      category: "Frontend",
      priority: "Medium",
      dueDate: "",
    });

    setEditingTask(null);
    setIsModalOpen(false);
  };

  //DELETE
  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      await refreshBoard();
    } catch (err) {
      alert(err.message);
    }
  };

  //EDIT
  const handleEdit = (task) => {
    setEditingTask(task);
    setForm(task);
    setIsModalOpen(true);
  };

  //DRAG AND DROP HANDLER
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Optimistic UI update so the drag feels instant...
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

    // ...then confirm it with the server. If it fails, refetch to undo.
    try {
      await moveTask(draggableId, destination.droppableId, destination.index);
    } catch (err) {
      alert(err.message);
      refreshBoard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER (OLD STYLE + NEW FEATURES) */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-0.5 w-7 h-7 bg-indigo-50 p-1 rounded-lg">
            <span className="bg-red-400 rounded-sm"></span>
            <span className="bg-blue-500 rounded-sm"></span>
            <span className="bg-amber-400 rounded-sm"></span>
            <span className="bg-emerald-500 rounded-sm"></span>
          </div>

          <div>
            <h1 className="text-base font-black text-slate-900 leading-none">
              {data.boardName}
            </h1>
            <p className="text-[11px] text-slate-400">
              {data.subtitle}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="bg-slate-100 text-xs px-3 py-2 pl-8 rounded-lg w-52 outline-none border focus:border-indigo-400 focus:bg-white"
            />
            <span className="absolute left-2.5 top-2 text-slate-400 text-xs">
              🔍
            </span>
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold"
          >
            + Add Task
          </button>

          {/* USER + LOGOUT */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs text-slate-500 font-medium">{user.name}</span>
            <button
              onClick={logout}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* DRAG AND DROP WRAPPER */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* MAIN BOARD */}
        <main className="flex-1 p-6 flex gap-6 overflow-x-auto max-w-[1600px] w-full mx-auto">
          {/* COLUMNS */}
          <div className="flex-1 flex gap-4 items-start min-w-[800px]">
            {filteredColumns.map((col) => (
              <Column
                key={col.id}
                column={col}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {/* SIDEBAR */}
          <Sidebar
            stats={initialData.stats}
            team={initialData.team}
            upcomingDeadlines={initialData.upcomingDeadlines}
          />
        </main>
      </DragDropContext>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 w-80 rounded-lg">
            <h2 className="font-bold mb-2">
              {editingTask ? "Edit Task" : "Add Task"}
            </h2>

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

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border p-2 text-sm"
              >
                <option>Frontend</option>
                <option>Backend</option>
              </select>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="border p-2 text-sm"
              >
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
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-3 py-1 text-sm rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}