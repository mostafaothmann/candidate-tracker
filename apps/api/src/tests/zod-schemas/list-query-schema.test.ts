import { describe, it, expect } from "vitest";
import { listQuerySchema } from "../../../../../packages/shared/src/listQuery/listQuerySchema";

// ─── listQuerySchema ─────────────────────────────────────────────────────────

describe("listQuerySchema", () => {

    it("passes with no fields (all have defaults or are optional)", () => {
        const result = listQuerySchema.safeParse({});
        expect(result.success).toBe(true);
        expect(result.data?.page).toBe(1);
        expect(result.data?.limit).toBe(10);
    });

    it("coerces page and limit from strings", () => {
        const result = listQuerySchema.safeParse({ page: "2", limit: "20" });
        expect(result.success).toBe(true);
        expect(result.data?.page).toBe(2);
        expect(result.data?.limit).toBe(20);
    });

    it("fails when page is less than 1", () => {
        const result = listQuerySchema.safeParse({ page: 0 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("page");
    });

    it("fails when limit is less than 1", () => {
        const result = listQuerySchema.safeParse({ limit: 0 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("limit");
    });

    it("fails when limit exceeds 100", () => {
        const result = listQuerySchema.safeParse({ limit: 101 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("limit");
    });

    it("passes with a valid search string", () => {
        const result = listQuerySchema.safeParse({ search: "john" });
        expect(result.success).toBe(true);
        expect(result.data?.search).toBe("john");
    });

    it.each(["applied", "screening", "interview", "offer", "hired", "rejected"])(
        "passes with status = '%s'",
        (status) => {
            const result = listQuerySchema.safeParse({ status });
            expect(result.success).toBe(true);
            expect(result.data?.status).toBe(status);
        }
    );

    it("fails when status is invalid", () => {
        const result = listQuerySchema.safeParse({ status: "pending" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("status");
    });

    it("passes with valid applied_from and applied_to dates", () => {
        const result = listQuerySchema.safeParse({
            applied_from: "2024-01-01",
            applied_to: "2024-12-31",
        });
        expect(result.success).toBe(true);
        expect(result.data?.applied_from).toBeInstanceOf(Date);
        expect(result.data?.applied_to).toBeInstanceOf(Date);
    });

    it("fails when applied_from is not a valid date", () => {
        const result = listQuerySchema.safeParse({ applied_from: "not-a-date" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("applied_from");
    });

    it("fails when applied_to is not a valid date", () => {
        const result = listQuerySchema.safeParse({ applied_to: "not-a-date" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("applied_to");
    });

    it("passes with all fields provided", () => {
        const result = listQuerySchema.safeParse({
            page: "1",
            limit: "25",
            search: "john",
            status: "interview",
            applied_from: "2024-01-01",
            applied_to: "2024-12-31",
        });
        expect(result.success).toBe(true);
    });
});