import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { env } from "prisma/config";


const adapter = new PrismaPg({
  connectionString: env("DATABASE_URL"),
});

export const prisma = new PrismaClient({
  adapter,
});