import { NextResponse } from "next/server";
import { prisma, checkDatabaseConnection } from "@/lib/prisma";

/**
 * Health check endpoint
 * 
 * Use this to verify:
 * - Server is running
 * - Database is accessible
 * - Prisma client is working
 * 
 * Usage:
 *   curl http://localhost:3000/api/health
 */
export async function GET() {
  try {
    // Check database connection with retry logic
    const connectionCheck = await checkDatabaseConnection(3);
    
    if (!connectionCheck.connected) {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          error: connectionCheck.error || "Database connection failed",
          timestamp: connectionCheck.timestamp,
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            databaseUrlFormat: process.env.DATABASE_URL 
              ? (process.env.DATABASE_URL.startsWith("postgresql://") || process.env.DATABASE_URL.startsWith("postgres://") 
                  ? "postgresql" 
                  : process.env.DATABASE_URL.startsWith("file:") || process.env.DATABASE_URL.startsWith("sqlite:")
                  ? "sqlite"
                  : "unknown")
              : "not_set",
          },
          suggestion: connectionCheck.error?.includes("Can't reach database") || 
                      connectionCheck.error?.includes("connection")
            ? "Check DATABASE_URL and ensure database server is running. If using Supabase, use connection pooler URL (port 6543)."
            : "Check server logs for details",
        },
        { status: 503 }
      );
    }
    
    // Get basic counts to verify data access
    const [walkInCount, serviceCount, staffCount, customerCount] = await Promise.all([
      prisma.walkIn.count().catch(() => 0),
      prisma.service.count().catch(() => 0),
      prisma.staff.count().catch(() => 0),
      prisma.customer.count().catch(() => 0),
    ]);

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      connectionCheck: {
        connected: connectionCheck.connected,
        timestamp: connectionCheck.timestamp,
      },
      counts: {
        walkIns: walkInCount,
        services: serviceCount,
        staff: staffCount,
        customers: customerCount,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlFormat: process.env.DATABASE_URL 
          ? (process.env.DATABASE_URL.startsWith("postgresql://") || process.env.DATABASE_URL.startsWith("postgres://") 
              ? "postgresql" 
              : process.env.DATABASE_URL.startsWith("file:") || process.env.DATABASE_URL.startsWith("sqlite:")
              ? "sqlite"
              : "unknown")
          : "not_set",
        isPooler: process.env.DATABASE_URL?.includes("pooler") || false,
      },
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isDatabaseError = 
      errorMessage.includes("Can't reach database") || 
      errorMessage.includes("database server") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("ECONNREFUSED");

    return NextResponse.json(
      {
        status: "unhealthy",
        database: isDatabaseError ? "disconnected" : "error",
        error: errorMessage,
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlFormat: process.env.DATABASE_URL 
            ? (process.env.DATABASE_URL.startsWith("postgresql://") || process.env.DATABASE_URL.startsWith("postgres://") 
                ? "postgresql" 
                : process.env.DATABASE_URL.startsWith("file:") || process.env.DATABASE_URL.startsWith("sqlite:")
                ? "sqlite"
                : "unknown")
            : "not_set",
        },
        suggestion: isDatabaseError
          ? "Check DATABASE_URL and ensure database is accessible. If using Supabase, use connection pooler URL (port 6543) for serverless environments."
          : "Check server logs for details",
      },
      { status: 503 }
    );
  }
}

