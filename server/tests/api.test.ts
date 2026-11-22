import request from "supertest";
import { describe, expect, it, vi } from "vitest";

// No database or generated Prisma client needed for these tests.
vi.mock("../src/prisma", () => ({ prisma: {} }));

import { app } from "../src/app";

// Cover health check, auth guard and input validation.
describe("API", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("rejects unauthenticated access to applications", async () => {
    const res = await request(app).get("/api/applications");
    expect(res.status).toBe(401);
  });

  it("rejects an invalid token", async () => {
    const res = await request(app).get("/api/applications").set("Authorization", "Bearer nope");
    expect(res.status).toBe(401);
  });

  it("validates registration payload", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "not-an-email", password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty("email");
    expect(res.body.details).toHaveProperty("password");
  });
});
