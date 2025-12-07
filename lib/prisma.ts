// @cursor: Prisma client singleton for database operations.
// This ensures we don't create multiple instances in development.
// Optimized for Supabase connection pooling and serverless functions.
// Uses lazy initialization to handle environment variables that may not be loaded at module evaluation time.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL before creating Prisma client
function validateDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    const errorMessage = 
      "DATABASE_URL environment variable is not set. " +
      "Please set DATABASE_URL in your environment variables or .env file. " +
      "If you just created/updated the .env file, please restart your dev server.";
    
    console.error("❌ " + errorMessage);
    console.error("💡 Quick fix: Restart your dev server with: npm run dev");
    
    throw new Error(errorMessage);
  }

  // Check for common connection string formats
  const isValidFormat = 
    dbUrl.startsWith("postgresql://") || 
    dbUrl.startsWith("postgres://") ||
    dbUrl.startsWith("file:") ||
    dbUrl.startsWith("sqlite:");

  if (!isValidFormat) {
    console.warn(
      "⚠️  DATABASE_URL format might be incorrect. " +
      "Expected: postgresql://, postgres://, file:, or sqlite://"
    );
  }

  return dbUrl;
}

// Lazy initialization - create client only when first accessed
let prismaInstance: PrismaClient | undefined;
let initializationError: Error | undefined;

function getPrismaClient(): PrismaClient {
  // Return existing instance if already created
  if (prismaInstance) {
    return prismaInstance;
  }

  // Return cached error if initialization already failed
  if (initializationError) {
    throw initializationError;
  }

  // Check global first (for hot reload in development)
  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
  }

  try {
    const dbUrl = validateDatabaseUrl();
    
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      // Optimize for Supabase connection pooling and serverless
      // Connection pooling is handled by Supabase's pooler URL in DATABASE_URL
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });

    // Store in global to reuse in development (hot reload)
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }

    return prismaInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to initialize Prisma Client:", errorMessage);
    
    // Provide helpful error message
    if (errorMessage.includes("DATABASE_URL")) {
      console.error("💡 Solutions:");
      console.error("   1. Check that .env file exists in project root");
      console.error("   2. Verify DATABASE_URL is set in .env file");
      console.error("   3. Restart your dev server: npm run dev");
      console.error("   4. Check .env file format (no spaces around = sign)");
    }
    
    initializationError = new Error(
      `Prisma Client initialization failed: ${errorMessage}. ` +
      "Please check your DATABASE_URL environment variable and restart the dev server."
    );
    throw initializationError;
  }
}

// Export prisma client with true lazy initialization using Proxy
// This prevents errors during module evaluation when env vars might not be loaded yet
// The client will only initialize when first accessed
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    
    // If it's a function, bind it to the client instance
    if (typeof value === "function") {
      return value.bind(client);
    }
    
    return value;
  },
  set(_target, prop, value) {
    const client = getPrismaClient();
    (client as any)[prop] = value;
    return true;
  },
});

// Optimize connection for serverless (reuse connections, faster queries)
// This helps with Supabase connection pooling

/**
 * Check database connection health with retry logic
 * Useful for health checks and diagnostics
 */
export async function checkDatabaseConnection(retries: number = 3): Promise<{
  connected: boolean;
  error?: string;
  timestamp: string;
}> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Ensure connection is active
      await prisma.$connect();
      
      // Test with a simple query
      await prisma.$queryRaw`SELECT 1`;
      
      return { 
        connected: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const isConnectionError = 
        errorMessage.includes("Can't reach database") ||
        errorMessage.includes("P1001") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("ECONNREFUSED");

      // If it's a connection error and we have retries left, try again
      if (isConnectionError && attempt < retries) {
        console.warn(`Database connection attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }

      console.error(`Database connection failed (attempt ${attempt}/${retries}):`, errorMessage);
      return { 
        connected: false, 
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  return {
    connected: false,
    error: "Connection failed after all retries",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Execute a database query with connection retry logic
 * This wrapper helps handle transient connection errors
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  retries: number = 2
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const isConnectionError = 
        errorMessage.includes("Can't reach database") ||
        errorMessage.includes("P1001") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("ECONNREFUSED");

      if (isConnectionError && attempt < retries) {
        console.warn(`Query failed (attempt ${attempt}/${retries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        continue;
      }

      throw error;
    }
  }

  throw new Error("Query failed after all retries");
}

export { prisma };

