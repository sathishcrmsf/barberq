// @cursor: Inventory Management - Product CRUD operations
// GET: Fetch all products with stock levels
// POST: Create new product

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1, "Name required").max(100, "Name too long").trim(),
  description: z.string().max(500, "Description too long").optional(),
  sku: z.string().max(50).optional().nullable(),
  price: z.number().min(0, "Price must be positive").max(9999.99),
  cost: z.number().min(0).max(9999.99).optional().nullable(),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative").default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  unit: z.string().max(20).default("unit"),
  imageUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    // Check if Product model exists in Prisma client
    if (!prisma.product) {
      return NextResponse.json(
        { 
          error: "Product model not found in Prisma client",
          details: "Prisma client needs to be regenerated",
          solution: "Run: npx prisma generate, then restart your dev server"
        },
        { status: 500 }
      );
    }

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { ProductSales: true },
        },
      },
    });

    // Calculate low stock status
    const productsWithAlerts = products.map((product) => ({
      ...product,
      isLowStock: product.stockQuantity <= product.lowStockThreshold,
      totalSales: product._count.ProductSales,
    }));

    return NextResponse.json(productsWithAlerts, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorCode = (error as any)?.code;
    
    // Check if it's a table doesn't exist error
    const isTableMissing = 
      errorMessage.includes("does not exist") || 
      errorMessage.includes("relation") ||
      errorMessage.includes("Table") ||
      errorCode === "P2021" || // Table does not exist
      errorCode === "42P01";    // PostgreSQL: relation does not exist
    
    return NextResponse.json(
      { 
        error: "Failed to fetch products",
        details: errorMessage,
        code: errorCode,
        isTableMissing,
        hint: isTableMissing
          ? "Product table does not exist. Please run the database migration. See MIGRATION_FIX.md for instructions."
          : "Check server logs for more details"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createProductSchema.parse(body);

    // Check SKU uniqueness if provided
    if (validated.sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku: validated.sku },
      });

      if (existingProduct) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    // Check if Product model exists
    if (!prisma.product) {
      return NextResponse.json(
        { 
          error: "Product model not found in Prisma client",
          details: "Prisma client needs to be regenerated",
          solution: "Run: npx prisma generate, then restart your dev server"
        },
        { status: 500 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: validated.name,
        description: validated.description,
        sku: validated.sku || null,
        price: validated.price,
        cost: validated.cost || null,
        stockQuantity: validated.stockQuantity,
        lowStockThreshold: validated.lowStockThreshold,
        unit: validated.unit,
        imageUrl: validated.imageUrl || null,
        thumbnailUrl: validated.thumbnailUrl || null,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
