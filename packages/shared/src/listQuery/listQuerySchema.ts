import { z } from "zod";

export const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']).optional(),
  applied_from: z.coerce.date().optional(),
  applied_to: z.coerce.date().optional(),
});