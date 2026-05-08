import { CreateCandidateSchema } from '../../../../packages/shared/src/candidate/candidate.schema';
import { FastifyReply, FastifyRequest } from "fastify";
import candidateService from "../services/candidate.service";
import { CreateCandidateDTO, UpdateCandidateDTO } from '@/packages/shared/src/candidate/candidate.dto';
import z from 'zod';
import { listQuerySchema } from '@/packages/shared/src/listQuery/listQuerySchema';

const candidateController = {
    //Basic Controllers
    async list(
        req: FastifyRequest<{ Querystring: z.infer<typeof listQuerySchema> }>,
        rep: FastifyReply
    ) {
        const data = await candidateService.list(req.query.page, req.query.limit, req.query.search);
        return rep.send(data);
    },
    async create(
        req: FastifyRequest<{ Body: CreateCandidateDTO }>,
        rep: FastifyReply): Promise<void> {
        const data = await candidateService.create(req.body);
        return rep.status(201).send({data});
    },
    async detail(
        req: FastifyRequest<{ Params: { id: string } }>,
        rep: FastifyReply
    ) {
        const data = await candidateService.detail(req.params.id);
        return rep.send({data});
    },
    async update(
        req: FastifyRequest<{ Params: { id: string }; Body: UpdateCandidateDTO }>,
        rep: FastifyReply
    ) {
        const data = await candidateService.update(req.params.id, req.body);
        return rep.send({data});
    },
    async delete(
        req: FastifyRequest<{ Params: { id: string } }>,
        rep: FastifyReply
    ) {
        const data = await candidateService.delete(req.params.id);
        return rep.send({data});
    },
    //Dashboard Controllers
    async total(
        req: FastifyRequest,
        rep: FastifyReply): Promise<void> {
        const data = await candidateService.total();
        return rep.send({data});
    }
}

export default candidateController;
