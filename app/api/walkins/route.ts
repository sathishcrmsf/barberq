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
  service: z.string().optional(),
  notes: z.string().optional(),
});

// const statusSchema = z.enum(["waiting", "in-progress", "done"]); // Unused, kept for reference

// GET /api/walkins - Get all walk-ins
export async function GET() {
  try {
    // Ensure prisma is available
    if (!prisma) {
      return NextResponse.json(
        { 
          error: "Database connection not available",
          details: "Prisma client is not initialized"
        },
        { status: 503 }
      );
    }

    const walkIns = await prisma.walkIn.findMany({
      include: {
        Customer: true,
        Staff: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(walkIns, { status: 200 });
  } catch (error) {
    console.error("Error fetching walk-ins:", error);
    
    // Handle Prisma-specific errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Full error details:", { errorMessage, errorStack });
    
    const isConnectionError = 
      errorMessage.includes("Can't reach database") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("DATABASE_URL") ||
      errorMessage.includes("Unknown field");

    if (isConnectionError) {
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "Unable to connect to the database. Please check your DATABASE_URL and ensure the database server is running.",
          message: process.env.NODE_ENV === "development" ? errorMessage : undefined
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to fetch walk-ins",
        details: process.env.NODE_ENV === "development" ? errorMessage : "An error occurred while fetching walk-ins",
        message: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
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
      // Generate a unique ID for the customer
      const generateId = () => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 11);
        return `${timestamp}${random}`;
      };
      
      customer = await prisma.customer.create({
        data: {
          id: generateId(),
          phone: normalizedPhone,
          name: validatedData.name.trim(),
          updatedAt: new Date(),
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

    // Generate a unique ID for the walk-in
    const generateId = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 11);
      return `${timestamp}${random}`;
    };

    // Create walk-in with customerId
    const walkIn = await prisma.walkIn.create({
      data: {
        id: generateId(),
        customerId: customer.id,
        customerName: customer.name, // Keep for backward compatibility
        service: validatedData.service || "TBD", // Placeholder until service is selected
        notes: validatedData.notes,
        status: "waiting",
      },
      include: {
        Customer: true,
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
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Full error details:", { errorMessage, errorStack });
    
    // Check for Prisma-specific errors
    const isConnectionError = 
      errorMessage.includes("Can't reach database") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("DATABASE_URL") ||
      errorMessage.includes("Unknown field");

    if (isConnectionError) {
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "Unable to connect to the database. Please check your DATABASE_URL and ensure the database server is running.",
          message: process.env.NODE_ENV === "development" ? errorMessage : undefined
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create walk-in",
        details: process.env.NODE_ENV === "development" ? errorMessage : "An error occurred while creating the walk-in",
        message: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

