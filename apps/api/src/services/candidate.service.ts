import { CreateCandidateDTO, UpdateCandidateDTO } from "@/packages/shared/src/candidate/candidate.dto";
import { prisma } from "../db/prisma";
import { Prisma } from "../generated/prisma/client";

const candidateService = {
    //Basic Services
    async list(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;
        const where: Prisma.CandidateWhereInput = {
            deleted_at: null,
            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive
                        },
                    },
                    {
                        location: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive
                        },
                    },
                    {
                        phone: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive
                        },
                    },
                ],
            }),
        };
        const [data, total] = await Promise.all([
            prisma.candidate.findMany({
                where,
                skip,
                take: limit,
            }),
            prisma.candidate.count({
                where,
            }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    },

    async create(candidate: CreateCandidateDTO) {
        return await prisma.candidate.create({ data: candidate })
    },
    async detail(id: string) {
        return await prisma.candidate.findFirst(
            {
                where: { deleted_at: null, id: id },
                include: {
                    applications: {
                        where: {
                            deleted_at: null,
                        }
                    }
                }
            })
    },
    async update(id: string, updatedCandiate: UpdateCandidateDTO) {
        //for error handling not found candidate
        let candidate = await prisma.candidate.findFirst({ where: { id, deleted_at: null } })

        if (!candidate)
            throw { code: "P2025" }; 

        return prisma.candidate.update({
            where: { id },
            data: updatedCandiate,
        });
    },

    async delete(id: string) {
        //for error handling not found candidate
        let candidate = await prisma.candidate.findFirst({ where: { id, deleted_at: null } })
        if (!candidate)
            return null;
        return prisma.candidate.update({
            where: { id },
            data: {
                deleted_at: new Date(),
            },
        });
    },
    //Dashboard Services
    async total() {
        return await prisma.candidate.count({ where: { deleted_at: null } });
    },
}

export default candidateService;