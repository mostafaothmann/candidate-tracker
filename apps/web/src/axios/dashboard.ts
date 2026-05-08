import { api } from "./client";

import type { ApplicationStatus } from "../../../../packages/shared/src/application/application.schema";

/**
 * Dashboard API
 *
 * Provides metrics and analytics data for dashboard UI.
 * Includes totals, charts, and filtered application insights.
 */

/**
 * Get total number of candidates.
 */
export const getTotalCandidates = async () => {
    const res = await api.get("/api/dashboard/candidate/total");
    return res.data.data;
};

/**
 * Get total number of applications.
 */
export const getTotalApplications = async () => {
    const res = await api.get("/api/dashboard/application/total");
    return res.data.data;
};

/**
 * Get number of applications marked as hired this month.
 */
export const getHiredThisMonth = async () => {
    const res = await api.get("/api/dashboard/hiredThisMonth");
    return res.data.data;
};

/**
 * Get rejection rate across all applications.
 */
export const getRejectionRate = async () => {
    const res = await api.get("/api/dashboard/rejectionRate");
    return res.data.data;
};

/**
 * Get distribution of applications by status.
 * Used for pie/doughnut charts.
 */
export const getStatusDistribuation = async () => {
    const res = await api.get("/api/dashboard/statusDistribuation");
    return res.data.data;
};

/**
 * Get latest applications for dashboard preview.
 */
export const getLatestApplications = async () => {
    const res = await api.get("/api/dashboard/latestApplications");
    return res.data.data;
};

/**
 * Get applications grouped by week.
 * Used for line chart (applications over time).
 */
export const getApplicationsGroupedByWeek = async () => {
    const res = await api.get("/api/dashboard/applicationGroupedByWeek");
    return res.data.data;
};

/**
 * Get applications filtered by status.
 */
export const getApplicationsByStatus = async (status: ApplicationStatus) => {
    const res = await api.get("/api/dashboard/applicationByStatus", {
        params: { status },
    });

    return res.data.data;
};