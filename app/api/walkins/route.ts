// @cursor: This API route must strictly follow Zod validation,
// return correct HTTP status codes, and use Prisma for DB actions.
// Do not include UI logic. Keep it pure backend.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const walkInSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  service: z.string().min(1, "Service is required"),
  notes: z.string().optional(),
});

const statusSchema = z.enum(["waiting", "in-progress", "done"]);

// GET /api/walkins - Get all walk-ins
export async function GET() {
  try {
    const walkIns = await prisma.walkIn.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(walkIns, { status: 200 });
  } catch (error) {
    console.error("Error fetching walk-ins:", error);
    return NextResponse.json(
      { error: "Failed to fetch walk-ins" },
      { status: 500 }
    );
  }
}

// POST /api/walkins - Create a new walk-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = walkInSchema.parse(body);

    const walkIn = await prisma.walkIn.create({
      data: {
        customerName: validatedData.customerName,
        service: validatedData.service,
        notes: validatedData.notes,
        status: "waiting",
      },
    });

    return NextResponse.json(walkIn, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating walk-in:", error);
    return NextResponse.json(
      { error: "Failed to create walk-in" },
      { status: 500 }
    );
  }
}

