// @cursor: AI recommendation engine - social media timing, service packages, personalized offers, staffing optimization
// Rule-based recommendations for MVP, ML-ready for future

import {
  BaseInsight,
  InsightCategory,
  InsightPriority,
  InsightQueries,
  calculatePriority,
} from "./base";
import { prisma } from "@/lib/prisma";

/**
 * Recommend optimal social media posting times
 */
export async function recommendSocialMediaTiming(): Promise<{
  insights: BaseInsight[];
  recommendations: Array<{
    day: string;
    hour: number;
    engagementScore: number;
    reason: string;
  }>;
}> {
  const walkIns = await prisma.walkIn.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Analyze booking patterns by day and hour
  const dayHourMap = new Map<string, number>();

  walkIns.forEach((w) => {
    const day = w.createdAt.toLocaleDateString("en-US", { weekday: "long" });
    const hour = w.createdAt.getHours();
    const key = `${day}-${hour}`;
    dayHourMap.set(key, (dayHourMap.get(key) || 0) + 1);
  });

  // Calculate engagement scores (bookings = engagement proxy)
  const recommendations: Array<{
    day: string;
    hour: number;
    engagementScore: number;
    reason: string;
  }> = [];

  for (const [key, count] of dayHourMap.entries()) {
    const [day, hourStr] = key.split("-");
    const hour = parseInt(hourStr);

    // Higher booking count = higher engagement potential
    const engagementScore = count * 10; // Scale for readability

    if (count >= 3) {
      // Peak times (typically 1-2 hours before bookings)
      const postHour = hour - 1 >= 0 ? hour - 1 : 23;
      recommendations.push({
        day,
        hour: postHour,
        engagementScore,
        reason: `Peak booking time at ${hour}:00 (${count} bookings)`,
      });
    }
  }

  // Sort by engagement score
  recommendations.sort((a, b) => b.engagementScore - a.engagementScore);

  const insights: BaseInsight[] = [];

  if (recommendations.length > 0) {
    const topRecommendation = recommendations[0];
    insights.push({
      id: "social-media-timing",
      category: InsightCategory.RECOMMENDATIONS,
      title: "Best Social Media Time",
      description: `Post on ${topRecommendation.day} at ${topRecommendation.hour}:00 for maximum engagement`,
      emoji: "📱",
      priority: InsightPriority.INFO,
      value: `${topRecommendation.day} ${topRecommendation.hour}:00`,
      actionable: false,
      metadata: { day: topRecommendation.day, hour: topRecommendation.hour },
    });
  }

  return { insights, recommendations: recommendations.slice(0, 5) };
}

/**
 * Recommend service packages
 */
export async function recommendServicePackages(): Promise<{
  insights: BaseInsight[];
  packages: Array<{
    name: string;
    services: string[];
    currentRevenue: number;
    potentialRevenue: number;
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
      Customer: true,
    },
  });

  const services = await prisma.service.findMany();
  const serviceMap = new Map(services.map((s) => [s.name, s]));

  // Find frequently booked service combinations
  const customerServices = new Map<string, Set<string>>();

  walkIns.forEach((w) => {
    if (!w.customerId) return;
    if (!customerServices.has(w.customerId)) {
      customerServices.set(w.customerId, new Set());
    }
    customerServices.get(w.customerId)!.add(w.service);
  });

  // Count service pairs
  const servicePairs = new Map<string, number>();

  customerServices.forEach((serviceSet) => {
    const servicesArray = Array.from(serviceSet);
    for (let i = 0; i < servicesArray.length; i++) {
      for (let j = i + 1; j < servicesArray.length; j++) {
        const pair = [servicesArray[i], servicesArray[j]].sort().join(" + ");
        servicePairs.set(pair, (servicePairs.get(pair) || 0) + 1);
      }
    }
  });

  // Generate package recommendations
  const packages: Array<{
    name: string;
    services: string[];
    currentRevenue: number;
    potentialRevenue: number;
    savings: number;
    confidence: number;
  }> = [];

  for (const [pair, count] of servicePairs.entries()) {
    if (count < 3) continue; // Need at least 3 customers booking this combo

    const serviceNames = pair.split(" + ");
    const serviceObjs = serviceNames
      .map((name) => serviceMap.get(name))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);

    if (serviceObjs.length < 2) continue;

    const currentRevenue = serviceObjs.reduce((sum, s) => sum + s.price, 0);
    const potentialRevenue = currentRevenue * 0.9; // 10% discount for package
    const savings = currentRevenue - potentialRevenue;

    packages.push({
      name: `${serviceNames[0]} + ${serviceNames[1]} Package`,
      services: serviceNames,
      currentRevenue,
      potentialRevenue: Math.round(potentialRevenue),
      savings: Math.round(savings),
      confidence: Math.min(100, count * 15), // More bookings = higher confidence
    });
  }

  packages.sort((a, b) => b.confidence - a.confidence);

  const insights: BaseInsight[] = [];

  if (packages.length > 0) {
    const topPackage = packages[0];
    insights.push({
      id: "service-packages",
      category: InsightCategory.RECOMMENDATIONS,
      title: "Service Package Opportunity",
      description: `${topPackage.name} is frequently booked together`,
      emoji: "📦",
      priority: InsightPriority.MEDIUM,
      value: `₹${topPackage.savings} savings`,
      actionable: true,
      actionLabel: "Create Package",
      actionUrl: "/services",
      metadata: { packageName: topPackage.name },
    });
  }

  return { insights, packages: packages.slice(0, 5) };
}

/**
 * Generate personalized offers for customers
 */
export async function generatePersonalizedOffers(): Promise<{
  insights: BaseInsight[];
  offers: Array<{
    customerId: string;
    customerName: string;
    phone: string;
    offer: string;
    discount: number;
    reason: string;
    confidence: number;
  }>;
}> {
  const customerHistory = await InsightQueries.getCustomerHistory(undefined, 365);
  const services = await prisma.service.findMany({ where: { isActive: true } });
  const averagePrice = services.reduce((sum, s) => sum + s.price, 0) / services.length;

  const offers: Array<{
    customerId: string;
    customerName: string;
    phone: string;
    offer: string;
    discount: number;
    reason: string;
    confidence: number;
  }> = [];

  for (const history of customerHistory) {
    // Offer 1: Win-back for inactive customers
    if (history.daysSinceLastVisit && history.daysSinceLastVisit >= 60) {
      offers.push({
        customerId: history.customerId,
        customerName: history.customerName,
        phone: history.phone,
        offer: "Welcome Back - 15% Off",
        discount: 15,
        reason: `Haven't visited in ${history.daysSinceLastVisit} days`,
        confidence: 80,
      });
      continue;
    }

    // Offer 2: Upsell for basic service only customers
    const hasOnlyBasic = history.servicesBooked.every((s) => {
      const service = services.find((serv) => serv.name === s);
      return service && service.price <= averagePrice;
    });

    if (hasOnlyBasic && history.servicesBooked.length >= 3) {
      const premiumServices = services.filter((s) => s.price > averagePrice);
      if (premiumServices.length > 0) {
        offers.push({
          customerId: history.customerId,
          customerName: history.customerName,
          phone: history.phone,
          offer: "Try Premium - 20% Off",
          discount: 20,
          reason: "Frequent customer, upgrade opportunity",
          confidence: 60,
        });
      }
      continue;
    }

    // Offer 3: Loyalty reward for frequent visitors
    if (
      history.totalVisits >= 10 &&
      history.averageDaysBetweenVisits &&
      history.averageDaysBetweenVisits < 30
    ) {
      offers.push({
        customerId: history.customerId,
        customerName: history.customerName,
        phone: history.phone,
        offer: "Loyalty Reward - 10% Off",
        discount: 10,
        reason: `${history.totalVisits} visits - loyal customer`,
        confidence: 70,
      });
    }
  }

  // Sort by confidence
  offers.sort((a, b) => b.confidence - a.confidence);

  const insights: BaseInsight[] = [];

  const highConfidenceOffers = offers.filter((o) => o.confidence >= 60);
  if (highConfidenceOffers.length > 0) {
    insights.push({
      id: "personalized-offers",
      category: InsightCategory.RECOMMENDATIONS,
      title: "Personalized Offers Ready",
      description: `${highConfidenceOffers.length} customers have personalized offers`,
      emoji: "🎁",
      priority: InsightPriority.MEDIUM,
      value: `${highConfidenceOffers.length} offers`,
      actionable: true,
      actionLabel: "View Offers",
      actionUrl: "/customers?filter=offers",
      metadata: { count: highConfidenceOffers.length },
    });
  }

  return { insights, offers: offers.slice(0, 20) };
}

/**
 * Recommend optimal staffing levels
 */
export async function recommendStaffingLevels(): Promise<{
  insights: BaseInsight[];
  recommendations: Array<{
    day: string;
    hour: number;
    currentBookings: number;
    recommendedStaff: number;
    reason: string;
  }>;
}> {
  const walkIns = await prisma.walkIn.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Analyze booking patterns by day and hour
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

  const recommendations: Array<{
    day: string;
    hour: number;
    currentBookings: number;
    recommendedStaff: number;
    reason: string;
  }> = [];

  // Assume 1 staff can handle 2 bookings per hour on average
  const bookingsPerStaffPerHour = 2;

  for (const [key, bookings] of dayHourBookings.entries()) {
    const [day, hourStr] = key.split("-");
    const hour = parseInt(hourStr);
    const bookingCount = bookings.length;

    // Calculate recommended staff (round up)
    const recommendedStaff = Math.ceil(bookingCount / bookingsPerStaffPerHour);

    if (bookingCount >= 4) {
      recommendations.push({
        day,
        hour,
        currentBookings: bookingCount,
        recommendedStaff,
        reason: `${bookingCount} bookings typically at this time`,
      });
    }
  }

  // Sort by booking count
  recommendations.sort((a, b) => b.currentBookings - a.currentBookings);

  const insights: BaseInsight[] = [];

  if (recommendations.length > 0) {
    const peakTime = recommendations[0];
    insights.push({
      id: "staffing-recommendation",
      category: InsightCategory.RECOMMENDATIONS,
      title: "Peak Hour Staffing",
      description: `${peakTime.day} ${peakTime.hour}:00 typically needs ${peakTime.recommendedStaff} staff`,
      emoji: "👥",
      priority: InsightPriority.MEDIUM,
      value: `${peakTime.recommendedStaff} staff`,
      actionable: true,
      actionLabel: "View Schedule",
      actionUrl: "/staff",
      metadata: { day: peakTime.day, hour: peakTime.hour },
    });
  }

  return { insights, recommendations: recommendations.slice(0, 10) };
}

/**
 * Get all recommendation insights
 */
export async function getRecommendationInsights(): Promise<BaseInsight[]> {
  const [socialMediaData, packagesData, offersData, staffingData] = await Promise.all([
    recommendSocialMediaTiming(),
    recommendServicePackages(),
    generatePersonalizedOffers(),
    recommendStaffingLevels(),
  ]);

  return [
    ...socialMediaData.insights,
    ...packagesData.insights,
    ...offersData.insights,
    ...staffingData.insights,
  ].sort((a, b) => a.priority - b.priority);
}

