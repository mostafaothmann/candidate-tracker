import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../db/prisma";

const TEST_EMAIL = "post.application@test.com";
const TEST_NAME = "John Doe";
const DUP_EMAIL = "dup@test.com";

describe("Candidates API", () => {
  beforeAll(async () => {
    await app.ready();

    await prisma.candidate.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.candidate.deleteMany({ where: { email: DUP_EMAIL } });
  });

  afterAll(async () => {
    await prisma.candidate.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.candidate.deleteMany({ where: { email: DUP_EMAIL } });
  });

  it("should create candidate (201)", async () => {
    const res = await request(app.server)
      .post("/api/candidate/create")
      .send({
        name: TEST_NAME,
        email: TEST_EMAIL,
      });

    expect(res.status).toBe(201);
  });

  it("should fail invalid body (400)", async () => {
    const res = await request(app.server)
      .post("/api/candidate/create")
      .send({});

    expect(res.status).toBe(400);
  });

  it("should reject duplicate email (409)", async () => {
    await request(app.server)
      .post("/api/candidate/create")
      .send({ name: "John Doe", email: DUP_EMAIL });

    const res = await request(app.server)
      .post("/api/candidate/create")
      .send({ name: "John Two", email: DUP_EMAIL });

    expect(res.status).toBe(409);
  });
});