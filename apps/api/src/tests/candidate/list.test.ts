import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../app";

describe("GET /api/candidate/list", () => {
    beforeAll(async () => {
        await app.ready();
    });

    it("should return paginated candidates", async () => {
        const res = await request(app.server).get(
            "/api/candidate/list?page=1&limit=10"
        );

        expect(res.status).toBe(200);

        // expects paginated structure
        expect(res.body).toHaveProperty("data");
        expect(Array.isArray(res.body.data)).toBe(true);

        // optional but recommended checks
        expect(res.body).toHaveProperty("meta");
    });

    it("should filter by name", async () => {
        const res = await request(app.server).get(
            "/api/candidate/list?search=john"
        );

        expect(res.status).toBe(200);

        expect(res.body).toHaveProperty("data");
        expect(Array.isArray(res.body.data)).toBe(true);

        // optional: ensure filtering actually returns relevant results
        res.body.data.forEach((candidate: any) => {
            expect(candidate.name.toLowerCase()).toContain("john");
        });
    });
});