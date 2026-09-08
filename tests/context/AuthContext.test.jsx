import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../../src/context/AuthContext";

vi.mock("../../src/api/auth", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

import { login as loginApi, register as registerApi } from "../../src/api/auth";

function Consumer() {
  const { user, token, loading, login, register, logout } = useAuth();

  if (loading) return <p>loading</p>;

  return (
    <div>
      <p data-testid="user">{user ? user.name : "none"}</p>
      <p data-testid="token">{token || "none"}</p>
      <button onClick={() => login("a@b.com", "password123", true)}>Login (remember)</button>
      <button onClick={() => login("a@b.com", "password123", false)}>Login (session only)</button>
      <button onClick={() => register("New User", "new@b.com", "password123")}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

const fakeSession = { token: "abc123", user: { name: "Jane Doe", email: "a@b.com" } };

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  test("starts logged out when no session is saved", async () => {
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("none"));
    expect(screen.getByTestId("token")).toHaveTextContent("none");
  });

  test("login with remember=true saves the session to localStorage", async () => {
    loginApi.mockResolvedValue(fakeSession);
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Login (remember)"));

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Jane Doe"));
    expect(screen.getByTestId("token")).toHaveTextContent("abc123");
    expect(localStorage.getItem("syncboard_token")).toBe("abc123");
    expect(sessionStorage.getItem("syncboard_token")).toBeNull();
  });

  test("login with remember=false saves the session to sessionStorage only", async () => {
    loginApi.mockResolvedValue(fakeSession);
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Login (session only)"));

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Jane Doe"));
    expect(sessionStorage.getItem("syncboard_token")).toBe("abc123");
    expect(localStorage.getItem("syncboard_token")).toBeNull();
  });

  test("register saves the session the same way login does", async () => {
    registerApi.mockResolvedValue({
      token: "xyz789",
      user: { name: "New User", email: "new@b.com" },
    });
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Register"));

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("New User"));
    expect(registerApi).toHaveBeenCalledWith("New User", "new@b.com", "password123");
  });

  test("logout clears both storages and resets state", async () => {
    loginApi.mockResolvedValue(fakeSession);
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Login (remember)"));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Jane Doe"));

    await user.click(screen.getByText("Logout"));

    expect(screen.getByTestId("user")).toHaveTextContent("none");
    expect(screen.getByTestId("token")).toHaveTextContent("none");
    expect(localStorage.getItem("syncboard_token")).toBeNull();
    expect(sessionStorage.getItem("syncboard_token")).toBeNull();
  });

  test("restores a previously saved session on mount (stay logged in after refresh)", async () => {
    localStorage.setItem("syncboard_token", "saved-token");
    localStorage.setItem("syncboard_user", JSON.stringify({ name: "Returning User" }));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Returning User"));
    expect(screen.getByTestId("token")).toHaveTextContent("saved-token");
  });
});