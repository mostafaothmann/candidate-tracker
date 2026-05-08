import { ApplicationStatusQuerySchema, CreateApplicationSchema } from '../../../../packages/shared/src/application/application.schema';
import { ApplicationStatus } from "@/packages/shared/src/application/application.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import applicationService from "../services/application.service";
import { CreateApplicationDTO, UpdateApplicationDTO } from '@/packages/shared/src/application/application.dto';
import z, { string } from 'zod';
import { listQuerySchema } from '@/packages/shared/src/listQuery/listQuerySchema';

const applicationController = {
    //Basic Controllers
    async list(
        req: FastifyRequest<{ Querystring: z.infer<typeof listQuerySchema> }>,
        rep: FastifyReply
    ) {
        const data = await applicationService.list(
            req.query.page,
            req.query.limit,
            req.query.search,
            req.query.status,
            req.query.applied_from,
            req.query.applied_to);
        return rep.send(data);
    },
    async create(req: FastifyRequest<{ Body: CreateApplicationDTO }>, rep: FastifyReply): Promise<void> {
        const data = await applicationService.create(req.body);
        return rep.status(201).send({data});
    },
    async detail(
        req: FastifyRequest<{ Params: { id: string } }>,
        rep: FastifyReply
    ) {
        const data = await applicationService.detail(req.params.id);
        return rep.send({data});
    },
    async update(
        req: FastifyRequest<
            {
                Params: { id: string };
                Body: UpdateApplicationDTO
            }>,
        rep: FastifyReply
    ) {
        const data = await applicationService.update(req.params.id, req.body);
        return rep.send({data});
    },
    async delete(
        req: FastifyRequest<{ Params: { id: string } }>,
        rep: FastifyReply
    ) {
        const data = await applicationService.delete(req.params.id);
        return rep.send({data});
    },
    //Dashboard Controllers
    async total(
        req: FastifyRequest,
        rep: FastifyReply): Promise<void> {
        const data = await applicationService.total();
        return rep.send({data});
    },
    async applicationByStatus(
        req: FastifyRequest<{ Querystring: { status: ApplicationStatus } }>,
        rep: FastifyReply): Promise<void> {
        const data = await applicationService.applicationByStatus(req.query.status);
        return rep.send({data});
    },
    async hiredThisMonth(
        req: FastifyRequest,
        rep: FastifyReply): Promise<void> {
        const data = await applicationService.hiredThisMonth();
        return rep.send({data});
    },
    async rejectionRate(
        req: FastifyRequest,
        rep: FastifyReply): Promise<void> {
        const data = await applicationService.rejectionRate();
        return rep.send({data});
    },
    async latestApplications(
        req: FastifyRequest,
        rep: FastifyReply): Promise<void> {
        const data = await applicationService.latestApplications();
        return rep.send({data});
    },
    //Chart 
    async statusDistribuation(
        req: FastifyRequest,
        rep: FastifyReply): Promise<void> {
        const data = await applicationService.statusDistribuation();
        return rep.send({data});
    },
    async applicationGroupedByWeek(
        req: FastifyRequest,
        rep: FastifyReply): Promise<void> {
        const data = await applicationService.applicationGroupedByWeek();
        return rep.send({data});
    },
    async search(
        req: FastifyRequest<{ Body: string }>,
        rep: FastifyReply): Promise<void> {
        const searchString = z.string().parse(req.body)
        const data = await applicationService.search(searchString);
        return rep.send({data});
    }
}

export default applicationController;
