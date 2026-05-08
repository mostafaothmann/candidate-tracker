import { FastifyInstance } from "fastify";
import applicationController from "../controllers/application.controller";
import z, { Schema } from "zod";
import { CreateApplicationSchema, UpdateApplicationSchema } from "@/packages/shared/src/application/application.schema";
import { listQuerySchema } from "@/packages/shared/src/listQuery/listQuerySchema";


export default async function applicationRoutes(fastify: FastifyInstance) {
    //Basic Endpoints
    fastify.get('/list',
        {
            schema: {
                querystring: listQuerySchema,
            },
        },
        applicationController.list);
    fastify.post('/create', {
        schema: {
            body: CreateApplicationSchema
        },
    }, applicationController.create);
    fastify.get('/detail/:id', {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        }
    }, applicationController.detail);
    fastify.patch('/update/:id', {
        schema: {
            body: UpdateApplicationSchema,
            params: z.object({
                id: z.string().uuid(),
            }),
        },
    }, applicationController.update);
    fastify.delete('/delete/:id', {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
    }, applicationController.delete);
    //Application Page Cross Entity Search 
    fastify.post('/search', {
        schema: {
            body: z.object({
                searchText: z.string(),
            }),
        },
    }, applicationController.search)
}
