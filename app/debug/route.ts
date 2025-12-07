import { NextResponse } from "next/server";
import { prisma, checkDatabaseConnection } from "@/lib/prisma";

// Debug route to test database connection and provide diagnostics
export async function GET() {
  try {
    // Check database connection with retry logic
    const connectionCheck = await checkDatabaseConnection(3);
    
    if (!connectionCheck.connected) {
      return NextResponse.json(
        {
          status: "error",
          database: "disconnected",
          error: connectionCheck.error,
          timestamp: connectionCheck.timestamp,
          diagnostics: {
            env: {
              hasDatabaseUrl: !!process.env.DATABASE_URL,
              databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || "not set",
              nodeEnv: process.env.NODE_ENV,
            },
            troubleshooting: {
              step1: "Check if DATABASE_URL is set in environment variables",
              step2: "Verify database server is running and accessible",
              step3: "For Supabase: Use connection pooler URL (port 6543)",
              step4: "For Neon: Ensure connection string includes ?sslmode=require",
              step5: "See STAFF_DATABASE_ERROR_FIX.md for detailed instructions",
            },
          },
        },
        { status: 503 }
      );
    }
    
    // Test simple queries to verify database is working
    const walkInCount = await prisma.walkIn.count();
    const serviceCount = await prisma.service.count();
    const staffCount = await prisma.staff.count();
    const customerCount = await prisma.customer.count();

    // Check connection string format for hints
    const dbUrl = process.env.DATABASE_URL || "";
    const isSupabase = dbUrl.includes("supabase");
    const isPooler = dbUrl.includes("pooler") || dbUrl.includes(":6543");
    const isNeon = dbUrl.includes("neon");
    const isVercelPostgres = dbUrl.includes("vercel-storage");

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: connectionCheck.timestamp,
      counts: {
        walkIns: walkInCount,
        services: serviceCount,
        staff: staffCount,
        customers: customerCount,
      },
      diagnostics: {
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV,
        },
        connectionInfo: {
          provider: isSupabase ? "Supabase" : isNeon ? "Neon" : isVercelPostgres ? "Vercel Postgres" : "Unknown",
          usingPooler: isSupabase ? isPooler : null,
          connectionStringPrefix: dbUrl.substring(0, 30) + (dbUrl.length > 30 ? "..." : ""),
        },
        recommendations: isSupabase && !isPooler
          ? {
              warning: "Using direct connection. Consider switching to pooler URL for better reliability.",
              action: "Update DATABASE_URL to use pooler.supabase.com:6543",
            }
          : null,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        error: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        diagnostics: {
          env: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || "not set",
            nodeEnv: process.env.NODE_ENV,
          },
          troubleshooting: {
            step1: "Check if DATABASE_URL is set in environment variables",
            step2: "Verify database server is running and accessible",
            step3: "Check server logs for detailed error messages",
            step4: "See STAFF_DATABASE_ERROR_FIX.md for detailed instructions",
          },
        },
      },
      { status: 500 }
    );
  }
}

