// Prisma CLI configuration (migrations, seed, database URL).
// The .env file is loaded here because Prisma 7 no longer loads it by itself.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx src/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
