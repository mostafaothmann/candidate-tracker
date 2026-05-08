import { describe, it, expect } from "vitest";
import {
    CreateCandidateSchema,
    UpdateCandidateSchema,
    ResponseCandidateSchema,
} from "../../../../../packages/shared/src/candidate/candidate.schema";

const validUUID = "123e4567-e89b-12d3-a456-426614174000";

// ─── CreateCandidateSchema ───────────────────────────────────────────────────

describe("CreateCandidateSchema", () => {
    const valid = {
        name: "John Doe",
        email: "john@example.com",
    };

    it("passes with required fields only", () => {
        const result = CreateCandidateSchema.safeParse(valid);
        expect(result.success).toBe(true);
    });

    it("passes with all optional fields included", () => {
        const result = CreateCandidateSchema.safeParse({
            ...valid,
            phone: "0612345678",
            location: "Amsterdam",
            linkedin_url: "https://linkedin.com/in/johndoe",
            notes: "Strong candidate",
        });
        expect(result.success).toBe(true);
    });

    it("fails when name is shorter than 5 characters", () => {
        const result = CreateCandidateSchema.safeParse({ ...valid, name: "Jo" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("name");
    });

    it("fails when name is missing", () => {
        const { name, ...rest } = valid;
        const result = CreateCandidateSchema.safeParse(rest);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("name");
    });

    it("fails when email is invalid", () => {
        const result = CreateCandidateSchema.safeParse({ ...valid, email: "not-an-email" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("email");
    });

    it("fails when email is missing", () => {
        const { email, ...rest } = valid;
        const result = CreateCandidateSchema.safeParse(rest);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("email");
    });

    it("fails when linkedin_url is not a valid URL", () => {
        const result = CreateCandidateSchema.safeParse({ ...valid, linkedin_url: "not-a-url" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("linkedin_url");
    });
});

// ─── UpdateCandidateSchema ───────────────────────────────────────────────────

describe("UpdateCandidateSchema", () => {
    it("passes with a single valid field", () => {
        const result = UpdateCandidateSchema.safeParse({ name: "John Doe" });
        expect(result.success).toBe(true);
    });

    it("passes with multiple valid fields", () => {
        const result = UpdateCandidateSchema.safeParse({
            name: "John Doe",
            location: "Rotterdam",
        });
        expect(result.success).toBe(true);
    });

    it("fails when body is empty", () => {
        const result = UpdateCandidateSchema.safeParse({});
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("At least one field must be provided");
    });

    it("fails when name is shorter than 5 characters", () => {
        const result = UpdateCandidateSchema.safeParse({ name: "Jo" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("name");
    });

    it("fails when email is invalid", () => {
        const result = UpdateCandidateSchema.safeParse({ email: "bad-email" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("email");
    });

    it("fails when linkedin_url is not a valid URL", () => {
        const result = UpdateCandidateSchema.safeParse({ linkedin_url: "not-a-url" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("linkedin_url");
    });
});

// ─── ResponseCandidateSchema ─────────────────────────────────────────────────

describe("ResponseCandidateSchema", () => {
    const valid = {
        id: validUUID,
        name: "John Doe",
        email: "john@example.com",
        created_at: new Date(),
    };

    it("passes with required fields only", () => {
        const result = ResponseCandidateSchema.safeParse(valid);
        expect(result.success).toBe(true);
    });

    it("passes with all optional fields included", () => {
        const result = ResponseCandidateSchema.safeParse({
            ...valid,
            phone: "0612345678",
            location: "Rotterdam",
            linkedin_url: "https://linkedin.com/in/johndoe",
            notes: "Top candidate",
        });
        expect(result.success).toBe(true);
    });

    it("fails when id is not a valid UUID", () => {
        const result = ResponseCandidateSchema.safeParse({ ...valid, id: "bad-id" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("id");
    });

    it("fails when email is invalid", () => {
        const result = ResponseCandidateSchema.safeParse({ ...valid, email: "bad-email" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("email");
    });

    it("fails when linkedin_url is not a valid URL", () => {
        const result = ResponseCandidateSchema.safeParse({ ...valid, linkedin_url: "bad-url" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("linkedin_url");
    });

    it("fails when created_at is missing", () => {
        const { created_at, ...rest } = valid;
        const result = ResponseCandidateSchema.safeParse(rest);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("created_at");
    });

    it("fails when id is missing", () => {
        const { id, ...rest } = valid;
        const result = ResponseCandidateSchema.safeParse(rest);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("id");
    });
});