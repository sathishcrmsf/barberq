// @cursor: Personalized customer insights - visit history, service recommendations, next service due date
// Rule-based personalization for MVP

import {
  BaseInsight,
  InsightCategory,
  InsightPriority,
  InsightQueries,
  CustomerHistory,
  calculatePriority,
} from "./base";
import { prisma } from "@/lib/prisma";

/**
 * Build comprehensive visit history for a customer
 */
export async function getCustomerVisitHistory(
  customerId: string
): Promise<{
  history: CustomerHistory | null;
  visitDetails: Array<{
    date: Date;
    service: string;
    price: number;
    staffName: string | null;
    status: string;
  }>;
}> {
  const customerHistory = await InsightQueries.getCustomerHistory(customerId, 365);
  const history = customerHistory[0] || null;

  if (!history) {
    return { history: null, visitDetails: [] };
  }

  const walkIns = await prisma.walkIn.findMany({
    where: {
      customerId,
    },
    include: {
      Staff: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const services = await prisma.service.findMany();
  const serviceMap = new Map(services.map((s) => [s.name, s]));

  const visitDetails = walkIns.map((w) => ({
    date: w.createdAt,
    service: w.service,
    price: serviceMap.get(w.service)?.price || 0,
    staffName: w.Staff?.name || null,
    status: w.status,
  }));

  return { history, visitDetails };
}

/**
 * Recommend services for a customer
 */
export async function recommendServicesForCustomer(
  customerId: string
): Promise<{
  recommendations: Array<{
    serviceName: string;
    reason: string;
    confidence: number;
    price: number;
  }>;
}> {
  const customerHistory = await InsightQueries.getCustomerHistory(customerId, 365);
  const history = customerHistory[0];

  if (!history) {
    return { recommendations: [] };
  }

  const allServices = await prisma.service.findMany({ where: { isActive: true } });
  const averagePrice = allServices.reduce((sum, s) => sum + s.price, 0) / allServices.length;

  const recommendations: Array<{
    serviceName: string;
    reason: string;
    confidence: number;
    price: number;
  }> = [];

  // Recommendation 1: Upgrade to premium services
  const premiumServices = allServices.filter((s) => s.price > averagePrice);
  const untriedPremium = premiumServices.filter(
    (s) => !history.servicesBooked.includes(s.name)
  );

  for (const service of untriedPremium.slice(0, 2)) {
    let confidence = 40;
    if (history.totalSpent > 200) confidence += 20;
    if (history.totalVisits >= 5) confidence += 20;
    if (history.averageDaysBetweenVisits && history.averageDaysBetweenVisits < 30) {
      confidence += 20;
    }

    recommendations.push({
      serviceName: service.name,
      reason: "Upgrade opportunity - you've been loyal, try premium",
      confidence: Math.min(100, confidence),
      price: service.price,
    });
  }

  // Recommendation 2: Complementary services based on history
  const favoriteService = history.favoriteServices[0]?.serviceName;
  if (favoriteService) {
    const favoriteServiceObj = allServices.find((s) => s.name === favoriteService);
    if (favoriteServiceObj) {
      // Find services in same category or complementary
      const complementaryServices = allServices.filter(
        (s) =>
          s.name !== favoriteService &&
          !history.servicesBooked.includes(s.name) &&
          s.price <= favoriteServiceObj.price * 1.5
      );

      for (const service of complementaryServices.slice(0, 2)) {
        recommendations.push({
          serviceName: service.name,
          reason: `Complements your favorite: ${favoriteService}`,
          confidence: 50,
          price: service.price,
        });
      }
    }
  }

  // Recommendation 3: Services similar to what they book
  const similarServices = allServices.filter(
    (s) =>
      !history.servicesBooked.includes(s.name) &&
      Math.abs(s.price - history.averageTicketSize) < 20
  );

  for (const service of similarServices.slice(0, 2)) {
    recommendations.push({
      serviceName: service.name,
      reason: "Similar to your usual services",
      confidence: 45,
      price: service.price,
    });
  }

  // Sort by confidence
  recommendations.sort((a, b) => b.confidence - a.confidence);

  return { recommendations: recommendations.slice(0, 5) };
}

/**
 * Predict next service due date
 */
export async function predictNextServiceDue(
  customerId: string
): Promise<{
  predictedDate: Date | null;
  confidence: number;
  reason: string;
}> {
  const customerHistory = await InsightQueries.getCustomerHistory(customerId, 365);
  const history = customerHistory[0];

  if (!history || !history.averageDaysBetweenVisits) {
    return {
      predictedDate: null,
      confidence: 0,
      reason: "Not enough visit history",
    };
  }

  const lastVisit = history.lastVisitDate;
  if (!lastVisit) {
    return {
      predictedDate: null,
      confidence: 0,
      reason: "No previous visits",
    };
  }

  // Predict based on average days between visits
  const predictedDays = history.averageDaysBetweenVisits;
  const predictedDate = new Date(lastVisit);
  predictedDate.setDate(predictedDate.getDate() + Math.round(predictedDays));

  // Calculate confidence based on visit consistency
  let confidence = 50;
  if (history.totalVisits >= 10) confidence += 20;
  if (history.totalVisits >= 20) confidence += 10;

  // Check if they're regular (low variance in visit frequency)
  const variance = history.averageDaysBetweenVisits * 0.3; // Assume 30% variance
  if (variance < 10) confidence += 20; // Very regular

  let reason = `Based on your average visit frequency (every ${Math.round(predictedDays)} days)`;
  if (confidence >= 70) {
    reason += " - High confidence prediction";
  } else if (confidence >= 50) {
    reason += " - Moderate confidence";
  } else {
    reason += " - Low confidence, more data needed";
  }

  return {
    predictedDate,
    confidence: Math.min(100, confidence),
    reason,
  };
}

/**
 * Get personalized insights for a customer
 */
export async function getCustomerPersonalizedInsights(
  customerId: string
): Promise<{
  insights: BaseInsight[];
  visitHistory: CustomerHistory | null;
  serviceRecommendations: Array<{
    serviceName: string;
    reason: string;
    confidence: number;
    price: number;
  }>;
  nextServiceDue: {
    predictedDate: Date | null;
    confidence: number;
    reason: string;
  };
}> {
  const [historyData, recommendations, nextDue] = await Promise.all([
    getCustomerVisitHistory(customerId),
    recommendServicesForCustomer(customerId),
    predictNextServiceDue(customerId),
  ]);

  const insights: BaseInsight[] = [];

  // Insight: Next service due
  if (nextDue.predictedDate && nextDue.confidence >= 50) {
    const daysUntil = Math.ceil(
      (nextDue.predictedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil <= 7 && daysUntil >= -7) {
      insights.push({
        id: `next-service-due-${customerId}`,
        category: InsightCategory.CUSTOMER_PERSONALIZATION,
        title: "Time for Your Next Visit",
        description: nextDue.reason,
        emoji: "📅",
        priority: daysUntil <= 0 ? InsightPriority.HIGH : InsightPriority.MEDIUM,
        value:
          daysUntil <= 0
            ? "Overdue"
            : daysUntil === 0
            ? "Today"
            : `${daysUntil} days`,
        actionable: true,
        actionLabel: "Book Now",
        actionUrl: `/add?customer=${customerId}`,
        metadata: {
          predictedDate: nextDue.predictedDate.toISOString(),
          confidence: nextDue.confidence,
        },
      });
    }
  }

  // Insight: Service recommendations
  if (recommendations.recommendations.length > 0) {
    const topRecommendation = recommendations.recommendations[0];
    if (topRecommendation.confidence >= 60) {
      insights.push({
        id: `service-recommendation-${customerId}`,
        category: InsightCategory.CUSTOMER_PERSONALIZATION,
        title: "Recommended Service",
        description: topRecommendation.reason,
        emoji: "✨",
        priority: InsightPriority.INFO,
        value: topRecommendation.serviceName,
        actionable: true,
        actionLabel: "Book Service",
        actionUrl: `/add?customer=${customerId}&service=${encodeURIComponent(topRecommendation.serviceName)}`,
        metadata: {
          serviceName: topRecommendation.serviceName,
          confidence: topRecommendation.confidence,
        },
      });
    }
  }

  return {
    insights,
    visitHistory: historyData.history,
    serviceRecommendations: recommendations.recommendations,
    nextServiceDue: nextDue,
  };
}

/**
 * Get all customer personalization insights (aggregated)
 */
export async function getAllCustomerPersonalizationInsights(): Promise<BaseInsight[]> {
  // This would typically be called per-customer, but we can provide aggregate insights
  const customerHistory = await InsightQueries.getCustomerHistory(undefined, 365);

  const insights: BaseInsight[] = [];

  // Find customers due for next visit
  const dueCustomers = customerHistory.filter((h) => {
    if (!h.averageDaysBetweenVisits || !h.lastVisitDate) return false;
    const predictedNext = new Date(h.lastVisitDate);
    predictedNext.setDate(
      predictedNext.getDate() + Math.round(h.averageDaysBetweenVisits)
    );
    const daysUntil = Math.ceil(
      (predictedNext.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil >= -7 && daysUntil <= 7;
  });

  if (dueCustomers.length > 0) {
    insights.push({
      id: "customers-due-for-visit",
      category: InsightCategory.CUSTOMER_PERSONALIZATION,
      title: "Customers Due for Visit",
      description: `${dueCustomers.length} customers are due for their next visit`,
      emoji: "📅",
      priority: InsightPriority.MEDIUM,
      value: `${dueCustomers.length} customers`,
      actionable: true,
      actionLabel: "View Customers",
      actionUrl: "/customers?filter=due-for-visit",
      metadata: { count: dueCustomers.length },
    });
  }

  return insights;
}

