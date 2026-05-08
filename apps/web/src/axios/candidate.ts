import { api } from "./client";

import type {
    CreateCandidateDTO,
    UpdateCandidateDTO,
} from "../../../../packages/shared/src/candidate/candidate.dto";

/**
 * Fetch paginated candidates with optional search.
 *
 * Supports:
 * - Pagination (page)
 * - Search by name/email/other fields
 */
export const getCandidates = async (page: number, search: string) => {
    const res = await api.get("/api/candidate/list", {
        params: {
            page,
            limit: 10,
            search: search ?? "",
        },
    });

    return res.data.data;
};

/**
 * Create a new candidate.
 */
export const createCandidate = async (createdCandidate: CreateCandidateDTO) => {
    const res = await api.post("/api/candidate/create", createdCandidate);
    return res.data.data;
};

/**
 * Fetch candidate details by ID.
 */
export const getCandidateDetail = async (id: string) => {
    const res = await api.get(`/api/candidate/detail/${id}`);
    return res.data.data;
};

/**
 * Update an existing candidate by ID.
 */
export const updateCandidate = async (
    id: string,
    updatedCandidate: UpdateCandidateDTO
) => {
    const res = await api.patch(`/api/candidate/update/${id}`, updatedCandidate);
    return res.data.data;
};

/**
 * Delete a candidate by ID.
 */
export const deleteCandidate = async (id: string) => {
    const res = await api.delete(`/api/candidate/delete/${id}`);
    return res.data;
};