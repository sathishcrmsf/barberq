// @cursor: Check if Product table exists
// This endpoint helps diagnose database setup issues

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if prisma.product exists (model might not be in generated client)
    if (!prisma.product) {
      return NextResponse.json({
        exists: false,
        error: "Product model not found in Prisma client",
        code: "MODEL_MISSING",
        isTableMissing: false,
        solution: "Run: npx prisma generate (to regenerate Prisma client with Product model)",
      }, { status: 200 });
    }

    // Try to query the Product table
    const count = await prisma.product.count();
    
    return NextResponse.json({
      exists: true,
      tableName: "Product",
      recordCount: count,
      message: "Product table exists and is accessible",
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorCode = (error as any)?.code;
    
    const isTableMissing = 
      errorMessage.includes("does not exist") || 
      errorMessage.includes("relation") ||
      errorMessage.includes("Table") ||
      errorCode === "P2021" ||
      errorCode === "42P01";
    
    return NextResponse.json({
      exists: false,
      error: errorMessage,
      code: errorCode,
      isTableMissing,
      solution: isTableMissing
        ? "Run database migration: npx prisma migrate dev --name add_inventory_management"
        : "Check database connection and permissions",
    }, { status: 200 }); // Return 200 so frontend can check the exists field
  }
}
