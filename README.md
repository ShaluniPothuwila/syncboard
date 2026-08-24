SyncBoard

A Kanban-style task management web app built with React, Vite, and Tailwind CSS.

Organize work across To Do, In Progress, and Done columns, drag and drop tasks between them, and keep track of your team and upcoming deadlines from a single dashboard.

Features
Drag-and-drop task boards — reorder tasks within a column or move them across columns
Add / edit tasks — create tasks with a title, description, category, priority, and due date; edit or delete them anytime
Live search — filter tasks across all columns as you type
Form validation — prevents saving a task with an empty title
Project sidebar — see overall progress, team member status, and upcoming deadlines at a glance
Tech Stack
React 19
Vite
Tailwind CSS 4
@hello-pangea/dnd for drag-and-drop
Oxlint for linting
Getting Started
Prerequisites
Node.js (v18 or later recommended)
npm (comes with Node.js)
Installation

Clone the repo and install dependencies:

bash
git clone https://github.com/ShaluniPothuwila/syncboard.git
cd syncboard
npm install
Running locally
bash
npm run dev

This starts the Vite dev server — open the printed local URL (usually http://localhost:5173) in your browser.

Other scripts
bash
npm run build    # build for production
npm run preview  # preview the production build locally
npm run lint      # run Oxlint
Project Structure
syncboard/
├── index.html          # Vite entry HTML
├── vite.config.js       # Vite + Tailwind config
├── src/
│   ├── main.jsx         # React app entry point
│   ├── App.jsx           # Main app logic (state, handlers, modal)
│   ├── mockData.js       # Sample board data
│   └── components/
│       ├── Column.jsx    # A single board column
│       ├── TaskCard.jsx  # An individual task card
│       └── Sidebar.jsx   # Project overview, team, deadlines
└── public/               # Static assets
QA Notes
Verified drag-and-drop works across all three columns
Verified search filters tasks in real time
Verified Add/Edit Task modal validates empty titles