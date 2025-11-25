// @cursor: This API route must strictly follow Zod validation,
// return correct HTTP status codes, and use Prisma for DB actions.
// Do not include UI logic. Keep it pure backend.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const statusSchema = z.enum(["waiting", "in-progress", "done"]);

const updateSchema = z.object({
  status: statusSchema.optional(),
});

// PATCH /api/walkins/:id - Update walk-in status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    const walkIn = await prisma.walkIn.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(walkIn, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "Walk-in not found" },
        { status: 404 }
      );
    }

    console.error("Error updating walk-in:", error);
    return NextResponse.json(
      { error: "Failed to update walk-in" },
      { status: 500 }
    );
  }
}

// DELETE /api/walkins/:id - Delete walk-in
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, check if the walk-in exists and get its status
    const walkIn = await prisma.walkIn.findUnique({
      where: { id },
    });

    if (!walkIn) {
      return NextResponse.json(
        { error: "Walk-in not found" },
        { status: 404 }
      );
    }

    // Prevent deletion of completed customers
    if (walkIn.status === "done") {
      return NextResponse.json(
        { error: "Cannot delete completed customers" },
        { status: 403 }
      );
    }

    await prisma.walkIn.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json(
        { error: "Walk-in not found" },
        { status: 404 }
      );
    }

    console.error("Error deleting walk-in:", error);
    return NextResponse.json(
      { error: "Failed to delete walk-in" },
      { status: 500 }
    );
  }
}

