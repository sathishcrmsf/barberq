// Test database connection endpoint
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('[TEST-DB] Testing database connection...');
    
    const diagnostics = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      databaseUrlStartsWith: process.env.DATABASE_URL?.substring(0, 20) || 'not set',
    };
    
    console.log('[TEST-DB] Environment check:', diagnostics);
    
    // Test database connection
    await prisma.$connect();
    console.log('[TEST-DB] Connected to database');
    
    // Try a simple query
    const customerCount = await prisma.customer.count();
    console.log('[TEST-DB] Customer count:', customerCount);
    
    // Check if Customer table exists by trying to query it
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Customer" LIMIT 1`;
      console.log('[TEST-DB] Customer table exists');
    } catch (tableError: any) {
      console.error('[TEST-DB] Customer table check failed:', tableError.message);
      return NextResponse.json({
        success: false,
        error: "Database connection works, but Customer table may not exist",
        diagnostics,
        tableError: tableError.message,
        suggestion: "Run: npx prisma migrate dev"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      diagnostics,
      customerCount,
    });
    
  } catch (error: any) {
    console.error('[TEST-DB] Database connection failed:', error);
    
    const errorMessage = error?.message || String(error);
    const diagnostics = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      error: errorMessage,
      errorCode: error?.code,
    };
    
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      diagnostics,
      suggestion: errorMessage.includes("does not exist") || errorMessage.includes("relation")
        ? "Run: npx prisma migrate dev"
        : "Check your DATABASE_URL in .env.local"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

