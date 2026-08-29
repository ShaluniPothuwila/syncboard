/**
 * In-memory "database" for the Working REST API milestone (M2).
 *
 * WHY IN-MEMORY: the project brief sequences MongoDB/Mongoose into the
 * NEXT milestone (M3 - "Persistence & Offline Support"). Rather than
 * bolt on a database early, this store holds the exact same shape a
 * Mongoose model will return, so in Phase 3 you swap the functions in
 * models/*.js for real Mongoose calls without touching controllers or
 * routes at all.
 *
 * NOTE: this resets every time the server restarts - that's expected
 * and exactly the gap Phase 3 closes.
 */

let nextTaskId = 100;
let nextUserId = 1;

export const db = {
  users: [
    // filled in by models/User.js when the server starts
  ],

  // Single shared board for now.
  board: {
    id: "board-1",
    boardName: "Sync Board",
    subtitle: "Project Task Management",
    columns: [
      { id: "col-1", title: "To Do", bgColor: "bg-blue-50/70 border-blue-100", badgeColor: "bg-blue-100 text-blue-700" },
      { id: "col-2", title: "In Progress", bgColor: "bg-amber-50/70 border-amber-100", badgeColor: "bg-amber-100 text-amber-800" },
      { id: "col-3", title: "Done", bgColor: "bg-emerald-50/70 border-emerald-100", badgeColor: "bg-emerald-100 text-emerald-800" },
    ],
  },

  // Tasks live in one flat list with a columnId pointing to their column
  // (this is how you'd reference them in MongoDB too, since tasks move
  // between columns constantly - embedding them inside columns would
  // make that awkward).
  tasks: [
    { id: "t1", columnId: "col-1", title: "Design Login Page", description: "Create UI for user login page according to Figma design.", category: "UI/UX", priority: "High", dueDate: "2026-08-20", assignee: "Alice Johnson", completed: false, version: 1 },
    { id: "t2", columnId: "col-1", title: "Set Up Database", description: "Create and configure the project database.", category: "Backend", priority: "Medium", dueDate: "2026-08-21", assignee: "Charlie Brown", completed: false, version: 1 },
    { id: "t5", columnId: "col-2", title: "Develop Home Page", description: "Build responsive home page with featured content.", category: "Frontend", priority: "High", dueDate: "2026-08-20", assignee: "Alice Johnson", completed: false, version: 1 },
    { id: "t8", columnId: "col-3", title: "Project Setup", description: "Initialize project repository and development environment.", category: "Setup", priority: "Low", dueDate: "2026-08-15", assignee: "Bob Smith", completed: true, version: 1 },
  ],
};

export function genTaskId() {
  return `t${nextTaskId++}`;
}

export function genUserId() {
  return `u${nextUserId++}`;
}