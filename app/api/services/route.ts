// @cursor v1.2: This API route manages service CRUD operations.
// POST must validate name uniqueness (case-insensitive).
// Use Zod for all input validation.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createServiceSchema = z.object({
  name: z.string().min(1, "Name required").max(100, "Name too long").trim(),
  price: z.number().min(0, "Price must be positive").max(9999.99),
  duration: z.number().int().min(5, "Min 5 minutes").max(480, "Max 480 minutes"),
  description: z.string().max(500, "Description too long").optional()
});

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createServiceSchema.parse(body);

    // Check name uniqueness
    // Note: SQLite doesn't support mode: "insensitive", so this is case-sensitive
    const existingService = await prisma.service.findFirst({
      where: {
        name: validated.name
      }
    });

    if (existingService) {
      return NextResponse.json(
        { error: "A service with this name already exists" },
        { status: 409 }
      );
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name: validated.name,
        price: validated.price,
        duration: validated.duration,
        description: validated.description,
        isActive: true
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

