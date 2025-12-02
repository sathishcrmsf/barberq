// @cursor: Category-specific insights API endpoint
// GET /api/insights/[category] - Returns insights for a specific category

import { NextRequest, NextResponse } from "next/server";
import { getInsightsByCategory, InsightCategory, BaseInsight } from "@/lib/insights";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category: categoryParam } = await params;
    const category = categoryParam as InsightCategory;

    // Validate category
    if (!Object.values(InsightCategory).includes(category)) {
      return NextResponse.json(
        {
          error: `Invalid category: ${category}`,
          validCategories: Object.values(InsightCategory),
        },
        { status: 400 }
      );
    }

    const insights = await getInsightsByCategory(category);

    // Apply query params
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const priority = searchParams.get("priority");

    let filteredInsights: BaseInsight[] = insights;

    // Filter by priority
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
        filteredInsights = filteredInsights.filter((i) => i.priority === priorityValue);
      }
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        filteredInsights = filteredInsights.slice(0, limitNum);
      }
    }

    return NextResponse.json(
      {
        category,
        insights: filteredInsights,
        count: filteredInsights.length,
        total: insights.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error fetching insights for category:`, error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

