import { z } from "zod";

export const CreateCandidateSchema = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  notes: z.string().optional(),
});
export const UpdateCandidateSchema = z.object({
  name: z.string().min(5).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  notes: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

export const ResponseCandidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  notes: z.string().optional(),
  created_at: z.date(),
});
