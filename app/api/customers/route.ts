// @cursor: This API route must strictly follow Zod validation,
// return correct HTTP status codes, and use Prisma for DB actions.
// Do not include UI logic. Keep it pure backend.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { validateAndNormalizePhone } from "@/lib/utils";

const customerSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  name: z.string().min(1, "Customer name is required"),
  email: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.string().email("Invalid email format").optional()
  ),
});

// GET /api/customers - Get all customers
// GET /api/customers?phone=+91XXXXXXXXXX - Lookup customer by phone
export async function GET(request: NextRequest) {
  try {
    // Validate database connection before proceeding
    if (!process.env.DATABASE_URL) {
      console.error("[GET /api/customers] DATABASE_URL is not set");
      return NextResponse.json(
        { 
          error: "Database configuration error",
          details: "DATABASE_URL environment variable is not set. Please configure your database connection.",
          code: "MISSING_DATABASE_URL"
        },
        { status: 500 }
      );
    }

    // Test connection with a simple query first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (connectionError) {
      const errorMessage = connectionError instanceof Error ? connectionError.message : String(connectionError);
      console.error("[GET /api/customers] Database connection test failed:", errorMessage);
      
      // Check for specific connection error types
      if (errorMessage.includes("Can't reach database") || 
          errorMessage.includes("P1001") ||
          errorMessage.includes("connection") ||
          errorMessage.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            details: "Unable to connect to the database. Please check your DATABASE_URL and ensure the database server is running.",
            code: "DATABASE_CONNECTION_ERROR",
            suggestion: "If using Supabase, ensure you're using the connection pooler URL (port 6543) for serverless environments."
          },
          { status: 500 }
        );
      }

      if (errorMessage.includes("does not exist") || 
          errorMessage.includes("Unknown table") ||
          (errorMessage.includes("relation") && errorMessage.includes("does not exist"))) {
        return NextResponse.json(
          { 
            error: "Database schema error",
            details: "Database tables may not exist. Please run migrations: npx prisma migrate dev",
            code: "SCHEMA_ERROR"
          },
          { status: 500 }
        );
      }

      // Generic connection error
      return NextResponse.json(
        { 
          error: "Database error",
          details: errorMessage,
          code: "DATABASE_ERROR"
        },
        { status: 500 }
      );
    }

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

      // Lookup customer by phone with error handling
      let customer;
      try {
        customer = await prisma.customer.findUnique({
          where: { phone: normalizedPhone },
          include: {
            _count: {
              select: {
                WalkIn: true,
              },
            },
            WalkIn: {
              select: {
                id: true,
                service: true,
                status: true,
                completedAt: true,
              },
              orderBy: {
                completedAt: "desc",
              },
              take: 50, // Limit to last 50 walk-ins per customer for performance
            },
          },
        });
      } catch (dbError) {
        const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        console.error("[GET /api/customers] Error querying customer:", errorMessage);
        
        if (errorMessage.includes("does not exist") || 
            errorMessage.includes("Unknown table") ||
            (errorMessage.includes("relation") && errorMessage.includes("does not exist"))) {
          return NextResponse.json(
            { 
              error: "Database schema error",
              details: "Customer table may not exist. Please run migrations: npx prisma migrate dev",
              code: "SCHEMA_ERROR"
            },
            { status: 500 }
          );
        }
        
        throw dbError; // Re-throw to be caught by outer catch
      }

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      // Get all services to map service names to prices
      let services: Array<{ name: string; price: number }> = [];
      try {
        services = await prisma.service.findMany({
          select: {
            name: true,
            price: true,
          },
        });
      } catch (dbError) {
        console.error("[GET /api/customers] Error fetching services:", dbError);
        // If services query fails, continue with empty array (non-critical)
        services = [];
      }

      const servicePriceMap = new Map(
        services.map((service) => [service.name, service.price])
      );

      // Helper function to calculate days between two dates
      const daysBetween = (date1: Date, date2: Date): number => {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      // Calculate stats for single customer
      const completedWalkIns = customer.WalkIn.filter(
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
          visitCount: customer._count.WalkIn,
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
    let totalCount;
    let customers;
    
    try {
      totalCount = await prisma.customer.count({ where });
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.error("[GET /api/customers] Error counting customers:", errorMessage);
      
      if (errorMessage.includes("does not exist") || 
          errorMessage.includes("Unknown table") ||
          (errorMessage.includes("relation") && errorMessage.includes("does not exist"))) {
        return NextResponse.json(
          { 
            error: "Database schema error",
            details: "Customer table may not exist. Please run migrations: npx prisma migrate dev",
            code: "SCHEMA_ERROR"
          },
          { status: 500 }
        );
      }
      
      throw dbError;
    }

    // Fetch customers with pagination
    try {
      customers = await prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              WalkIn: true,
            },
          },
          WalkIn: {
            select: {
              id: true,
              service: true,
              status: true,
              completedAt: true,
            },
            orderBy: {
              completedAt: "desc",
            },
            take: 50, // Limit to last 50 walk-ins per customer for performance
          },
        },
      });
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.error("[GET /api/customers] Error fetching customers:", errorMessage);
      
      if (errorMessage.includes("does not exist") || 
          errorMessage.includes("Unknown table") ||
          (errorMessage.includes("relation") && errorMessage.includes("does not exist"))) {
        return NextResponse.json(
          { 
            error: "Database schema error",
            details: "Customer table may not exist. Please run migrations: npx prisma migrate dev",
            code: "SCHEMA_ERROR"
          },
          { status: 500 }
        );
      }
      
      throw dbError;
    }

    // Calculate lifetime value for each customer
    // Get all services to map service names to prices
    let services: Array<{ name: string; price: number }> = [];
    try {
      services = await prisma.service.findMany({
        select: {
          name: true,
          price: true,
        },
      });
    } catch (dbError) {
      console.error("[GET /api/customers] Error fetching services for stats:", dbError);
      // If services query fails, continue with empty array (non-critical)
      services = [];
    }

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
      const visitCount = customer._count.WalkIn;

      // Filter completed walk-ins
      const completedWalkIns = customer.WalkIn.filter(
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
    console.error("[GET /api/customers] ========== ERROR CAUGHT ==========");
    console.error("[GET /api/customers] Error:", error);
    console.error("[GET /api/customers] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("[GET /api/customers] Error name:", error instanceof Error ? error.name : "Unknown");
    console.error("[GET /api/customers] DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.error("[GET /api/customers] DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
    
    // Provide more specific error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    
    const errorString = errorMessage.toLowerCase();
    
    // Check if DATABASE_URL is missing
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          error: "Database configuration error",
          details: "DATABASE_URL environment variable is not set. Please configure your database connection.",
          code: "MISSING_DATABASE_URL"
        },
        { status: 500 }
      );
    }
    
    // Check if it's a Prisma error (e.g., table doesn't exist)
    if (errorString.includes("does not exist") || 
        errorString.includes("unknown table") ||
        (errorString.includes("relation") && errorString.includes("does not exist"))) {
      console.error("[GET /api/customers] Database table may not exist. Run migrations: npx prisma migrate dev");
      return NextResponse.json(
        { 
          error: "Database schema error",
          details: "Database tables may not exist. Please run migrations: npx prisma migrate dev",
          code: "SCHEMA_ERROR"
        },
        { status: 500 }
      );
    }
    
    // Check for Prisma connection errors
    if (errorString.includes("can't reach database") || 
        errorString.includes("p1001") ||
        errorString.includes("connection") ||
        errorString.includes("econnrefused") ||
        errorString.includes("timeout")) {
      console.error("[GET /api/customers] Database connection error. Check DATABASE_URL.");
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "Unable to connect to the database. Please check your DATABASE_URL and ensure the database server is running.",
          code: "DATABASE_CONNECTION_ERROR",
          suggestion: "If using Supabase, ensure you're using the connection pooler URL (port 6543) for serverless environments."
        },
        { status: 500 }
      );
    }
    
    // Check for Prisma client errors
    if (errorString.includes("p2002") || errorString.includes("unique constraint")) {
      return NextResponse.json(
        { error: "Customer already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to fetch customer", 
        details: errorMessage,
        code: "UNKNOWN_ERROR",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  // Outermost try-catch to ensure we ALWAYS return a JSON response
  try {
    console.log('[POST /api/customers] ========== REQUEST START ==========');
    console.log('[POST /api/customers] Request received at:', new Date().toISOString());
    console.log('[POST /api/customers] Request URL:', request.url);
    console.log('[POST /api/customers] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[POST /api/customers] DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

    // Validate database connection before proceeding
    if (!process.env.DATABASE_URL) {
      console.error('[POST /api/customers] DATABASE_URL is not set');
      return NextResponse.json(
        { 
          error: "Database configuration error",
          details: "DATABASE_URL environment variable is not set. Please configure your database connection.",
          code: "MISSING_DATABASE_URL"
        },
        { status: 500 }
      );
    }

    // Test connection with a simple query first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (connectionError) {
      const errorMessage = connectionError instanceof Error ? connectionError.message : String(connectionError);
      console.error('[POST /api/customers] Database connection test failed:', errorMessage);
      
      // Check for specific connection error types
      if (errorMessage.includes("Can't reach database") || 
          errorMessage.includes("P1001") ||
          errorMessage.includes("connection") ||
          errorMessage.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            details: "Unable to connect to the database. Please check your DATABASE_URL and ensure the database server is running.",
            code: "DATABASE_CONNECTION_ERROR",
            suggestion: "If using Supabase, ensure you're using the connection pooler URL (port 6543) for serverless environments."
          },
          { status: 500 }
        );
      }

      if (errorMessage.includes("does not exist") || 
          errorMessage.includes("Unknown table") ||
          (errorMessage.includes("relation") && errorMessage.includes("does not exist"))) {
        return NextResponse.json(
          { 
            error: "Database schema error",
            details: "Database tables may not exist. Please run migrations: npx prisma migrate dev",
            code: "SCHEMA_ERROR"
          },
          { status: 500 }
        );
      }

      // Generic connection error
      return NextResponse.json(
        { 
          error: "Database error",
          details: errorMessage,
          code: "DATABASE_ERROR"
        },
        { status: 500 }
      );
    }
  
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('[POST /api/customers] JSON parse error:', jsonError);
      return NextResponse.json(
        { error: "Invalid JSON in request body", details: "Please ensure your request body is valid JSON." },
        { status: 400 }
      );
    }

    // Validate request data
    let validatedData;
    try {
      validatedData = customerSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('[POST /api/customers] Zod validation error:', validationError.issues);
        return NextResponse.json(
          { 
            error: "Validation error", 
            details: validationError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Validate and normalize phone number
    const normalizedPhone = validateAndNormalizePhone(validatedData.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Invalid phone format. Expected: +91 followed by 10 digits" },
        { status: 400 }
      );
    }

    // Check if customer already exists
    let existingCustomer;
    try {
      existingCustomer = await prisma.customer.findUnique({
        where: { phone: normalizedPhone },
      });
    } catch (dbError) {
      console.error('[POST /api/customers] Database error checking existing customer:', dbError);
      return NextResponse.json(
        { 
          error: "Database error", 
          details: "Unable to check if customer exists. Please try again.",
          code: "DB_CHECK_ERROR"
        },
        { status: 500 }
      );
    }

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this phone number already exists" },
        { status: 409 }
      );
    }

    // Create new customer
    let customer;
    try {
      // Generate a unique ID for the customer
      // Using a simple approach: timestamp + random string
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
          email: validatedData.email?.trim() || null,
          updatedAt: new Date(),
        },
      });
    } catch (createError) {
      console.error('[POST /api/customers] Database error creating customer:', createError);
      
      // Handle Prisma unique constraint violation
      if (createError instanceof PrismaClientKnownRequestError && createError.code === "P2002") {
        const target = createError.meta?.target as string[] | undefined;
        if (target?.includes("phone")) {
          return NextResponse.json(
            { error: "Customer with this phone number already exists" },
            { status: 409 }
          );
        }
      }
      
      // Handle other Prisma errors
      if (createError instanceof PrismaClientKnownRequestError) {
        return NextResponse.json(
          { 
            error: "Database error", 
            details: createError.message || "Failed to create customer in database.",
            code: createError.code
          },
          { status: 500 }
        );
      }
      
      throw createError;
    }

    console.log('[POST /api/customers] Customer created successfully, returning response');
    const successResponse = NextResponse.json(customer, { status: 201 });
    console.log('[POST /api/customers] ========== REQUEST SUCCESS ==========');
    return successResponse;
  } catch (error) {
    // Log error details for debugging
    console.error('[POST /api/customers] ========== ERROR CAUGHT ==========');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('[POST /api/customers] Error details:', {
      name: errorName,
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
    });

    // Always return a proper JSON error response
    // Check for common error types
    const errorString = errorMessage.toLowerCase();
    
    if (errorString.includes("can't reach database") || 
        errorString.includes("p1001") ||
        errorString.includes("connection") ||
        errorString.includes("connect econnrefused") ||
        errorString.includes("timeout")) {
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "Unable to connect to the database. Please check your DATABASE_URL environment variable."
        },
        { status: 500 }
      );
    }
    
    if (errorString.includes("does not exist") || 
        errorString.includes("unknown table") ||
        (errorString.includes("relation") && errorString.includes("does not exist"))) {
      return NextResponse.json(
        { 
          error: "Database schema error",
          details: "The database tables may not exist. Please run: npx prisma migrate dev"
        },
        { status: 500 }
      );
    }
    
    // Generic error response - ensure we always return valid JSON
    const errorResponse = {
      error: "Failed to create customer",
      details: errorMessage || "An unexpected error occurred. Please try again.",
      timestamp: new Date().toISOString(),
    };
    
    console.log('[POST /api/customers] Returning error response:', {
      status: 500,
      hasError: !!errorResponse.error,
      hasDetails: !!errorResponse.details,
    });
    
    try {
      const response = NextResponse.json(errorResponse, { status: 500 });
      console.log('[POST /api/customers] Error response created successfully');
      console.log('[POST /api/customers] ========== REQUEST END (ERROR) ==========');
      return response;
    } catch (responseError) {
      // If creating JSON response fails, return a plain text JSON response
      console.error('[POST /api/customers] Failed to create JSON response:', responseError);
      const fallbackResponse = new NextResponse(
        JSON.stringify({
          error: "Internal server error",
          details: "Failed to create customer. Please try again.",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('[POST /api/customers] ========== REQUEST END (FALLBACK ERROR) ==========');
      return fallbackResponse;
    }
  }
}

