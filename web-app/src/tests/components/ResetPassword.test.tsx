import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { server } from "@/tests/mocks/server";

function renderForm(url = "/reset-password?token=abc123") {
  render(
    <MemoryRouter initialEntries={[url]}>
      <ResetPasswordForm />
    </MemoryRouter>
  );
}

async function fillAndSubmit(password: string, confirm: string) {
  await userEvent.type(screen.getByLabelText("New password"), password);
  await userEvent.type(screen.getByLabelText("Confirm password"), confirm);
  await userEvent.click(screen.getByRole("button", { name: "Reset password" }));
}

describe("ResetPasswordForm", () => {
  it("shows an invalid link message when the token is missing", () => {
    renderForm("/reset-password");

    expect(screen.getByText(/This reset link is invalid/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset password" })).not.toBeInTheDocument();
  });

  it("shows validation error for empty fields", async () => {
    renderForm();

    // fireEvent bypasses native "required" blocking so the JS validation is exercised
    fireEvent.submit(screen.getByRole("button", { name: "Reset password" }).closest("form")!);

    expect(await screen.findByText("Both password fields are required")).toBeInTheDocument();
  });

  it("shows validation error for a too short password", async () => {
    renderForm();

    await fillAndSubmit("short", "short");

    expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();
  });

  it("shows validation error when passwords do not match", async () => {
    renderForm();

    await fillAndSubmit("Password123!", "Different123!");

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("sends the token and new password, then shows success", async () => {
    let body: unknown;
    server.use(
      http.post("http://localhost:8000/api/reset-password", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ message: "ok" }, { status: 200 });
      })
    );

    renderForm();

    await fillAndSubmit("Password123!", "Password123!");

    expect(await screen.findByText(/Your password has been updated/)).toBeInTheDocument();
    expect(body).toEqual({ token: "abc123", password: "Password123!" });
  });

  it("shows the API error for an invalid or expired token", async () => {
    server.use(
      http.post("http://localhost:8000/api/reset-password", () =>
        HttpResponse.json({ error: "Invalid or expired token" }, { status: 400 })
      )
    );

    renderForm();

    await fillAndSubmit("Password123!", "Password123!");

    expect(await screen.findByText("Invalid or expired token")).toBeInTheDocument();
  });
});
