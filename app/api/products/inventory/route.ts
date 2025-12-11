// @cursor: Inventory Management - Inventory reports and alerts
// GET: Get inventory summary, low stock alerts, and reports

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "summary";

    if (reportType === "low-stock") {
      // Get all active products and filter for low stock
      const allProducts = await prisma.product.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          stockQuantity: "asc",
        },
      });

      // Filter products where stockQuantity <= lowStockThreshold
      const lowStockProducts = allProducts.filter(
        (p) => p.stockQuantity <= p.lowStockThreshold
      );

      return NextResponse.json(
        {
          type: "low-stock",
          products: lowStockProducts.map((p) => ({
            ...p,
            isLowStock: true,
            stockDifference: p.stockQuantity - p.lowStockThreshold,
          })),
          count: lowStockProducts.length,
        },
        { status: 200 }
      );
    }

    if (reportType === "summary") {
      // Get inventory summary
      const [totalProducts, activeProductsList, totalValue] =
        await Promise.all([
          prisma.product.count(),
          prisma.product.findMany({
            where: { isActive: true },
            select: {
              stockQuantity: true,
              lowStockThreshold: true,
            },
          }),
          prisma.product.aggregate({
            where: { isActive: true },
            _sum: {
              stockQuantity: true,
            },
          }),
        ]);

      const activeProducts = activeProductsList.length;
      const lowStockCount = activeProductsList.filter(
        (p) => p.stockQuantity <= p.lowStockThreshold
      ).length;

      // Calculate total inventory value (stock * cost, or stock * price if cost not set)
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: {
          stockQuantity: true,
          cost: true,
          price: true,
        },
      });

      const inventoryValue = products.reduce((sum, p) => {
        const unitValue = p.cost ?? p.price;
        return sum + p.stockQuantity * unitValue;
      }, 0);

      return NextResponse.json(
        {
          type: "summary",
          summary: {
            totalProducts,
            activeProducts,
            lowStockCount,
            totalStockUnits: totalValue._sum.stockQuantity || 0,
            inventoryValue,
          },
        },
        { status: 200 }
      );
    }

    if (reportType === "sales-report") {
      // Get sales report for date range
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const where: any = {};
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
        include: {
          Product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: {
          soldAt: "desc",
        },
      });

      // Group by product
      const productSales = sales.reduce((acc, sale) => {
        const productId = sale.productId;
        if (!acc[productId]) {
          acc[productId] = {
            product: sale.Product,
            quantity: 0,
            revenue: 0,
            salesCount: 0,
          };
        }
        acc[productId].quantity += sale.quantity;
        acc[productId].revenue += sale.totalPrice;
        acc[productId].salesCount += 1;
        return acc;
      }, {} as Record<string, any>);

      const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);
      const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);

      return NextResponse.json(
        {
          type: "sales-report",
          period: {
            startDate: startDate || null,
            endDate: endDate || null,
          },
          summary: {
            totalRevenue,
            totalQuantity,
            totalSales: sales.length,
            uniqueProducts: Object.keys(productSales).length,
          },
          byProduct: Object.values(productSales),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid report type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching inventory report:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory report" },
      { status: 500 }
    );
  }
}
