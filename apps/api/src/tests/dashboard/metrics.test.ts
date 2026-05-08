import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../app";

describe("GET /api/dashboard", () => {
  beforeAll(async () => {
    await app.ready();
  });

  it("should return total candidates as a number", async () => {
    const res = await request(app.server).get("/api/dashboard/candidate/total");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.data).toBe("number");
  });

  it("should return total applications as a number", async () => {
    const res = await request(app.server).get("/api/dashboard/application/total");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.data).toBe("number");
  });

  it("should return applications by status with a valid status query", async () => {
    const res = await request(app.server).get(
      "/api/dashboard/applicationByStatus?status=applied"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("should return 400 on invalid status query", async () => {
    const res = await request(app.server).get(
      "/api/dashboard/applicationByStatus?status=invalid_status"
    );

    expect(res.status).toBe(400);
  });

  it("should return hired this month as a number", async () => {
    const res = await request(app.server).get("/api/dashboard/hiredThisMonth");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.data).toBe("number");
  });

  it("should return rejection rate as a number", async () => {
    const res = await request(app.server).get("/api/dashboard/rejectionRate");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.data).toBe("number");
  });

  it("should return latest applications as an array", async () => {
    const res = await request(app.server).get("/api/dashboard/latestApplications");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});