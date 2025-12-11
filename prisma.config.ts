import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./lib/env";

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: env.DATABASE_URL,
  },

  migrations: {
    seed: "dotenv -e .env -- tsx prisma/seed.ts",
  },
});
