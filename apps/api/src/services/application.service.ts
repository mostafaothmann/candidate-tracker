import { CreateApplicationDTO, UpdateApplicationDTO } from "@/packages/shared/src/application/application.dto";
import { prisma } from "../db/prisma";
import { ApplicationStatus, ApplicationStatusEnum } from "@/packages/shared/src/application/application.schema";
import { Prisma } from "../generated/prisma/client";
import { gte, lte, string } from "zod";

//helpers
//helper for grouping applications by week 
function getWeekKey(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // shift to Sunday-based week (optional)
    const day = d.getDay() || 7;
    if (day !== 1) {
        d.setDate(d.getDate() - (day - 1));
    }

    return d.toISOString().split('T')[0]; // week start
}
const applicationService = {

    //Basic Services
    async list(page = 1, limit = 10, search = "", status?: ApplicationStatus, applied_from?: Date, applied_to?: Date) {
        const skip = (page - 1) * limit;
        const where: Prisma.ApplicationWhereInput = {
            deleted_at: null,
            ...(applied_from || applied_to ? {
                applied_at: {
                    ...(applied_from ? { gte: applied_from } : {}),
                    ...(applied_to ? { lte: applied_to } : {}),
                }
            } : {}),
            ...(status ? { status } : {}),
            ...(search && {
                OR: [
                    //application fields
                    { job_title: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { company: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { source: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    //candidate  fields
                    { candidate: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { candidate: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { candidate: { location: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                ],
            }),
        };
        const [data, total] = await Promise.all([
            prisma.application.findMany({
                where,
                skip,
                take: limit,
                include: {
                    candidate:
                    {
                        select: {
                            name: true,
                        }
                    }
                }
            }),
            prisma.application.count({
                where,
            }),
        ]);
        return {
            data: data.map(({ candidate, ...rest }) => ({
                ...rest,
                candidate_name: candidate.name,
            })),
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    },

    async create(data: CreateApplicationDTO) {
        const candidate = await prisma.candidate.findFirst({
            where: { id: data.candidate_id, deleted_at: null }
        });

        if (!candidate)
            throw { code: "P2025" };

        return prisma.application.create({
            data: {
                ...data,
                status: data.status ?? "applied"
            }
        });
    },

    async detail(id: string) {
        return await prisma.application.findFirst({ where: { id, deleted_at: null } })
    },
    async update(id: string, updatedCandiate: UpdateApplicationDTO) {
        //for error handling not found application
        let application = await prisma.application.findFirst({ where: { id, deleted_at: null } })

        if (!application)
            throw { code: "P2025" };

        return prisma.application.update({
            where: { id },
            data: updatedCandiate,
        });
    },
    async delete(id: string) {
        //for error handling not found application
        let application = await prisma.application.findFirst({ where: { id, deleted_at: null } })
        if (!application)
            return null;
        return prisma.application.update({
            where: { id },
            data: {
                deleted_at: new Date(),
            },
        });
    },
    //Dashboard Services
    async total() {
        return await prisma.application.count({ where: { deleted_at: null } });
    },
    async hiredThisMonth() {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        return await prisma.application.count({
            where: {
                deleted_at: null,
                status: ApplicationStatusEnum.hired,
                updated_at: {
                    gte: startOfMonth
                }
            }
        });
    },
    async latestApplications() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const data = await prisma.application.findMany({
            where: {
                deleted_at: null,
                applied_at: {
                    gte: oneWeekAgo
                }
            },
            take: 5,
            include: {
                candidate: {
                    select: {
                        name: true,
                    }
                }
            }
        });
        return data.map(({ candidate, ...rest }) => ({
            ...rest,
            candidate_name: candidate.name,
        }))
    },
    async applicationByStatus(status: ApplicationStatus) {
        return await prisma.application.count({
            where: {
                status: status, deleted_at: null
            }
        });
    },
    async rejectionRate() {
        const rejected = await prisma.application.count({
            where: {
                status: ApplicationStatusEnum.rejected,
                deleted_at: null
            }
        });
        const all = await prisma.application.count({
            where: {
                deleted_at: null
            }
        });
        if (all == 0)
            return 0;
        else {
            console.log(rejected)
            console.log(all)
            return ((rejected / all) * 100)
        };
    },
    async statusDistribuation() {
        return await prisma.application.groupBy(
            {
                by: ["status"],
                where: { deleted_at: null },
                _count: true
            });
    },
    async applicationGroupedByStatus() {
        const rejected = await prisma.application.count({
            where: {
                status: ApplicationStatusEnum.rejected,
                deleted_at: null
            }
        });
        const applied = await prisma.application.count({
            where: {
                status: ApplicationStatusEnum.applied,
                deleted_at: null
            }
        });
        if (applied == 0)
            return 0;
        else
            return rejected / applied;
    },
    async applicationGroupedByWeek() {
        const now = new Date();
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(now.getDate() - 7 * 8);

        const applications = await prisma.application.findMany({
            where: {
                AND: [
                    { deleted_at: null },
                    { applied_at: { gte: eightWeeksAgo } }
                ]
            },
            select: {
                applied_at: true
            }
        })
        const grouped: Record<string, number> = {};
        for (const app of applications) {
            const week = getWeekKey(app.applied_at);

            if (!grouped[week]) {
                grouped[week] = 0;
            }

            grouped[week]++;
        }

        return grouped;
    },
    async search(searchText: string) {
        return await prisma.application.findMany({
            include: {
                candidate: true
            },
            where: {
                AND: [
                    { deleted_at: null },
                    {
                        candidate: {
                            deleted_at: null,
                        },
                    },
                    {
                        OR: [
                            { job_title: { contains: searchText } },
                            { company: { contains: searchText } },
                            { source: { contains: searchText } },
                            { notes: { contains: searchText } },
                            {
                                candidate: {
                                    OR: [
                                        {
                                            name: { contains: searchText },
                                            eamil: { contains: searchText },
                                            location: { contains: searchText }
                                        }]
                                }
                            }
                        ]
                    }
                ]
            },

        })
    },

}

export default applicationService;