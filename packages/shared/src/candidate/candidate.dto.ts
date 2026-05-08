import { z } from "zod";
import { CreateCandidateSchema, ResponseCandidateSchema, UpdateCandidateSchema } from "./candidate.schema";

export type CreateCandidateDTO = z.infer<typeof CreateCandidateSchema>;
export type UpdateCandidateDTO = z.infer<typeof UpdateCandidateSchema>;
export type ResponseCandidateDTO = z.infer<typeof ResponseCandidateSchema>