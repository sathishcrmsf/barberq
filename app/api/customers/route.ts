// @cursor: This API route must strictly follow Zod validation,
// return correct HTTP status codes, and use Prisma for DB actions.
// Do not include UI logic. Keep it pure backend.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateAndNormalizePhone } from "@/lib/utils";

const customerSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  name: z.string().min(1, "Customer name is required"),
});

// GET /api/customers - Get all customers
// GET /api/customers?phone=+91XXXXXXXXXX - Lookup customer by phone
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get("phone");

    // If phone query param is provided, lookup single customer
    if (phone) {
      // Validate and normalize phone number
      const normalizedPhone = validateAndNormalizePhone(phone);
      if (!normalizedPhone) {
        return NextResponse.json(
          { error: "Invalid phone format. Expected: +91 followed by 10 digits" },
          { status: 400 }
        );
      }

      // Lookup customer by phone
      const customer = await prisma.customer.findUnique({
        where: { phone: normalizedPhone },
        include: {
          _count: {
            select: {
              walkIns: true,
            },
          },
          walkIns: {
            select: {
              id: true,
              service: true,
              status: true,
              completedAt: true,
            },
            orderBy: {
              completedAt: "desc",
            },
          },
        },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      // Get all services to map service names to prices
      const services = await prisma.service.findMany({
        select: {
          name: true,
          price: true,
        },
      });

      const servicePriceMap = new Map(
        services.map((service) => [service.name, service.price])
      );

      // Helper function to calculate days between two dates
      const daysBetween = (date1: Date, date2: Date): number => {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      // Calculate stats for single customer
      const completedWalkIns = customer.walkIns.filter(
        (walkIn) => walkIn.status === "done" && walkIn.completedAt
      );

      const lifetimeValue = completedWalkIns.reduce((total, walkIn) => {
        const servicePrice = servicePriceMap.get(walkIn.service) || 0;
        return total + servicePrice;
      }, 0);

      const lastVisitDate =
        completedWalkIns.length > 0 && completedWalkIns[0].completedAt
          ? new Date(completedWalkIns[0].completedAt)
          : null;

      const daysSinceLastVisit = lastVisitDate
        ? daysBetween(new Date(), lastVisitDate)
        : null;

      const needsReminder =
        daysSinceLastVisit !== null && daysSinceLastVisit > 30;

      return NextResponse.json(
        {
          ...customer,
          visitCount: customer._count.walkIns,
          lifetimeValue,
          lastVisitDate: lastVisitDate?.toISOString() || null,
          daysSinceLastVisit,
          needsReminder,
        },
        { status: 200 }
      );
    }

    // No phone param - return customers with pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const search = searchParams.get("search") || "";

    // Build where clause for search
    // Note: SQLite doesn't support case-insensitive mode, so we'll filter in-memory if needed
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    // Build orderBy clause
    // Note: For visits, LTV, and lastVisit, we'll sort in-memory after calculation
    let orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sortBy === "visits" || sortBy === "ltv" || sortBy === "lastVisit") {
      // Sort by name first, then we'll re-sort in-memory
      orderBy = { name: "asc" as const };
    } else {
      orderBy = { [sortBy]: sortOrder as 'asc' | 'desc' };
    }

    // Get total count for pagination
    const totalCount = await prisma.customer.count({ where });

    // Fetch customers with pagination
    const customers = await prisma.customer.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            walkIns: true,
          },
        },
        walkIns: {
          select: {
            id: true,
            service: true,
            status: true,
            completedAt: true,
          },
          orderBy: {
            completedAt: "desc",
          },
        },
      },
    });

    // Calculate lifetime value for each customer
    // Get all services to map service names to prices
    const services = await prisma.service.findMany({
      select: {
        name: true,
        price: true,
      },
    });

    // Create a map of service name to price for quick lookup
    const servicePriceMap = new Map(
      services.map((service) => [service.name, service.price])
    );

    // Helper function to calculate days between two dates
    const daysBetween = (date1: Date, date2: Date): number => {
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    // Calculate visit count, lifetime value, last visit date, and reminder status
    const customersWithStats = customers.map((customer) => {
      // Count total visits (all walk-ins)
      const visitCount = customer._count.walkIns;

      // Filter completed walk-ins
      const completedWalkIns = customer.walkIns.filter(
        (walkIn) => walkIn.status === "done" && walkIn.completedAt
      );

      // Calculate lifetime value (sum of prices for completed walk-ins only)
      const lifetimeValue = completedWalkIns.reduce((total, walkIn) => {
        const servicePrice = servicePriceMap.get(walkIn.service) || 0;
        return total + servicePrice;
      }, 0);

      // Get last visit date (most recent completedAt)
      const lastVisitDate =
        completedWalkIns.length > 0 && completedWalkIns[0].completedAt
          ? new Date(completedWalkIns[0].completedAt)
          : null;

      // Calculate days since last visit
      const daysSinceLastVisit = lastVisitDate
        ? daysBetween(new Date(), lastVisitDate)
        : null;

      // Check if customer needs reminder (30+ days since last visit)
      const needsReminder =
        daysSinceLastVisit !== null && daysSinceLastVisit > 30;

      return {
        ...customer,
        visitCount,
        lifetimeValue,
        lastVisitDate: lastVisitDate?.toISOString() || null,
        daysSinceLastVisit,
        needsReminder,
      };
    });

    // Sort by visits, LTV, or lastVisit if needed (in-memory sort)
    if (sortBy === "visits") {
      customersWithStats.sort((a, b) => {
        const diff = a.visitCount - b.visitCount;
        return sortOrder === "asc" ? diff : -diff;
      });
    } else if (sortBy === "ltv") {
      customersWithStats.sort((a, b) => {
        const diff = a.lifetimeValue - b.lifetimeValue;
        return sortOrder === "asc" ? diff : -diff;
      });
    } else if (sortBy === "lastVisit") {
      customersWithStats.sort((a, b) => {
        const aDate = a.lastVisitDate ? new Date(a.lastVisitDate).getTime() : 0;
        const bDate = b.lastVisitDate ? new Date(b.lastVisitDate).getTime() : 0;
        const diff = aDate - bDate;
        return sortOrder === "asc" ? diff : -diff;
      });
    }

    return NextResponse.json(
      {
        customers: customersWithStats,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + customers.length < totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Log detailed error for debugging
    console.error("Error fetching customer:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("Error name:", error instanceof Error ? error.name : "Unknown");
    
    // Provide more specific error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    
    // Check if it's a Prisma error (e.g., table doesn't exist)
    if (errorMessage.includes("does not exist") || 
        errorMessage.includes("Unknown table") ||
        errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
      console.error("Database table may not exist. Run migrations: npx prisma migrate dev");
      return NextResponse.json(
        { error: "Database not initialized. Please run migrations." },
        { status: 500 }
      );
    }
    
    // Check for Prisma connection errors
    if (errorMessage.includes("Can't reach database") || 
        errorMessage.includes("P1001") ||
        errorMessage.includes("connection")) {
      console.error("Database connection error. Check DATABASE_URL.");
      return NextResponse.json(
        { error: "Database connection failed. Please check your database configuration." },
        { status: 500 }
      );
    }
    
    // Check for Prisma client errors
    if (errorMessage.includes("P2002") || errorMessage.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Customer already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch customer", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    // Validate and normalize phone number
    const normalizedPhone = validateAndNormalizePhone(validatedData.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Invalid phone format. Expected: +91 followed by 10 digits" },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this phone number already exists" },
        { status: 409 }
      );
    }

    // Create new customer
    const customer = await prisma.customer.create({
      data: {
        phone: normalizedPhone,
        name: validatedData.name.trim(),
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Customer with this phone number already exists" },
        { status: 409 }
      );
    }

    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

