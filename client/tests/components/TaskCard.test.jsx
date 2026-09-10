import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import TaskCard from "../../src/components/TaskCard";

function renderTaskCard(task, props = {}) {
  const onDelete = vi.fn();
  const onEdit = vi.fn();

  render(
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="col-1">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <TaskCard task={task} index={0} onDelete={onDelete} onEdit={onEdit} {...props} />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

  return { onDelete, onEdit };
}

const baseTask = {
  id: "task-1",
  title: "Write documentation",
  description: "Cover setup and API usage",
  category: "Docs",
  categoryColor: "bg-blue-100 text-blue-700",
  priority: "Medium",
  priorityColor: "bg-amber-100 text-amber-700",
  dueDate: "2026-09-20",
  assignee: "https://example.com/avatar.png",
  completed: false,
};

describe("TaskCard", () => {
  test("renders the task title, description, category and priority", () => {
    renderTaskCard(baseTask);

    expect(screen.getByText("Write documentation")).toBeInTheDocument();
    expect(screen.getByText("Cover setup and API usage")).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  test("formats the due date as a readable month/day/year", () => {
    renderTaskCard(baseTask);
    expect(screen.getByText(/Sep 20, 2026/)).toBeInTheDocument();
  });

  test("shows 'No date' when the task has no due date", () => {
    renderTaskCard({ ...baseTask, dueDate: null });
    expect(screen.getByText(/No date/)).toBeInTheDocument();
  });

  test("shows a completed checkmark only when the task is completed", () => {
    const { container: notCompleted } = render(
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="col-1">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <TaskCard task={baseTask} index={0} onDelete={vi.fn()} onEdit={vi.fn()} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
    expect(notCompleted.querySelector(".bg-emerald-500")).not.toBeInTheDocument();

    renderTaskCard({ ...baseTask, completed: true });
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  test("clicking Edit calls onEdit with the full task object", async () => {
    const user = userEvent.setup();
    const { onEdit } = renderTaskCard(baseTask);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(baseTask);
  });

  test("clicking Delete calls onDelete with the task id", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderTaskCard(baseTask);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("task-1");
  });
});