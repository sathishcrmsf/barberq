// @cursor: Appointment slot optimization - slow hour identification, service combinations, no-show risk prediction
// Rule-based algorithms for MVP

import {
  BaseInsight,
  InsightCategory,
  InsightPriority,
  InsightQueries,
  calculatePriority,
} from "./base";
import { prisma } from "@/lib/prisma";

/**
 * Identify slow hours that could benefit from promotional pricing
 */
export async function identifySlowHours(): Promise<{
  insights: BaseInsight[];
  slowHours: Array<{
    day: string;
    hour: number;
    averageBookings: number;
    suggestedDiscount: number;
    potentialImpact: string;
  }>;
}> {
  const walkIns = await prisma.walkIn.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Group bookings by day and hour
  const dayHourBookings = new Map<string, number[]>();

  walkIns.forEach((w) => {
    const day = w.createdAt.toLocaleDateString("en-US", { weekday: "long" });
    const hour = w.createdAt.getHours();
    const key = `${day}-${hour}`;

    if (!dayHourBookings.has(key)) {
      dayHourBookings.set(key, []);
    }
    dayHourBookings.get(key)!.push(1);
  });

  // Calculate average bookings per time slot
  const averageBookings =
    Array.from(dayHourBookings.values()).reduce(
      (sum, bookings) => sum + bookings.length,
      0
    ) / dayHourBookings.size;

  const slowHours: Array<{
    day: string;
    hour: number;
    averageBookings: number;
    suggestedDiscount: number;
    potentialImpact: string;
  }> = [];

  for (const [key, bookings] of dayHourBookings.entries()) {
    const [day, hourStr] = key.split("-");
    const hour = parseInt(hourStr);
    const bookingCount = bookings.length;

    // Consider slow if below 50% of average
    if (bookingCount < averageBookings * 0.5 && bookingCount < 2) {
      // Suggest discount based on how slow it is
      const discount = bookingCount === 0 ? 25 : bookingCount === 1 ? 15 : 10;

      slowHours.push({
        day,
        hour,
        averageBookings: bookingCount,
        suggestedDiscount: discount,
        potentialImpact:
          bookingCount === 0
            ? "Very slow - high discount recommended"
            : "Slow - moderate discount recommended",
      });
    }
  }

  // Sort by how slow (lowest bookings first)
  slowHours.sort((a, b) => a.averageBookings - b.averageBookings);

  const insights: BaseInsight[] = [];

  if (slowHours.length > 0) {
    const slowestHour = slowHours[0];
    insights.push({
      id: "slow-hours",
      category: InsightCategory.SLOT_OPTIMIZATION,
      title: "Slow Hours Identified",
      description: `${slowHours.length} time slots are consistently slow`,
      emoji: "⏰",
      priority: InsightPriority.MEDIUM,
      value: `${slowestHour.day} ${slowestHour.hour}:00`,
      actionable: true,
      actionLabel: "View Slots",
      actionUrl: "/analytics",
      metadata: {
        count: slowHours.length,
        slowestDay: slowestHour.day,
        slowestHour: slowestHour.hour,
      },
    });
  }

  return { insights, slowHours: slowHours.slice(0, 10) };
}

/**
 * Analyze service combinations for bundling
 */
export async function analyzeServiceCombinations(): Promise<{
  insights: BaseInsight[];
  combinations: Array<{
    services: string[];
    frequency: number;
    averageTimeBetween: number;
    bundlePrice: number;
    savings: number;
    confidence: number;
  }>;
}> {
  const walkIns = await prisma.walkIn.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      status: "done",
    },
    include: {
      customer: true,
    },
  });

  const services = await prisma.service.findMany();
  const serviceMap = new Map(services.map((s) => [s.name, s]));

  // Group by customer to find service combinations
  const customerServices = new Map<string, Array<{ service: string; date: Date }>>();

  walkIns.forEach((w) => {
    if (!w.customerId || !w.completedAt) return;

    if (!customerServices.has(w.customerId)) {
      customerServices.set(w.customerId, []);
    }
    customerServices.get(w.customerId)!.push({
      service: w.service,
      date: w.completedAt,
    });
  });

  // Find service pairs booked by same customer
  const servicePairs = new Map<string, { count: number; timeBetween: number[] }>();

  customerServices.forEach((serviceList) => {
    // Sort by date
    serviceList.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Find pairs booked close together (within 7 days)
    for (let i = 0; i < serviceList.length; i++) {
      for (let j = i + 1; j < serviceList.length; j++) {
        const timeDiff =
          (serviceList[j].date.getTime() - serviceList[i].date.getTime()) /
          (1000 * 60 * 60 * 24);

        if (timeDiff <= 7) {
          const pair = [serviceList[i].service, serviceList[j].service]
            .sort()
            .join(" + ");

          if (!servicePairs.has(pair)) {
            servicePairs.set(pair, { count: 0, timeBetween: [] });
          }

          const pairData = servicePairs.get(pair)!;
          pairData.count++;
          pairData.timeBetween.push(timeDiff);
        }
      }
    }
  });

  // Generate combination recommendations
  const combinations: Array<{
    services: string[];
    frequency: number;
    averageTimeBetween: number;
    bundlePrice: number;
    savings: number;
    confidence: number;
  }> = [];

  for (const [pair, data] of servicePairs.entries()) {
    if (data.count < 3) continue; // Need at least 3 occurrences

    const serviceNames = pair.split(" + ");
    const serviceObjs = serviceNames
      .map((name) => serviceMap.get(name))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);

    if (serviceObjs.length < 2) continue;

    const individualPrice = serviceObjs.reduce((sum, s) => sum + s.price, 0);
    const bundlePrice = Math.round(individualPrice * 0.85); // 15% discount
    const savings = individualPrice - bundlePrice;
    const averageTimeBetween =
      data.timeBetween.reduce((sum, t) => sum + t, 0) / data.timeBetween.length;

    combinations.push({
      services: serviceNames,
      frequency: data.count,
      averageTimeBetween: Math.round(averageTimeBetween * 10) / 10,
      bundlePrice,
      savings,
      confidence: Math.min(100, data.count * 20), // More occurrences = higher confidence
    });
  }

  // Sort by frequency
  combinations.sort((a, b) => b.frequency - a.frequency);

  const insights: BaseInsight[] = [];

  if (combinations.length > 0) {
    const topCombination = combinations[0];
    insights.push({
      id: "service-combinations",
      category: InsightCategory.SLOT_OPTIMIZATION,
      title: "Service Bundle Opportunity",
      description: `${topCombination.services.join(" + ")} frequently booked together`,
      emoji: "📦",
      priority: InsightPriority.MEDIUM,
      value: `$${topCombination.savings} savings`,
      actionable: true,
      actionLabel: "Create Bundle",
      actionUrl: "/services",
      metadata: {
        services: topCombination.services,
        frequency: topCombination.frequency,
      },
    });
  }

  return { insights, combinations: combinations.slice(0, 10) };
}

/**
 * Predict no-show risk for time slots
 */
export async function predictSlotNoShowRisk(): Promise<{
  insights: BaseInsight[];
  riskSlots: Array<{
    day: string;
    hour: number;
    noShowRisk: number; // 0-100
    factors: string[];
    recommendation: string;
  }>;
}> {
  const walkIns = await prisma.walkIn.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      customer: true,
    },
  });

  // Group by day and hour
  const dayHourData = new Map<
    string,
    { total: number; completed: number; incomplete: number }
  >();

  walkIns.forEach((w) => {
    const day = w.createdAt.toLocaleDateString("en-US", { weekday: "long" });
    const hour = w.createdAt.getHours();
    const key = `${day}-${hour}`;

    if (!dayHourData.has(key)) {
      dayHourData.set(key, { total: 0, completed: 0, incomplete: 0 });
    }

    const data = dayHourData.get(key)!;
    data.total++;

    if (w.status === "done") {
      data.completed++;
    } else if (w.status !== "waiting") {
      data.incomplete++;
    }
  });

  const riskSlots: Array<{
    day: string;
    hour: number;
    noShowRisk: number;
    factors: string[];
    recommendation: string;
  }> = [];

  for (const [key, data] of dayHourData.entries()) {
    if (data.total < 5) continue; // Need enough data

    const [day, hourStr] = key.split("-");
    const hour = parseInt(hourStr);

    let noShowRisk = 0;
    const factors: string[] = [];

    // Factor 1: Incomplete rate
    const incompleteRate = data.incomplete / data.total;
    if (incompleteRate > 0.2) {
      noShowRisk += incompleteRate * 50;
      factors.push(`${Math.round(incompleteRate * 100)}% incomplete rate`);
    }

    // Factor 2: Completion rate
    const completionRate = data.completed / data.total;
    if (completionRate < 0.7) {
      noShowRisk += (1 - completionRate) * 30;
      factors.push(`Low completion rate (${Math.round(completionRate * 100)}%)`);
    }

    if (noShowRisk > 0) {
      let recommendation = "Monitor closely";
      if (noShowRisk >= 50) {
        recommendation = "Send confirmation reminders";
      } else if (noShowRisk >= 30) {
        recommendation = "Consider confirmation calls";
      }

      riskSlots.push({
        day,
        hour,
        noShowRisk: Math.min(100, Math.round(noShowRisk)),
        factors,
        recommendation,
      });
    }
  }

  // Sort by risk
  riskSlots.sort((a, b) => b.noShowRisk - a.noShowRisk);

  const insights: BaseInsight[] = [];

  const highRiskSlots = riskSlots.filter((s) => s.noShowRisk >= 40);
  if (highRiskSlots.length > 0) {
    insights.push({
      id: "slot-no-show-risk",
      category: InsightCategory.SLOT_OPTIMIZATION,
      title: "High No-Show Risk Slots",
      description: `${highRiskSlots.length} time slots have high no-show risk`,
      emoji: "🚫",
      priority: InsightPriority.MEDIUM,
      value: `${highRiskSlots.length} slots`,
      actionable: true,
      actionLabel: "Review Slots",
      actionUrl: "/analytics",
      metadata: { count: highRiskSlots.length },
    });
  }

  return { insights, riskSlots: riskSlots.slice(0, 10) };
}

/**
 * Get all slot optimization insights
 */
export async function getSlotOptimizationInsights(): Promise<BaseInsight[]> {
  const [slowHoursData, combinationsData, noShowData] = await Promise.all([
    identifySlowHours(),
    analyzeServiceCombinations(),
    predictSlotNoShowRisk(),
  ]);

  return [
    ...slowHoursData.insights,
    ...combinationsData.insights,
    ...noShowData.insights,
  ].sort((a, b) => a.priority - b.priority);
}

