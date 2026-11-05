import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { server } from "@/tests/mocks/server";

function renderForm() {
  render(
    <MemoryRouter>
      <ForgotPasswordForm />
    </MemoryRouter>
  );
}

describe("ForgotPasswordForm", () => {
  it("shows validation error for empty email", async () => {
    renderForm();

    // fireEvent bypasses native "required" blocking so the JS validation is exercised
    fireEvent.submit(screen.getByRole("button", { name: "Send reset link" }).closest("form")!);

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    fireEvent.submit(screen.getByRole("button", { name: "Send reset link" }).closest("form")!);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("shows the confirmation message after a successful request", async () => {
    server.use(
      http.post("http://localhost:8000/api/forgot-password", () =>
        HttpResponse.json({ message: "sent" }, { status: 200 })
      )
    );

    renderForm();

    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(
      await screen.findByText("If an account exists for this email, a reset link has been sent.")
    ).toBeInTheDocument();
  });

  it("shows the API error when the request fails", async () => {
    server.use(
      http.post("http://localhost:8000/api/forgot-password", () =>
        HttpResponse.json({ error: "Email is required" }, { status: 422 })
      )
    );

    renderForm();

    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  it("disables the submit button while loading", async () => {
    server.use(
      http.post("http://localhost:8000/api/forgot-password", async () => {
        await delay(120);
        return HttpResponse.json({ message: "sent" });
      })
    );

    renderForm();

    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
  });
});
