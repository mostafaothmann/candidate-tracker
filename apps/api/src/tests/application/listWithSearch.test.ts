import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../db/prisma";


const TEST_EMAIL = "john.search@test.com";

describe("GET /api/application/list (search)", () => {
  beforeAll(async () => {
    await app.ready();

    await prisma.application.deleteMany({
      where: { candidate: { email: TEST_EMAIL } },
    });
    await prisma.candidate.deleteMany({
      where: { email: TEST_EMAIL },
    });
  });

  afterAll(async () => {
    await prisma.application.deleteMany({
      where: { candidate: { email: TEST_EMAIL } },
    });
    await prisma.candidate.deleteMany({
      where: { email: TEST_EMAIL },
    });
  });

  it("should return applications matching candidate name", async () => {
    const candidateRes = await request(app.server)
      .post("/api/candidate/create")
      .send({ name: "John Search", email: TEST_EMAIL });

    expect(candidateRes.status).toBe(201);

    const candidateId = candidateRes.body.data?.id || candidateRes.body.id;
    expect(candidateId).toBeDefined();

    const applicationRes = await request(app.server)
      .post("/api/application/create")
      .send({
        candidate_id: candidateId,
        job_title: "Frontend Developer",
        company: "TestCorp",
        status: "applied",
        applied_at: new Date().toISOString(),
      });

    expect(applicationRes.status).toBe(201);

    const res = await request(app.server).get(
      "/api/application/list?search=john"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);

    const match = res.body.data.some((app: any) =>
      app.candidate_name?.toLowerCase().includes("john")
    );

    expect(match).toBe(true);
  });
});