import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../db/prisma";

const TEST_EMAIL = "post.application@test.com";
let candidateId: string;

describe("POST /api/application/create", () => {
    beforeAll(async () => {
        await app.ready();

        // Clean up before test
        await prisma.application.deleteMany({
            where: { candidate: { email: TEST_EMAIL } },
        });
        await prisma.candidate.deleteMany({
            where: { email: TEST_EMAIL },
        });

        // Create a candidate to link applications to
        const candidateRes = await request(app.server)
            .post("/api/candidate/create")
            .send({ name: "Post App Test", email: TEST_EMAIL });

        candidateId = candidateRes.body.data?.id || candidateRes.body.id;
    });

    afterAll(async () => {
        await prisma.application.deleteMany({
            where: { candidate: { email: TEST_EMAIL } },
        });
        await prisma.candidate.deleteMany({
            where: { email: TEST_EMAIL },
        });
    });

    it("should return 201 with valid candidate_id", async () => {
        const res = await request(app.server)
            .post("/api/application/create")
            .send({
                candidate_id: candidateId,
                job_title: "Frontend Developer",
                company: "Acme",
                status: "applied",
                applied_at: new Date().toISOString(),
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("data");
        expect(res.body.data.job_title).toBe("Frontend Developer");
        expect(res.body.data.company).toBe("Acme");
        expect(res.body.data.candidate_id).toBe(candidateId);
    });

    it("should return 400 when job_title is missing", async () => {
        const res = await request(app.server)
            .post("/api/application/create")
            .send({
                candidate_id: candidateId,
                company: "Acme",
                applied_at: new Date().toISOString(),
            });

        expect(res.status).toBe(400);
    });

    it("should return 400 when company is missing", async () => {
        const res = await request(app.server)
            .post("/api/application/create")
            .send({
                candidate_id: candidateId,
                job_title: "Frontend Developer",
                applied_at: new Date().toISOString(),
            });

        expect(res.status).toBe(400);
    });

    it("should return 400 when applied_at is missing", async () => {
        const res = await request(app.server)
            .post("/api/application/create")
            .send({
                candidate_id: candidateId,
                job_title: "Frontend Developer",
                company: "Acme",
            });

        expect(res.status).toBe(400);
    });

    it("should return 400 when candidate_id is not a valid UUID", async () => {
        const res = await request(app.server)
            .post("/api/application/create")
            .send({
                candidate_id: "not-a-uuid",
                job_title: "Frontend Developer",
                company: "Acme",
                applied_at: new Date().toISOString(),
            });

        expect(res.status).toBe(400);
    });

    it("should return 404 with unknown candidate_id", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";

        const res = await request(app.server)
            .post("/api/application/create")
            .send({
                candidate_id: fakeId,
                job_title: "Frontend Developer",
                company: "Acme",
                applied_at: new Date().toISOString(),
            });

        expect(res.status).toBe(404);
    });
});