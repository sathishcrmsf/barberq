// @cursor v1.3: Enhanced API route for service management.
// Supports images, categories, and staff assignments.
// POST must validate name uniqueness (case-insensitive).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createServiceSchema = z.object({
  name: z.string().min(1, "Name required").max(100, "Name too long").trim(),
  price: z.number().min(0, "Price must be positive").max(9999.99),
  duration: z.number().int().min(5, "Min 5 minutes").max(480, "Max 480 minutes"),
  description: z.string().max(500, "Description too long").optional(),
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  imageAlt: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  staffIds: z.array(z.string()).optional(), // v1.3: Staff assignments
});

export async function GET() {
  try {
    // Fetch all services with relationships
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        category: true,
        staffServices: {
          include: {
            staff: true
          }
        },
        _count: {
          select: { staffServices: true }
        }
      }
    });

    // Calculate usage count for each service from WalkIn records
    const walkIns = await prisma.walkIn.findMany({
      select: {
        service: true
      }
    });

    // Count usage per service name (denormalized field)
    const usageMap = walkIns.reduce((acc, walkIn) => {
      acc[walkIn.service] = (acc[walkIn.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Add usage count to each service
    const servicesWithUsage = services.map(service => ({
      ...service,
      usageCount: usageMap[service.name] || 0
    }));

    // Sort by usage count to find top 5
    const sortedByUsage = [...servicesWithUsage].sort((a, b) => b.usageCount - a.usageCount);
    const top5ServiceIds = new Set(sortedByUsage.slice(0, 5).map(s => s.id));

    // Add isTopUsed flag
    const enrichedServices = servicesWithUsage.map(service => ({
      ...service,
      isTopUsed: top5ServiceIds.has(service.id) && service.usageCount > 0
    }));

    return NextResponse.json(enrichedServices, { status: 200 });
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

    // Check name uniqueness (PostgreSQL supports case-insensitive)
    const existingService = await prisma.service.findFirst({
      where: {
        name: {
          equals: validated.name,
          mode: 'insensitive'
        }
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
        imageUrl: validated.imageUrl,
        thumbnailUrl: validated.thumbnailUrl,
        imageAlt: validated.imageAlt,
        categoryId: validated.categoryId,
        isActive: true
      },
      include: {
        category: true,
        staffServices: {
          include: {
            staff: true
          }
        }
      }
    });

    // Assign staff if provided
    if (validated.staffIds && validated.staffIds.length > 0) {
      await prisma.staffService.createMany({
        data: validated.staffIds.map((staffId) => ({
          serviceId: service.id,
          staffId,
          isPrimary: false,
        })),
      });
    }

    // Fetch the complete service with staff assignments
    const completeService = await prisma.service.findUnique({
      where: { id: service.id },
      include: {
        category: true,
        staffServices: {
          include: {
            staff: true
          }
        }
      }
    });

    return NextResponse.json(completeService, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
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

