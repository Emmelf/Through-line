import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/login-form";
import { server } from "@/tests/mocks/server";

const { mockNavigate, mockSetUser } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSetUser: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ setUser: mockSetUser }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLogin() {
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSetUser.mockReset();
  });

  it("shows validation error for empty form", async () => {
    renderLogin();

    // fireEvent bypasses native "required" blocking so the JS validation is exercised
    fireEvent.submit(screen.getByRole("button", { name: "Login" }).closest("form")!);

    expect(await screen.findByText("Email and password are required")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: "Login" }).closest("form")!);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("shows API error for invalid credentials", async () => {
    server.use(
      http.post("http://localhost:8000/api/login", () =>
        HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
      )
    );

    renderLogin();

    await userEvent.type(screen.getByLabelText("Email"), "bad@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("logs in with valid credentials and redirects", async () => {
    const user = { id: "1", email: "john@example.com", username: "john", roles: ["ROLE_USER"] };
    server.use(
      http.post("http://localhost:8000/api/login", () =>
        HttpResponse.json({ user, message: "Login successful" }, { status: 200 })
      )
    );

    renderLogin();

    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(user);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("disables submit button while loading", async () => {
    server.use(
      http.post("http://localhost:8000/api/login", async () => {
        await delay(120);
        return HttpResponse.json({ user: { id: "1", email: "u@e.com", username: "u", roles: [] } });
      })
    );

    renderLogin();

    await userEvent.type(screen.getByLabelText("Email"), "u@e.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("button", { name: "Logging in..." })).toBeDisabled();
  });
});

