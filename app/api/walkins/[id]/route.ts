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

    // Get the current walk-in data
    const currentWalkIn = await prisma.walkIn.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!currentWalkIn) {
      return NextResponse.json(
        { error: "Walk-in not found" },
        { status: 404 }
      );
    }

    // Build update data with proper typing
    const updateData: {
      status?: string;
      startedAt?: Date;
      completedAt?: Date;
    } = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;
    }

    // If transitioning to "in-progress", set startedAt timestamp
    if (validatedData.status === "in-progress" && !currentWalkIn.startedAt) {
      updateData.startedAt = new Date();
    }

    // If transitioning to "done", set completedAt timestamp
    if (validatedData.status === "done") {
      updateData.completedAt = new Date();
    }

    const walkIn = await prisma.walkIn.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
      },
    });

    // If transitioning to "done", fetch service details for the completion popup
    if (validatedData.status === "done") {
      const service = await prisma.service.findFirst({
        where: { name: walkIn.service },
      });

      // Calculate time taken in minutes
      const timeTaken = walkIn.startedAt
        ? Math.round((new Date().getTime() - new Date(walkIn.startedAt).getTime()) / 60000)
        : 0;

      return NextResponse.json({
        ...walkIn,
        serviceDetails: {
          price: service?.price || 0,
          duration: service?.duration || 0,
          timeTaken,
        },
      }, { status: 200 });
    }

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
      include: {
        customer: true,
      },
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

