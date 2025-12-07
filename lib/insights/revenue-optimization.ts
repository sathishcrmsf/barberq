// @cursor: Revenue optimization insights - service analysis, cash flow trends, staff revenue, pricing suggestions
// Rule-based algorithms for MVP

import {
  BaseInsight,
  InsightCategory,
  InsightPriority,
  InsightQueries,
  ServiceTrend,
  StaffPerformance,
  calculatePriority,
} from "./base";
import { prisma } from "@/lib/prisma";

/**
 * Analyze service revenue and identify opportunities
 */
export async function analyzeServiceRevenue(): Promise<{
  insights: BaseInsight[];
  serviceTrends: ServiceTrend[];
}> {
  const serviceTrends = await InsightQueries.getServiceTrends(30);
  const insights: BaseInsight[] = [];

  // Find declining services
  const decliningServices = serviceTrends.filter(
    (s) => s.growthRate < -20 && s.bookingsThisPeriod >= 3
  );

  if (decliningServices.length > 0) {
    const topDeclining = decliningServices[0];
    insights.push({
      id: "declining-services",
      category: InsightCategory.REVENUE_OPTIMIZATION,
      title: "Declining Services",
      description: `${decliningServices.length} services showing negative growth`,
      emoji: "📉",
      priority: InsightPriority.HIGH,
      value: `${topDeclining.serviceName}: ${topDeclining.growthRate.toFixed(0)}%`,
      actionable: true,
      actionLabel: "Review Services",
      actionUrl: "/analytics",
      metadata: { decliningCount: decliningServices.length },
    });
  }

  // Find top revenue generators
  const topRevenueServices = serviceTrends
    .filter((s) => s.totalRevenue > 0)
    .slice(0, 3);

  if (topRevenueServices.length > 0) {
    const topService = topRevenueServices[0];
    insights.push({
      id: "top-revenue-service",
      category: InsightCategory.REVENUE_OPTIMIZATION,
      title: "Top Revenue Service",
      description: `${topService.serviceName} generates the most revenue`,
      emoji: "⭐",
      priority: InsightPriority.INFO,
      value: `₹${topService.totalRevenue.toFixed(0)}`,
      actionable: true,
      actionLabel: "View Details",
      actionUrl: "/analytics",
      metadata: { serviceName: topService.serviceName },
    });
  }

  // Calculate revenue per hour
  const revenuePerHour = serviceTrends.map((trend) => {
    const hours = (trend.completedBookings * trend.duration) / 60;
    return {
      ...trend,
      revenuePerHour: hours > 0 ? trend.totalRevenue / hours : 0,
    };
  });

  const topRevenuePerHour = revenuePerHour
    .filter((s) => s.revenuePerHour > 0)
    .sort((a, b) => b.revenuePerHour - a.revenuePerHour)[0];

  if (topRevenuePerHour) {
    insights.push({
      id: "revenue-per-hour",
      category: InsightCategory.REVENUE_OPTIMIZATION,
      title: "Best Revenue/Hour",
      description: `${topRevenuePerHour.serviceName} generates highest revenue per hour`,
      emoji: "⚡",
      priority: InsightPriority.INFO,
      value: `₹${topRevenuePerHour.revenuePerHour.toFixed(0)}/hr`,
      actionable: false,
      metadata: { serviceName: topRevenuePerHour.serviceName },
    });
  }

  return { insights, serviceTrends };
}

/**
 * Analyze cash flow trends
 */
export async function analyzeCashFlowTrends(): Promise<{
  insights: BaseInsight[];
  trends: {
    daily: Array<{ date: string; revenue: number }>;
    weekly: Array<{ week: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
    dayOfWeek: Record<string, number>;
    hourOfDay: Record<string, number>;
  };
}> {
  const walkIns = await prisma.walkIn.findMany({
    where: {
      status: "done",
      completedAt: { not: null },
    },
    include: {
      Customer: true,
    },
  });

  const services = await prisma.service.findMany();
  const serviceMap = new Map(services.map((s) => [s.name, s.price]));

  // Calculate revenue per walk-in
  const revenueData = walkIns
    .filter((w) => w.completedAt)
    .map((w) => {
      const price = serviceMap.get(w.service) || 0;
      return {
        date: w.completedAt!,
        revenue: price,
        dayOfWeek: w.completedAt!.toLocaleDateString("en-US", { weekday: "long" }),
        hour: w.completedAt!.getHours(),
      };
    });

  // Daily trends (last 30 days)
  const dailyMap = new Map<string, number>();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  revenueData
    .filter((d) => d.date >= thirtyDaysAgo)
    .forEach((d) => {
      const dateKey = d.date.toISOString().split("T")[0];
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + d.revenue);
    });

  const daily = Array.from(dailyMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Weekly trends (last 12 weeks)
  const weeklyMap = new Map<string, number>();
  revenueData.forEach((d) => {
    const weekStart = new Date(d.date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];
    weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + d.revenue);
  });

  const weekly = Array.from(weeklyMap.entries())
    .map(([week, revenue]) => ({ week, revenue }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12);

  // Monthly trends
  const monthlyMap = new Map<string, number>();
  revenueData.forEach((d) => {
    const monthKey = `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + d.revenue);
  });

  const monthly = Array.from(monthlyMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Day of week patterns
  const dayOfWeek: Record<string, number> = {};
  revenueData.forEach((d) => {
    dayOfWeek[d.dayOfWeek] = (dayOfWeek[d.dayOfWeek] || 0) + d.revenue;
  });

  // Hour of day patterns
  const hourOfDay: Record<string, number> = {};
  revenueData.forEach((d) => {
    const hourKey = `${d.hour}:00`;
    hourOfDay[hourKey] = (hourOfDay[hourKey] || 0) + d.revenue;
  });

  const insights: BaseInsight[] = [];

  // Compare this week vs last week
  if (weekly.length >= 2) {
    const thisWeek = weekly[weekly.length - 1].revenue;
    const lastWeek = weekly[weekly.length - 2].revenue;
    const change = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

    if (change > 20) {
      insights.push({
        id: "revenue-up-week",
        category: InsightCategory.REVENUE_OPTIMIZATION,
        title: "Revenue Up This Week",
        description: `Revenue increased ${change.toFixed(0)}% compared to last week`,
        emoji: "📈",
        priority: InsightPriority.INFO,
        value: `+${change.toFixed(0)}%`,
        actionable: false,
        metadata: { change, thisWeek, lastWeek },
      });
    } else if (change < -20 && thisWeek > 0) {
      insights.push({
        id: "revenue-down-week",
        category: InsightCategory.REVENUE_OPTIMIZATION,
        title: "Revenue Down This Week",
        description: `Revenue decreased ${Math.abs(change).toFixed(0)}% compared to last week`,
        emoji: "📉",
        priority: InsightPriority.HIGH,
        value: `${change.toFixed(0)}%`,
        actionable: true,
        actionLabel: "Review Trends",
        actionUrl: "/analytics",
        metadata: { change, thisWeek, lastWeek },
      });
    }
  }

  // Find best day of week
  const bestDay = Object.entries(dayOfWeek).sort((a, b) => b[1] - a[1])[0];
  if (bestDay) {
    insights.push({
      id: "best-day",
      category: InsightCategory.REVENUE_OPTIMIZATION,
      title: "Best Revenue Day",
      description: `${bestDay[0]} generates the most revenue`,
      emoji: "📅",
      priority: InsightPriority.INFO,
      value: `₹${bestDay[1].toFixed(0)}`,
      actionable: false,
      metadata: { day: bestDay[0] },
    });
  }

  return {
    insights,
    trends: {
      daily,
      weekly,
      monthly,
      dayOfWeek,
      hourOfDay,
    },
  };
}

/**
 * Analyze staff revenue performance
 */
export async function analyzeStaffRevenue(): Promise<{
  insights: BaseInsight[];
  staffPerformance: StaffPerformance[];
}> {
  const staffPerformance = await InsightQueries.getStaffPerformance(30);
  const insights: BaseInsight[] = [];

  if (staffPerformance.length === 0) {
    return { insights, staffPerformance };
  }

  // Find top revenue generator
  const topPerformer = staffPerformance[0];
  if (topPerformer.totalRevenue > 0) {
    insights.push({
      id: "top-staff-revenue",
      category: InsightCategory.REVENUE_OPTIMIZATION,
      title: "Top Revenue Generator",
      description: `${topPerformer.staffName} generates the most revenue`,
      emoji: "⭐",
      priority: InsightPriority.INFO,
      value: `₹${topPerformer.totalRevenue.toFixed(0)}`,
      actionable: true,
      actionLabel: "View Staff",
      actionUrl: "/staff",
      metadata: { staffId: topPerformer.staffId },
    });
  }

  // Find most efficient (revenue per service)
  const efficientStaff = staffPerformance
    .filter((s) => s.completedServices > 0)
    .sort((a, b) => {
      const aEfficiency = a.totalRevenue / a.completedServices;
      const bEfficiency = b.totalRevenue / b.completedServices;
      return bEfficiency - aEfficiency;
    })[0];

  if (efficientStaff) {
    const efficiency = efficientStaff.totalRevenue / efficientStaff.completedServices;
    insights.push({
      id: "most-efficient-staff",
      category: InsightCategory.REVENUE_OPTIMIZATION,
      title: "Most Efficient Staff",
      description: `${efficientStaff.staffName} has highest revenue per service`,
      emoji: "⚡",
      priority: InsightPriority.INFO,
      value: `₹${efficiency.toFixed(0)}/service`,
      actionable: false,
      metadata: { staffId: efficientStaff.staffId },
    });
  }

  // Flag underperformers
  const averageRevenue =
    staffPerformance.reduce((sum, s) => sum + s.totalRevenue, 0) /
    staffPerformance.length;
  const underperformers = staffPerformance.filter(
    (s) => s.totalRevenue < averageRevenue * 0.7 && s.completedServices >= 5
  );

  if (underperformers.length > 0) {
    insights.push({
      id: "underperforming-staff",
      category: InsightCategory.REVENUE_OPTIMIZATION,
      title: "Staff Training Opportunity",
      description: `${underperformers.length} staff members below average revenue`,
      emoji: "📚",
      priority: InsightPriority.MEDIUM,
      value: `${underperformers.length} staff`,
      actionable: true,
      actionLabel: "Review Staff",
      actionUrl: "/staff",
      metadata: { count: underperformers.length },
    });
  }

  return { insights, staffPerformance };
}

/**
 * Generate pricing suggestions
 */
export async function generatePricingSuggestions(): Promise<{
  insights: BaseInsight[];
  suggestions: Array<{
    serviceId: string;
    serviceName: string;
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
    confidence: number;
  }>;
}> {
  const serviceTrends = await InsightQueries.getServiceTrends(60);
  const suggestions: Array<{
    serviceId: string;
    serviceName: string;
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
    confidence: number;
  }> = [];

  for (const trend of serviceTrends) {
    // Suggestion 1: Price increase for high-demand, low-price services
    if (
      trend.growthRate > 30 &&
      trend.bookingsThisPeriod >= 10 &&
      trend.price < 50
    ) {
      const suggestedPrice = Math.min(trend.price * 1.15, trend.price + 10);
      suggestions.push({
        serviceId: trend.serviceId,
        serviceName: trend.serviceName,
        currentPrice: trend.price,
        suggestedPrice: Math.round(suggestedPrice),
        reason: "High demand, low price - opportunity to increase",
        confidence: 70,
      });
    }

    // Suggestion 2: Price decrease for declining services
    if (trend.growthRate < -30 && trend.bookingsThisPeriod >= 5) {
      const suggestedPrice = Math.max(trend.price * 0.9, trend.price - 5);
      suggestions.push({
        serviceId: trend.serviceId,
        serviceName: trend.serviceName,
        currentPrice: trend.price,
        suggestedPrice: Math.round(suggestedPrice),
        reason: "Declining demand - consider promotional pricing",
        confidence: 60,
      });
    }

    // Suggestion 3: Optimize based on revenue per hour
    const hours = (trend.completedBookings * trend.duration) / 60;
    const revenuePerHour = hours > 0 ? trend.totalRevenue / hours : 0;
    const averageRevenuePerHour = 50; // Placeholder - would calculate from all services

    if (revenuePerHour < averageRevenuePerHour * 0.8 && trend.completedBookings >= 5) {
      const suggestedPrice = trend.price * 1.1;
      suggestions.push({
        serviceId: trend.serviceId,
        serviceName: trend.serviceName,
        currentPrice: trend.price,
        suggestedPrice: Math.round(suggestedPrice),
        reason: "Low revenue per hour - increase price to optimize",
        confidence: 50,
      });
    }
  }

  const insights: BaseInsight[] = [];

  if (suggestions.length > 0) {
    const highConfidence = suggestions.filter((s) => s.confidence >= 60);
    if (highConfidence.length > 0) {
      insights.push({
        id: "pricing-suggestions",
        category: InsightCategory.REVENUE_OPTIMIZATION,
        title: "Pricing Optimization",
        description: `${highConfidence.length} services have pricing opportunities`,
        emoji: "💵",
        priority: InsightPriority.MEDIUM,
        value: `${highConfidence.length} suggestions`,
        actionable: true,
        actionLabel: "View Suggestions",
        actionUrl: "/services",
        metadata: { count: highConfidence.length },
      });
    }
  }

  return { insights, suggestions };
}

/**
 * Get all revenue optimization insights
 */
export async function getRevenueOptimizationInsights(): Promise<BaseInsight[]> {
  const [serviceData, cashFlowData, staffData, pricingData] = await Promise.all([
    analyzeServiceRevenue(),
    analyzeCashFlowTrends(),
    analyzeStaffRevenue(),
    generatePricingSuggestions(),
  ]);

  return [
    ...serviceData.insights,
    ...cashFlowData.insights,
    ...staffData.insights,
    ...pricingData.insights,
  ].sort((a, b) => a.priority - b.priority);
}

