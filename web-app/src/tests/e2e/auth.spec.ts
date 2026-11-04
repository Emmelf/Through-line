import { expect, test } from "@playwright/test";

const password = "Password123!";
const uniqueUser = () => {
  const id = `${Date.now().toString(36)}${Math.floor(Math.random() * 36 ** 2).toString(36)}`;
  return { email: `e2e_${id}@example.com`, username: `u${id}` };
};

const fillRegister = async (page: import("@playwright/test").Page, u: { email: string; username: string }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill(u.email);
  await page.getByLabel("Username").fill(u.username);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm Password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();
};

const login = async (page: import("@playwright/test").Page, email: string, pwd: string) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(pwd);
  await page.locator("form").getByRole("button", { name: "Login", exact: true }).click();
};

test.describe("Auth flow (real Symfony API + MySQL)", () => {
  test("redirects guests from protected home to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("shows validation errors on empty register", async ({ page }) => {
    await page.goto("/register");
    // disable native "required" blocking so the app's own validation message shows
    await page.locator("form").evaluate((form) => form.setAttribute("novalidate", ""));
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText("All fields are required")).toBeVisible();
  });

  test("registers a new user and lands on home", async ({ page }) => {
    await fillRegister(page, uniqueUser());
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Welcome to")).toBeVisible();
  });

  test("rejects registering an existing email", async ({ page, request }) => {
    const u = uniqueUser();
    const res = await request.post("http://localhost:8000/api/register", {
      data: { email: u.email, username: u.username, password },
    });
    expect(res.status()).toBe(201);

    await fillRegister(page, { email: u.email, username: `${u.username}b` });
    await expect(page.getByText("User with this email already exists")).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    await login(page, "nobody@example.com", "wrong-password");
    await expect(page.getByText("Invalid credentials")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("login sets an httpOnly cookie, survives reload, and logout clears it", async ({ page, request, context }) => {
    const u = uniqueUser();
    const res = await request.post("http://localhost:8000/api/register", {
      data: { email: u.email, username: u.username, password },
    });
    expect(res.status()).toBe(201);

    await login(page, u.email, password);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(`${u.username} !`)).toBeVisible();

    const cookie = (await context.cookies()).find((c) => c.name === "BEARER");
    expect(cookie?.httpOnly).toBe(true);

    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(`${u.username} !`)).toBeVisible();

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });
});
