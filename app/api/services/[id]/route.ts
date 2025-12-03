// @cursor v1.2: This API route manages individual service CRUD operations.
// DELETE must check if service is in use (walk-ins with status waiting/in-progress).
// PATCH must validate name uniqueness (case-insensitive, excluding self).
// Use Zod for all input validation.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  price: z.number().min(0).max(9999.99).optional(),
  duration: z.number().int().min(5).max(480).optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  imageAlt: z.string().max(200).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  staffIds: z.array(z.string()).optional(), // Staff assignments
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateServiceSchema.parse(body);

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // If name is being updated, check uniqueness (excluding self)
    if (validated.name && validated.name !== existingService.name) {
      const duplicateService = await prisma.service.findFirst({
        where: {
          name: {
            equals: validated.name,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (duplicateService) {
        return NextResponse.json(
          { error: "A service with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Extract staffIds if provided
    const { staffIds, ...serviceData } = validated;

    // Update service
    await prisma.service.update({
      where: { id },
      data: serviceData,
      include: {
        category: true,
        staffServices: {
          include: {
            staff: true
          }
        }
      }
    });

    // Update staff assignments if provided
    if (staffIds !== undefined) {
      // Delete existing staff assignments
      await prisma.staffService.deleteMany({
        where: { serviceId: id }
      });

      // Create new staff assignments
      if (staffIds.length > 0) {
        await prisma.staffService.createMany({
          data: staffIds.map((staffId) => ({
            serviceId: id,
            staffId,
            isPrimary: false,
          })),
        });
      }
    }

    // Fetch the complete service with updated staff assignments
    const completeService = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        staffServices: {
          include: {
            staff: true
          }
        }
      }
    });

    return NextResponse.json(completeService, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch service
    const service = await prisma.service.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // 2. Check if service is in use
    const inUseCount = await prisma.walkIn.count({
      where: {
        service: service.name,
        status: { in: ["waiting", "in-progress"] }
      }
    });

    // 3. Protection check
    if (inUseCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete: service in use by active customers",
          inUseCount
        },
        { status: 403 }
      );
    }

    // 4. Proceed with deletion
    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}

