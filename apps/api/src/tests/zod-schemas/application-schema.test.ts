import { describe, it, expect } from "vitest";
import {
    ApplicationStatusQuerySchema,
    CreateApplicationSchema,
    UpdateApplicationSchema,
    ResponseApplicationSchema,
} from "../../../../../packages/shared/src/application/application.schema";

const validUUID = "123e4567-e89b-12d3-a456-426614174000";
const validDate = new Date().toISOString();

// ─── ApplicationStatusQuerySchema ───────────────────────────────────────────

describe("ApplicationStatusQuerySchema", () => {
    it("passes with a valid status", () => {
        const result = ApplicationStatusQuerySchema.safeParse({ status: "applied" });
        expect(result.success).toBe(true);
    });

    it.each(["applied", "screening", "interview", "offer", "hired", "rejected"])(
        "passes with status = '%s'",
        (status) => {
            const result = ApplicationStatusQuerySchema.safeParse({ status });
            expect(result.success).toBe(true);
        }
    );

    it("fails with an invalid status", () => {
        const result = ApplicationStatusQuerySchema.safeParse({ status: "pending" });
        expect(result.success).toBe(false);
    });

    it("fails when status is missing", () => {
        const result = ApplicationStatusQuerySchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

// ─── CreateApplicationSchema ─────────────────────────────────────────────────

describe("CreateApplicationSchema", () => {
    const valid = {
        candidate_id: validUUID,
        job_title: "Frontend Developer",
        company: "Acme",
        applied_at: validDate,
    };

    it("passes with all required fields", () => {
        const result = CreateApplicationSchema.safeParse(valid);
        expect(result.success).toBe(true);
    });

    it("passes with all optional fields included", () => {
        const result = CreateApplicationSchema.safeParse({
            ...valid,
            status: "applied",
            salary_expectation: 5000,
            source: "LinkedIn",
            notes: "Referred by John",
        });
        expect(result.success).toBe(true);
    });

    it("fails when candidate_id is not a valid UUID", () => {
        const result = CreateApplicationSchema.safeParse({ ...valid, candidate_id: "not-a-uuid" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("candidate_id");
    });

    it("fails when job_title is empty", () => {
        const result = CreateApplicationSchema.safeParse({ ...valid, job_title: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("job_title");
    });

    it("fails when company is empty", () => {
        const result = CreateApplicationSchema.safeParse({ ...valid, company: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("company");
    });

    it("fails when applied_at is not a valid date", () => {
        const result = CreateApplicationSchema.safeParse({ ...valid, applied_at: "not-a-date" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("applied_at");
    });

    it("fails when status is not a valid enum value", () => {
        const result = CreateApplicationSchema.safeParse({ ...valid, status: "pending" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("status");
    });

    it("fails when salary_expectation is a float", () => {
        const result = CreateApplicationSchema.safeParse({ ...valid, salary_expectation: 50.5 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("salary_expectation");
    });

    it("fails when candidate_id is missing", () => {
        const { candidate_id, ...rest } = valid;
        const result = CreateApplicationSchema.safeParse(rest);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("candidate_id");
    });
});

// ─── UpdateApplicationSchema ─────────────────────────────────────────────────

describe("UpdateApplicationSchema", () => {
    it("passes with a single valid field", () => {
        const result = UpdateApplicationSchema.safeParse({ status: "interview" });
        expect(result.success).toBe(true);
    });

    it("passes with multiple valid fields", () => {
        const result = UpdateApplicationSchema.safeParse({
            job_title: "Senior Developer",
            status: "offer",
            salary_expectation: 8000,
        });
        expect(result.success).toBe(true);
    });

    it("fails when body is empty", () => {
        const result = UpdateApplicationSchema.safeParse({});
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("At least one field must be provided");
    });

    it("fails when candidate_id is not a valid UUID", () => {
        const result = UpdateApplicationSchema.safeParse({ candidate_id: "bad-uuid" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("candidate_id");
    });

    it("fails when job_title is empty string", () => {
        const result = UpdateApplicationSchema.safeParse({ job_title: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("job_title");
    });

    it("fails when status is invalid", () => {
        const result = UpdateApplicationSchema.safeParse({ status: "unknown" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("status");
    });
});

// ─── ResponseApplicationSchema ───────────────────────────────────────────────

describe("ResponseApplicationSchema", () => {
    const valid = {
        id: validUUID,
        candidate_id: validUUID,
        job_title: "Backend Developer",
        candidate_name: "John Doe",
        company: "Corp",
        applied_at: validDate,
        created_at: new Date(),
    };

    it("passes with all required fields", () => {
        const result = ResponseApplicationSchema.safeParse(valid);
        expect(result.success).toBe(true);
    });

    it("fails when id is not a valid UUID", () => {
        const result = ResponseApplicationSchema.safeParse({ ...valid, id: "bad-id" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("id");
    });

    it("fails when candidate_name is empty", () => {
        const result = ResponseApplicationSchema.safeParse({ ...valid, candidate_name: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("candidate_name");
    });

    it("fails when created_at is missing", () => {
        const { created_at, ...rest } = valid;
        const result = ResponseApplicationSchema.safeParse(rest);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("created_at");
    });
});