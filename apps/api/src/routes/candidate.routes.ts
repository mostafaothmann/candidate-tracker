import { FastifyInstance } from "fastify";
import candidateController from "../controllers/candidate.controller";
import { CreateCandidateSchema, UpdateCandidateSchema } from "@/packages/shared/src/candidate/candidate.schema";
import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { listQuerySchema } from "@/packages/shared/src/listQuery/listQuerySchema";


export default async function candidatesRoutes(fastify: FastifyInstance) {
    //Basic Endpoints
    fastify.get('/list',
        {
            schema: {
                querystring: listQuerySchema,
            },
        }, candidateController.list);
    fastify.post('/create', {
        schema: {
            body: CreateCandidateSchema
        }
    }
        , candidateController.create);
    fastify.get('/detail/:id',
        {
            schema: {
                params: z.object({
                    id: z.string().uuid(),
                }),
            }
        },
        candidateController.detail);
    fastify.patch('/update/:id',
        {
            schema: {
                body: UpdateCandidateSchema,
                params: z.object({
                    id: z.string().uuid(),
                }),
            }
        }, candidateController.update);
    fastify.delete('/delete/:id',
        {
            schema: {
                params: z.object({
                    id: z.string().uuid(),
                }),
            }
        }, candidateController.delete);
}
