// @cursor: Insights API endpoint - returns all smart insights
// GET /api/insights - Returns all insight categories
// GET /api/insights?category=customer-behavior - Returns specific category
// GET /api/insights?limit=10&priority=high - Returns top insights with filters

import { NextRequest, NextResponse } from "next/server";
import {
  getAllInsights,
  getTopInsights,
  getInsightsByCategory,
  InsightCategory,
} from "@/lib/insights";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");
    const priority = searchParams.get("priority");

    // If category specified, return that category only
    if (category) {
      const categoryEnum = category as InsightCategory;
      if (!Object.values(InsightCategory).includes(categoryEnum)) {
        return NextResponse.json(
          { error: `Invalid category: ${category}` },
          { status: 400 }
        );
      }

      let insights = await getInsightsByCategory(categoryEnum);

      // Filter by priority if specified
      if (priority) {
        const priorityMap: Record<string, number> = {
          critical: 1,
          high: 2,
          medium: 3,
          low: 4,
          info: 5,
        };
        const priorityValue = priorityMap[priority.toLowerCase()];
        if (priorityValue) {
          insights = insights.filter((i) => i.priority === priorityValue);
        }
      }

      // Apply limit if specified
      if (limit) {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum)) {
          insights = insights.slice(0, limitNum);
        }
      }

      return NextResponse.json(
        {
          category: categoryEnum,
          insights,
          count: insights.length,
        },
        { status: 200 }
      );
    }

    // If limit specified without category, return top insights
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum)) {
        let topInsights = await getTopInsights(limitNum);

        // Filter by priority if specified
        if (priority) {
          const priorityMap: Record<string, number> = {
            critical: 1,
            high: 2,
            medium: 3,
            low: 4,
            info: 5,
          };
          const priorityValue = priorityMap[priority.toLowerCase()];
          if (priorityValue) {
            topInsights = topInsights.filter((i) => i.priority === priorityValue);
          }
        }

        return NextResponse.json(
          {
            insights: topInsights,
            count: topInsights.length,
          },
          { status: 200 }
        );
      }
    }

    // Default: return all insights by category
    const allInsights = await getAllInsights();

    // Filter by priority if specified
    if (priority) {
      const priorityMap: Record<string, number> = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4,
        info: 5,
      };
      const priorityValue = priorityMap[priority.toLowerCase()];
      if (priorityValue) {
        Object.keys(allInsights).forEach((key) => {
          const categoryKey = key as InsightCategory;
          allInsights[categoryKey] = allInsights[categoryKey].filter(
            (i) => i.priority === priorityValue
          );
        });
      }
    }

    // Calculate totals
    const totalInsights = Object.values(allInsights).reduce(
      (sum, insights) => sum + insights.length,
      0
    );

    // Log for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Insights API Response:", {
        total: totalInsights,
        byCategory: {
          [InsightCategory.CUSTOMER_BEHAVIOR]:
            allInsights[InsightCategory.CUSTOMER_BEHAVIOR].length,
          [InsightCategory.REVENUE_OPTIMIZATION]:
            allInsights[InsightCategory.REVENUE_OPTIMIZATION].length,
          [InsightCategory.STAFF_PERFORMANCE]:
            allInsights[InsightCategory.STAFF_PERFORMANCE].length,
          [InsightCategory.RECOMMENDATIONS]:
            allInsights[InsightCategory.RECOMMENDATIONS].length,
          [InsightCategory.REPEAT_VISITS]:
            allInsights[InsightCategory.REPEAT_VISITS].length,
          [InsightCategory.SLOT_OPTIMIZATION]:
            allInsights[InsightCategory.SLOT_OPTIMIZATION].length,
          [InsightCategory.CUSTOMER_PERSONALIZATION]:
            allInsights[InsightCategory.CUSTOMER_PERSONALIZATION].length,
        },
      });
    }

    return NextResponse.json(
      {
        insights: allInsights,
        totals: {
          [InsightCategory.CUSTOMER_BEHAVIOR]:
            allInsights[InsightCategory.CUSTOMER_BEHAVIOR].length,
          [InsightCategory.REVENUE_OPTIMIZATION]:
            allInsights[InsightCategory.REVENUE_OPTIMIZATION].length,
          [InsightCategory.STAFF_PERFORMANCE]:
            allInsights[InsightCategory.STAFF_PERFORMANCE].length,
          [InsightCategory.RECOMMENDATIONS]:
            allInsights[InsightCategory.RECOMMENDATIONS].length,
          [InsightCategory.REPEAT_VISITS]:
            allInsights[InsightCategory.REPEAT_VISITS].length,
          [InsightCategory.SLOT_OPTIMIZATION]:
            allInsights[InsightCategory.SLOT_OPTIMIZATION].length,
          [InsightCategory.CUSTOMER_PERSONALIZATION]:
            allInsights[InsightCategory.CUSTOMER_PERSONALIZATION].length,
        },
        total: totalInsights,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching insights:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      { 
        error: "Failed to fetch insights",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

