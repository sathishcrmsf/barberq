// @cursor v1.2: This endpoint returns only active services for use in the walk-in form dropdown.
// Sorted alphabetically by name for easy selection.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: "asc" // Alphabetical for dropdown
      }
    });

    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error("Error fetching active services:", error);
    return NextResponse.json(
      { error: "Failed to fetch active services" },
      { status: 500 }
    );
  }
}

