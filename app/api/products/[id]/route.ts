// @cursor: Inventory Management - Individual product operations
// GET: Fetch single product
// PATCH: Update product
// DELETE: Delete product (soft delete by setting isActive=false)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  price: z.number().min(0).max(9999.99).optional(),
  cost: z.number().min(0).max(9999.99).optional().nullable(),
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  unit: z.string().max(20).optional(),
  imageUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ProductSales: true },
        },
        ProductSales: {
          take: 10,
          orderBy: { soldAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const productWithStats = {
      ...product,
      isLowStock: product.stockQuantity <= product.lowStockThreshold,
      totalSales: product._count.ProductSales,
    };

    return NextResponse.json(productWithStats, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateProductSchema.parse(body);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check SKU uniqueness if SKU is being updated
    if (validated.sku && validated.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: validated.sku },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...validated,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ProductSales: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product has sales - if so, soft delete
    if (product._count.ProductSales > 0) {
      // Soft delete: set isActive to false
      const deactivatedProduct = await prisma.product.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          message: "Product deactivated (has sales history)",
          product: deactivatedProduct,
        },
        { status: 200 }
      );
    }

    // Hard delete if no sales
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
