import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler
} from "fastify-type-provider-zod";

import candidatesRoutes from "./routes/candidate.routes";
import applicationRoutes from "./routes/application.routes";
import dashboardRoutes from "./routes/dashboard.routes";

import { FastifyError } from "fastify";

// =========================
// APP INITIALIZATION
// =========================
export const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

// =========================
// CORS CONFIGURATION
// =========================
app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// =========================
// ZOD TYPE PROVIDER SETUP
// =========================
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// =========================
// HEALTH CHECK ROUTE
// =========================
app.get("/", async () => {
  return { message: "Server running" };
});

// =========================
// ROUTES REGISTRATION
// =========================
app.register(dashboardRoutes, { prefix: "/api/dashboard" });
app.register(candidatesRoutes, { prefix: "/api/candidate" });
app.register(applicationRoutes, { prefix: "/api/application" });

// =========================
// GLOBAL ERROR HANDLER
// =========================
app.setErrorHandler((error: FastifyError, request, reply) => {

  // Prisma unique constraint violation
  if (error.code === "P2002") {
    return reply.status(409).send({
      statusCode: 409,
      error: "Conflict",
      message: "Email already exists",
    });
  }

  // Prisma record not found
  if (error.code === "P2025") {
    return reply.status(404).send({
      message: "Record not found",
    });
  }

  // Fastify validation error
  if (error.statusCode === 400) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: error.message,
    });
  }

  // Not found error
  if (error.statusCode === 404) {
    return reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: error.message,
    });
  }

  // Generic fallback error
  return reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: error.message,
  });
});