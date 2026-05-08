import { FastifyInstance } from "fastify";
import applicationController from "../controllers/application.controller";
import candidateController from "../controllers/candidate.controller";
import z from "zod";
import { ApplicationStatus, ApplicationStatusQuerySchema } from "@/packages/shared/src/application/application.schema";


export default async function dashboardRoutes(fastify: FastifyInstance) {
    //Dashboard Endpoints
    fastify.get('/candidate/total', candidateController.total);
    fastify.get('/application/total', applicationController.total);
    fastify.get('/applicationByStatus',
        {
            schema: {
                querystring: z.object({
                    status: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']),
                }),
            }
        },
        applicationController.applicationByStatus);
    fastify.get('/hiredThisMonth', applicationController.hiredThisMonth);
    fastify.get('/rejectionRate', applicationController.rejectionRate);
    fastify.get('/latestApplications', applicationController.latestApplications);
    //Charts
    fastify.get('/statusDistribuation', applicationController.statusDistribuation);
    fastify.get('/applicationGroupedByWeek', applicationController.applicationGroupedByWeek);
}
