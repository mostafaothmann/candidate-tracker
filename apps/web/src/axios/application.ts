import { api } from "./client";

import type { ApplicationStatus } from "../../../../packages/shared/src/application/application.schema";
import type {
    CreateApplicationDTO,
    UpdateApplicationDTO,
} from "../../../../packages/shared/src/application/application.dto";

/**
 * Fetch paginated applications with optional filters.
 *
 * Supports:
 * - Pagination (page)
 * - Search (candidate, job, company)
 * - Status filtering
 * - Date range filtering (applied_from / applied_to)
 */
export const getApplications = async (
    page: number,
    search: string,
    status?: ApplicationStatus,
    applied_from?: Date,
    applied_to?: Date
) => {
    const res = await api.get("/api/application/list", {
        params: {
            page,
            limit: 10,
            ...(search ? { search } : {}),
            ...(status ? { status } : {}),
            ...(applied_from ? { applied_from } : {}),
            ...(applied_to ? { applied_to } : {}),
        },
    });

    return res.data;
};

/**
 * Fetch a single application by ID.
 */
export const getApplicationDetail = async (id: string) => {
    const res = await api.get(`/api/application/detail/${id}`);
    return res.data.data;
};

/**
 * Create a new application.
 */
export const createApplication = async (createdApplication: CreateApplicationDTO) => {
    const res = await api.post("/api/application/create", createdApplication);
    return res.data.data;
};

/**
 * Update an existing application by ID.
 */
export const updateApplication = async (
    id: string,
    updatedApplication: UpdateApplicationDTO
) => {
    const res = await api.patch(`/api/application/update/${id}`, updatedApplication);
    return res.data.data;
};

/**
 * Delete an application by ID.
 */
export const deleteApplication = async (id: string) => {
    const res = await api.delete(`/api/application/delete/${id}`);
    return res.data.data;
};