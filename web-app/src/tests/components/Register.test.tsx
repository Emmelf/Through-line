import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignupForm } from "@/components/auth/signup-form";
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

function renderRegister() {
  render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>
  );
}

describe("SignupForm", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSetUser.mockReset();
  });

  it("shows validation error for empty form", async () => {
    renderRegister();

    // fireEvent bypasses native "required" blocking so the JS validation is exercised
    fireEvent.submit(screen.getByRole("button", { name: "Create Account" }).closest("form")!);

    expect(await screen.findByText("All fields are required")).toBeInTheDocument();
  });

  it("shows API error when email already exists", async () => {
    server.use(
      http.post("http://localhost:8000/api/register", () =>
        HttpResponse.json({ error: "User with this email already exists" }, { status: 409 })
      )
    );

    renderRegister();

    await userEvent.type(screen.getByLabelText("Email"), "existing@example.com");
    await userEvent.type(screen.getByLabelText("Username"), "existing-user");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.type(screen.getByLabelText("Confirm Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("User with this email already exists")).toBeInTheDocument();
  });

  it("registers successfully and redirects", async () => {
    const user = { id: "1", email: "new@example.com", username: "new-user", roles: ["ROLE_USER"] };
    server.use(
      http.post("http://localhost:8000/api/register", () =>
        HttpResponse.json({ user, message: "User registered successfully" }, { status: 201 })
      )
    );

    renderRegister();

    await userEvent.type(screen.getByLabelText("Email"), "new@example.com");
    await userEvent.type(screen.getByLabelText("Username"), "new-user");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.type(screen.getByLabelText("Confirm Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(user);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});

