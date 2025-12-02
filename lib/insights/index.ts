// @cursor: Main insights aggregator - combines all insight categories
// Provides unified interface for fetching all insights

import { BaseInsight, InsightCategory } from "./base";
import { getCustomerBehaviorInsights } from "./customer-behavior";
import { getRevenueOptimizationInsights } from "./revenue-optimization";
import { getStaffPerformanceInsights } from "./staff-performance";
import { getRecommendationInsights } from "./recommendations";
import { getRepeatVisitInsights } from "./repeat-visits";
import { getSlotOptimizationInsights } from "./slot-optimization";
import { getAllCustomerPersonalizationInsights } from "./customer-personalization";

export interface AllInsights {
  [InsightCategory.CUSTOMER_BEHAVIOR]: BaseInsight[];
  [InsightCategory.REVENUE_OPTIMIZATION]: BaseInsight[];
  [InsightCategory.STAFF_PERFORMANCE]: BaseInsight[];
  [InsightCategory.RECOMMENDATIONS]: BaseInsight[];
  [InsightCategory.REPEAT_VISITS]: BaseInsight[];
  [InsightCategory.SLOT_OPTIMIZATION]: BaseInsight[];
  [InsightCategory.CUSTOMER_PERSONALIZATION]: BaseInsight[];
}

/**
 * Get all insights across all categories
 * Handles errors gracefully - if one category fails, others still return
 */
export async function getAllInsights(): Promise<AllInsights> {
  // Use Promise.allSettled to handle individual failures
  const results = await Promise.allSettled([
    getCustomerBehaviorInsights().catch((e) => {
      console.error("Error in customer behavior insights:", e);
      console.error("Stack:", e instanceof Error ? e.stack : "No stack");
      return [];
    }),
    getRevenueOptimizationInsights().catch((e) => {
      console.error("Error in revenue optimization insights:", e);
      console.error("Stack:", e instanceof Error ? e.stack : "No stack");
      return [];
    }),
    getStaffPerformanceInsights().catch((e) => {
      console.error("Error in staff performance insights:", e);
      console.error("Stack:", e instanceof Error ? e.stack : "No stack");
      return [];
    }),
    getRecommendationInsights().catch((e) => {
      console.error("Error in recommendation insights:", e);
      console.error("Stack:", e instanceof Error ? e.stack : "No stack");
      return [];
    }),
    getRepeatVisitInsights().catch((e) => {
      console.error("Error in repeat visit insights:", e);
      console.error("Stack:", e instanceof Error ? e.stack : "No stack");
      return [];
    }),
    getSlotOptimizationInsights().catch((e) => {
      console.error("Error in slot optimization insights:", e);
      console.error("Stack:", e instanceof Error ? e.stack : "No stack");
      return [];
    }),
    getAllCustomerPersonalizationInsights().catch((e) => {
      console.error("Error in customer personalization insights:", e);
      console.error("Stack:", e instanceof Error ? e.stack : "No stack");
      return [];
    }),
  ]);

  // Extract results, defaulting to empty array if rejected
  const [
    customerBehavior,
    revenueOptimization,
    staffPerformance,
    recommendations,
    repeatVisits,
    slotOptimization,
    customerPersonalization,
  ] = results.map((result, index) => {
    if (result.status === "rejected") {
      const categoryNames = [
        "customer-behavior",
        "revenue-optimization",
        "staff-performance",
        "recommendations",
        "repeat-visits",
        "slot-optimization",
        "customer-personalization",
      ];
      console.error(`Category ${categoryNames[index]} was rejected:`, result.reason);
      return [];
    }
    return result.value;
  });

  // Log summary
  const total = customerBehavior.length + revenueOptimization.length + 
                staffPerformance.length + recommendations.length + 
                repeatVisits.length + slotOptimization.length + 
                customerPersonalization.length;
  console.log(`Generated ${total} total insights across all categories`);

  return {
    [InsightCategory.CUSTOMER_BEHAVIOR]: customerBehavior,
    [InsightCategory.REVENUE_OPTIMIZATION]: revenueOptimization,
    [InsightCategory.STAFF_PERFORMANCE]: staffPerformance,
    [InsightCategory.RECOMMENDATIONS]: recommendations,
    [InsightCategory.REPEAT_VISITS]: repeatVisits,
    [InsightCategory.SLOT_OPTIMIZATION]: slotOptimization,
    [InsightCategory.CUSTOMER_PERSONALIZATION]: customerPersonalization,
  };
}

/**
 * Get top insights across all categories, sorted by priority
 */
export async function getTopInsights(limit: number = 10): Promise<BaseInsight[]> {
  const allInsights = await getAllInsights();
  const flatInsights: BaseInsight[] = [];

  // Flatten all insights
  Object.values(allInsights).forEach((insights) => {
    flatInsights.push(...insights);
  });

  // Sort by priority and return top N
  return flatInsights.sort((a, b) => a.priority - b.priority).slice(0, limit);
}

/**
 * Get insights for a specific category
 */
export async function getInsightsByCategory(
  category: InsightCategory
): Promise<BaseInsight[]> {
  try {
    switch (category) {
      case InsightCategory.CUSTOMER_BEHAVIOR:
        return await getCustomerBehaviorInsights();
      case InsightCategory.REVENUE_OPTIMIZATION:
        return await getRevenueOptimizationInsights();
      case InsightCategory.STAFF_PERFORMANCE:
        return await getStaffPerformanceInsights();
      case InsightCategory.RECOMMENDATIONS:
        return await getRecommendationInsights();
      case InsightCategory.REPEAT_VISITS:
        return await getRepeatVisitInsights();
      case InsightCategory.SLOT_OPTIMIZATION:
        return await getSlotOptimizationInsights();
      case InsightCategory.CUSTOMER_PERSONALIZATION:
        return await getAllCustomerPersonalizationInsights();
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error fetching insights for category ${category}:`, error);
    return [];
  }
}

// Re-export types and enums
export * from "./base";
export * from "./customer-behavior";
export * from "./revenue-optimization";
export * from "./staff-performance";
export * from "./recommendations";
export * from "./repeat-visits";
export * from "./slot-optimization";
export * from "./customer-personalization";

