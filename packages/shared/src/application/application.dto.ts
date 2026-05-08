import { z } from "zod";
import { CreateApplicationSchema, ResponseApplicationSchema, UpdateApplicationSchema } from "./application.schema";

export type CreateApplicationDTO = z.infer<typeof CreateApplicationSchema>;
export type UpdateApplicationDTO = z.infer<typeof UpdateApplicationSchema>;
export type ResponseApplicationDTO = z.infer<typeof ResponseApplicationSchema>;