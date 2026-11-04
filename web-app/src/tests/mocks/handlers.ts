import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://localhost:8000/api/me", () =>
    HttpResponse.json({ error: "Not authenticated" }, { status: 401 })
  ),
];

