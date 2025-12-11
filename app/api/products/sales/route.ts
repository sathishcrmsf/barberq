// @cursor: Inventory Management - Product sales tracking
// GET: Fetch product sales with filters
// POST: Record a product sale

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSaleSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  walkInId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  unitPrice: z.number().min(0, "Price must be positive").optional(),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const walkInId = searchParams.get("walkInId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (walkInId) {
      where.walkInId = walkInId;
    }

    if (startDate || endDate) {
      where.soldAt = {};
      if (startDate) {
        where.soldAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.soldAt.lte = new Date(endDate);
      }
    }

    const sales = await prisma.productSale.findMany({
      where,
      orderBy: {
        soldAt: "desc",
      },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        WalkIn: {
          select: {
            id: true,
            customerName: true,
            service: true,
          },
        },
      },
      take: 100, // Limit to recent 100 sales
    });

    // Calculate totals
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    return NextResponse.json(
      {
        sales,
        summary: {
          totalRevenue,
          totalQuantity,
          count: sales.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch product sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createSaleSchema.parse(body);

    // Fetch product to get current price and stock
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "Product is not active" },
        { status: 400 }
      );
    }

    // Check stock availability
    if (product.stockQuantity < validated.quantity) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          available: product.stockQuantity,
          requested: validated.quantity,
        },
        { status: 400 }
      );
    }

    // Use provided unitPrice or product's current price
    const unitPrice = validated.unitPrice ?? product.price;
    const totalPrice = unitPrice * validated.quantity;

    // Create sale and update stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create sale record
      const sale = await tx.productSale.create({
        data: {
          productId: validated.productId,
          walkInId: validated.walkInId || null,
          quantity: validated.quantity,
          unitPrice,
          totalPrice,
          notes: validated.notes || null,
        },
        include: {
          Product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });

      // Update product stock
      await tx.product.update({
        where: { id: validated.productId },
        data: {
          stockQuantity: {
            decrement: validated.quantity,
          },
          updatedAt: new Date(),
        },
      });

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating product sale:", error);
    return NextResponse.json(
      { error: "Failed to create product sale" },
      { status: 500 }
    );
  }
}
