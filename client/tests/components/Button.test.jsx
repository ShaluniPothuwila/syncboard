import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import Button from "../../src/components/Button";

describe("Button", () => {
  test("renders its children as visible text", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  test("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("defaults to the secondary variant when none is given", () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("border-slate-300");
  });

  test("applies primary variant styling", () => {
    render(<Button variant="primary">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-indigo-600");
  });

  test("applies danger variant styling", () => {
    render(<Button variant="danger">Remove</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-red-600");
  });

  test("forwards native button props like type and disabled", () => {
    render(
      <Button type="submit" disabled>
        Submit
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Submit" });
    expect(btn).toHaveAttribute("type", "submit");
    expect(btn).toBeDisabled();
  });

  test("renders a leading icon alongside the label", () => {
    render(<Button icon={<span data-testid="my-icon" />}>Edit</Button>);
    expect(screen.getByTestId("my-icon")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});