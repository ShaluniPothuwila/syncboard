import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "../../src/components/Column";

function renderColumn(column, props = {}) {
  const onDelete = vi.fn();
  const onEdit = vi.fn();

  render(
    <DragDropContext onDragEnd={() => {}}>
      <Column column={column} onDelete={onDelete} onEdit={onEdit} {...props} />
    </DragDropContext>
  );

  return { onDelete, onEdit };
}

const emptyColumn = {
  id: "col-1",
  title: "To Do",
  bgColor: "bg-blue-50",
  badgeColor: "bg-blue-100 text-blue-700",
  tasks: [],
};

const columnWithTasks = {
  ...emptyColumn,
  tasks: [
    { id: "t1", title: "First task", description: "", priority: "Low", assignee: "" },
    { id: "t2", title: "Second task", description: "", priority: "High", assignee: "" },
  ],
};

describe("Column", () => {
  test("renders the column title", () => {
    renderColumn(emptyColumn);
    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  test("shows 0 in the badge when there are no tasks", () => {
    renderColumn(emptyColumn);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("shows the correct count in the badge and renders every task", () => {
    renderColumn(columnWithTasks);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("First task")).toBeInTheDocument();
    expect(screen.getByText("Second task")).toBeInTheDocument();
  });
});