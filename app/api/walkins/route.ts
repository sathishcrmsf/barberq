// @cursor: This API route must strictly follow Zod validation,
// return correct HTTP status codes, and use Prisma for DB actions.
// Do not include UI logic. Keep it pure backend.
// @cursor v1.4: Updated to use Customer model with phone-based lookup.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateAndNormalizePhone } from "@/lib/utils";

const walkInSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  name: z.string().min(1, "Customer name is required"),
  barberName: z.string().optional(),
  service: z.string().min(1, "Service is required"),
  notes: z.string().optional(),
});

// const statusSchema = z.enum(["waiting", "in-progress", "done"]); // Unused, kept for reference

// GET /api/walkins - Get all walk-ins
export async function GET() {
  try {
    const walkIns = await prisma.walkIn.findMany({
      include: {
        customer: true,
      },
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

    // Validate and normalize phone number
    const normalizedPhone = validateAndNormalizePhone(validatedData.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Invalid phone format. Expected: +91 followed by 10 digits" },
        { status: 400 }
      );
    }

    // Lookup or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          phone: normalizedPhone,
          name: validatedData.name.trim(),
        },
      });
    } else {
      // Update customer name if it has changed
      if (customer.name !== validatedData.name.trim()) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: {
            name: validatedData.name.trim(),
          },
        });
      }
    }

    // Create walk-in with customerId
    const walkIn = await prisma.walkIn.create({
      data: {
        customerId: customer.id,
        customerName: customer.name, // Keep for backward compatibility
        barberName: validatedData.barberName,
        service: validatedData.service,
        notes: validatedData.notes,
        status: "waiting",
      },
      include: {
        customer: true,
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

