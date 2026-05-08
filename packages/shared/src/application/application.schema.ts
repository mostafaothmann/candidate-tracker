import { z } from "zod";

export const ApplicationStatusEnum = {
    applied: 'applied',
    screening: 'screening',
    interview: 'interview',
    offer: 'offer',
    hired: 'hired',
    rejected: 'rejected'
} as const

export type ApplicationStatus = typeof ApplicationStatusEnum[keyof typeof ApplicationStatusEnum]

export const ApplicationStatusQuerySchema = z.object({
    status: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'])
});

export const CreateApplicationSchema = z.object({
    candidate_id: z.string().uuid(),
    job_title: z.string().min(1),
    company: z.string().min(1),
    status: z.nativeEnum(ApplicationStatusEnum).optional(),
    applied_at: z.coerce.date(),
    salary_expectation: z.number().int().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
});

export const UpdateApplicationSchema = z.object({
    candidate_id: z.string().uuid().optional(),
    job_title: z.string().min(1).optional(),
    company: z.string().min(1).optional(),
    status: z.nativeEnum(ApplicationStatusEnum).optional(),
    applied_at: z.coerce.date().optional(),
    salary_expectation: z.number().int().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});

export const ResponseApplicationSchema = z.object({
    id: z.string().uuid(),
    candidate_id: z.string().uuid(),
    job_title: z.string().min(1),
    candidate_name: z.string().min(1),
    company: z.string().min(1),
    status: z.nativeEnum(ApplicationStatusEnum).optional(),
    applied_at: z.coerce.date(),
    salary_expectation: z.number().int().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
    created_at: z.date()
});

