import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import ConflictModal from "../../src/components/ConflictModal";

const myChanges = {
  title: "My edited title",
  description: "My description",
  category: "Design",
  priority: "High",
  dueDate: "2026-09-10",
};

const serverTask = {
  title: "Server's title",
  description: "Server's description",
  category: "Engineering",
  priority: "Low",
  dueDate: "2026-09-15",
};

function setup(overrides = {}) {
  const onKeepMine = vi.fn();
  const onUseServer = vi.fn();
  const onCancel = vi.fn();

  render(
    <ConflictModal
      myChanges={myChanges}
      serverTask={serverTask}
      onKeepMine={onKeepMine}
      onUseServer={onUseServer}
      onCancel={onCancel}
      {...overrides}
    />
  );

  return { onKeepMine, onUseServer, onCancel };
}

describe("ConflictModal", () => {
  test("shows the conflict warning heading", () => {
    setup();
    expect(screen.getByText(/someone else edited this task/i)).toBeInTheDocument();
  });

  test("renders both 'my changes' and 'server' values side by side", () => {
    setup();
    expect(screen.getByText("My edited title")).toBeInTheDocument();
    expect(screen.getByText("Server's title")).toBeInTheDocument();
    expect(screen.getByText("My description")).toBeInTheDocument();
    expect(screen.getByText("Server's description")).toBeInTheDocument();
  });

  test("shows a placeholder for any field that is missing on either side", () => {
    setup({ myChanges: { ...myChanges, category: "" } });
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  test("clicking 'Overwrite with mine' calls onKeepMine only", async () => {
    const user = userEvent.setup();
    const { onKeepMine, onUseServer, onCancel } = setup();

    await user.click(screen.getByRole("button", { name: /overwrite with mine/i }));

    expect(onKeepMine).toHaveBeenCalledTimes(1);
    expect(onUseServer).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  test("clicking \"Discard mine, keep server's\" calls onUseServer only", async () => {
    const user = userEvent.setup();
    const { onKeepMine, onUseServer, onCancel } = setup();

    await user.click(screen.getByRole("button", { name: /discard mine, keep server's/i }));

    expect(onUseServer).toHaveBeenCalledTimes(1);
    expect(onKeepMine).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  test("clicking 'Cancel' calls onCancel only", async () => {
    const user = userEvent.setup();
    const { onKeepMine, onUseServer, onCancel } = setup();

    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onKeepMine).not.toHaveBeenCalled();
    expect(onUseServer).not.toHaveBeenCalled();
  });
});