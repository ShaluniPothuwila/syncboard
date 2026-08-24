import { useState } from "react";
import { initialData } from "./mockData";
import Column from "./components/Column";
import Sidebar from "./components/Sidebar";
import { DragDropContext } from "@hello-pangea/dnd";

export default function App() {
  const [data, setData] = useState(initialData);
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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingTask) {
      //EDIT TASK
      setData((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === editingTask.id ? { ...t, ...form } : t
          ),
        })),
      }));
    } else {
      //ADD TASK
      const newTask = {
        id: Date.now().toString(),
        ...form,
        categoryColor: "bg-sky-100 text-sky-700",
        priorityColor: "bg-amber-100 text-amber-700",
        assignee:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      };

      setData((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === "col-1"
            ? { ...col, tasks: [newTask, ...col.tasks] }
            : col
        ),
      }));
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
  const handleDelete = (taskId) => {
    setData((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== taskId),
      })),
    }));
  };

  //EDIT
  const handleEdit = (task) => {
    setEditingTask(task);
    setForm(task);
    setIsModalOpen(true);
  };

  //DRAG AND DROP HANDLER
  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const sourceColIndex = data.columns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destColIndex = data.columns.findIndex(
      (col) => col.id === destination.droppableId
    );
    const sourceCol = data.columns[sourceColIndex];
    const destCol = data.columns[destColIndex];

    if (source.droppableId === destination.droppableId) {
      const newTasks = Array.from(sourceCol.tasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);

      const newColumns = [...data.columns];
      newColumns[sourceColIndex] = { ...sourceCol, tasks: newTasks };

      setData((prev) => ({ ...prev, columns: newColumns }));
      return;
    }
	
    const sourceTasks = Array.from(sourceCol.tasks);
    const destTasks = Array.from(destCol.tasks);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, movedTask);

    const newColumns = [...data.columns];
    newColumns[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
    newColumns[destColIndex] = { ...destCol, tasks: destTasks };

    setData((prev) => ({ ...prev, columns: newColumns }));
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
              Project Task Management
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

          {/* NOTIFICATION */}
          <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
            🔔
          </button>
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
            stats={data.stats}
            team={data.team}
            upcomingDeadlines={data.upcomingDeadlines}
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