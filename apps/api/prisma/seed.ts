import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// --- FIX ENV LOADING (monorepo-safe) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// --- PRISMA SETUP ---
import { PrismaPg } from "@prisma/adapter-pg";
import { ApplicationStatus, PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined. Check your .env path.");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

// --- DATA POOLS ---
const names = [
  "Alex Johnson", "Maria Garcia", "John Smith", "Emma Brown", "Liam Wilson",
  "Sophia Davis", "Noah Miller", "Olivia Taylor", "Ethan Anderson", "Ava Thomas",
  "James Moore", "Isabella Martin", "Lucas Lee", "Mia White", "Benjamin Harris",
  "Charlotte Clark", "Henry Lewis", "Amelia Walker", "Daniel Hall", "Harper Young"
];

const companies = [
  "Google", "Amazon", "Microsoft", "Meta", "Netflix",
  "Apple", "Spotify", "Airbnb", "Stripe", "Uber"
];

const jobTitles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Engineer",
  "Software Engineer",
  "DevOps Engineer"
];

const locations = [
  "Zurich", "Berlin", "London", "Paris", "New York",
  "San Francisco", "Toronto", "Amsterdam", "Lisbon", "Madrid"
];

const sources = ["LinkedIn", "Referral", "Indeed", "Company Website", "Glassdoor"];

const statuses: ApplicationStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
];

// --- HELPERS ---
function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- MAIN SEED ---
async function main() {
  console.log("🌱 Seeding database...");
  // Clean existing data before seeding
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();

  const candidates = [];

  // Create 20 candidates
  for (let i = 0; i < 20; i++) {
    const candidate = await prisma.candidate.create({
      data: {
        name: names[i],
        email: `user${i + 1}@example.com`,
        phone: `+41 79 000 00${i}`,
        location: random(locations),
        linkedin_url: `https://linkedin.com/in/user${i + 1}`,
        notes: "Auto-generated candidate",
      },
    });

    candidates.push(candidate);
  }

  // Create 4 applications per candidate
  for (const candidate of candidates) {
    for (let i = 0; i < 4; i++) {
      await prisma.application.create({
        data: {
          candidate_id: candidate.id,
          job_title: random(jobTitles),
          company: random(companies),
          status: random(statuses),
          applied_at: new Date(
            Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
          ),
          salary_expectation: Math.floor(Math.random() * 50000 + 60000),
          source: random(sources),
          notes: "Seed application",
        },
      });
    }
  }

  console.log("✅ Seeding complete");
}

// --- EXECUTION ---
main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });