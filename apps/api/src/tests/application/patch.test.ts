import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../db/prisma";

const TEST_EMAIL = "patch.application@test.com";
let applicationId: string;

describe("PATCH /api/application/update/:id", () => {
  beforeAll(async () => {
    await app.ready();

    await prisma.application.deleteMany({
      where: { candidate: { email: TEST_EMAIL } },
    });
    await prisma.candidate.deleteMany({
      where: { email: TEST_EMAIL },
    });

    // Create candidate
    const candidateRes = await request(app.server)
      .post("/api/candidate/create")
      .send({ name: "Patch Test", email: TEST_EMAIL });

    const candidateId = candidateRes.body.data?.id || candidateRes.body.id;

    // Create application
    const applicationRes = await request(app.server)
      .post("/api/application/create")
      .send({
        candidate_id: candidateId,
        job_title: "Backend Developer",
        company: "PatchCorp",
        status: "applied",
        applied_at: new Date().toISOString(),
      });

    applicationId = applicationRes.body.data?.id || applicationRes.body.id;
  });

  afterAll(async () => {
    await prisma.application.deleteMany({
      where: { candidate: { email: TEST_EMAIL } },
    });
    await prisma.candidate.deleteMany({
      where: { email: TEST_EMAIL },
    });
  });

  it("should return 200 and updated data on valid update", async () => {
    const res = await request(app.server)
      .patch(`/api/application/update/${applicationId}`)
      .send({ status: "interview", job_title: "Senior Backend Developer" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.status).toBe("interview");
    expect(res.body.data.job_title).toBe("Senior Backend Developer");
  });

  it("should return 404 on unknown application ID", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app.server)
      .patch(`/api/application/update/${fakeId}`)
      .send({ status: "rejected" });

    expect(res.status).toBe(404);
  });
});