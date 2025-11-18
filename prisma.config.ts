import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Owo0G8uPszSt@ep-bold-heart-aep7vhm9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
