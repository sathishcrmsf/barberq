// @cursor: Prisma client singleton for database operations.
// This ensures we don't create multiple instances in development.
// Optimized for Supabase connection pooling and serverless functions.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Optimize for Supabase connection pooling and serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Ensure prisma is always defined
if (!prisma) {
  throw new Error("Prisma Client failed to initialize. Check DATABASE_URL environment variable.");
}

// Optimize connection for serverless (reuse connections, faster queries)
// This helps with Supabase connection pooling
export { prisma };

