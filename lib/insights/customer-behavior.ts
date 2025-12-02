// @cursor: Customer behavior predictions - churn risk, no-show prediction, upsell opportunities
// Rule-based algorithms for MVP, ML-ready architecture for future

import {
  BaseInsight,
  InsightCategory,
  InsightPriority,
  InsightQueries,
  CustomerHistory,
  calculatePriority,
} from "./base";
import { prisma } from "@/lib/prisma";

export interface ChurnRiskCustomer {
  customerId: string;
  customerName: string;
  phone: string;
  daysSinceLastVisit: number;
  riskLevel: "low" | "medium" | "high";
  riskScore: number; // 0-100
  lastVisitDate: Date | null;
  totalVisits: number;
  totalSpent: number;
}

export interface UpsellOpportunity {
  customerId: string;
  customerName: string;
  phone: string;
  currentServices: string[];
  suggestedServices: string[];
  potentialRevenue: number;
  confidence: number; // 0-100
}

/**
 * Detect customers at risk of churning
 */
export async function detectChurnRisk(): Promise<{
  insights: BaseInsight[];
  atRiskCustomers: ChurnRiskCustomer[];
}> {
  const customerHistory = await InsightQueries.getCustomerHistory(undefined, 365);
  const atRiskCustomers: ChurnRiskCustomer[] = [];

  for (const history of customerHistory) {
    if (!history.daysSinceLastVisit) continue;

    let riskLevel: "low" | "medium" | "high" = "low";
    let riskScore = 0;

    // Rule-based churn risk calculation
    if (history.daysSinceLastVisit >= 90) {
      riskLevel = "high";
      riskScore = Math.min(100, 70 + (history.daysSinceLastVisit - 90) / 2);
    } else if (history.daysSinceLastVisit >= 60) {
      riskLevel = "medium";
      riskScore = 40 + ((history.daysSinceLastVisit - 60) / 30) * 30;
    } else if (history.daysSinceLastVisit >= 30) {
      riskLevel = "low";
      riskScore = 20 + ((history.daysSinceLastVisit - 30) / 30) * 20;
    }

    // Adjust risk based on visit frequency
    if (history.averageDaysBetweenVisits) {
      const expectedDaysSince = history.averageDaysBetweenVisits * 1.5;
      if (history.daysSinceLastVisit > expectedDaysSince) {
        riskScore += 10;
        if (riskLevel === "low") riskLevel = "medium";
      }
    }

    // High-value customers get higher risk score
    if (history.totalSpent > 500) {
      riskScore += 5;
    }

    if (riskScore > 0) {
      atRiskCustomers.push({
        customerId: history.customerId,
        customerName: history.customerName,
        phone: history.phone,
        daysSinceLastVisit: history.daysSinceLastVisit,
        riskLevel,
        riskScore: Math.min(100, Math.round(riskScore)),
        lastVisitDate: history.lastVisitDate,
        totalVisits: history.totalVisits,
        totalSpent: history.totalSpent,
      });
    }
  }

  // Sort by risk score
  atRiskCustomers.sort((a, b) => b.riskScore - a.riskScore);

  // Generate insights
  const insights: BaseInsight[] = [];

  const highRiskCount = atRiskCustomers.filter((c) => c.riskLevel === "high").length;
  const mediumRiskCount = atRiskCustomers.filter((c) => c.riskLevel === "medium").length;

  if (highRiskCount > 0) {
    insights.push({
      id: "churn-high-risk",
      category: InsightCategory.CUSTOMER_BEHAVIOR,
      title: "High Churn Risk Customers",
      description: `${highRiskCount} customers haven't visited in 90+ days`,
      emoji: "⚠️",
      priority: InsightPriority.HIGH,
      value: `${highRiskCount} customers`,
      actionable: true,
      actionLabel: "View Customers",
      actionUrl: "/customers?filter=churn-risk",
      metadata: { riskLevel: "high", count: highRiskCount },
    });
  }

  if (mediumRiskCount > 0) {
    insights.push({
      id: "churn-medium-risk",
      category: InsightCategory.CUSTOMER_BEHAVIOR,
      title: "Medium Churn Risk",
      description: `${mediumRiskCount} customers haven't visited in 60-90 days`,
      emoji: "📉",
      priority: InsightPriority.MEDIUM,
      value: `${mediumRiskCount} customers`,
      actionable: true,
      actionLabel: "View Customers",
      actionUrl: "/customers?filter=churn-risk",
      metadata: { riskLevel: "medium", count: mediumRiskCount },
    });
  }

  return { insights, atRiskCustomers };
}

/**
 * Predict no-show probability for customers
 */
export async function predictNoShows(): Promise<{
  insights: BaseInsight[];
  noShowRisks: Array<{
    customerId: string;
    customerName: string;
    phone: string;
    noShowProbability: number; // 0-100
    riskFactors: string[];
  }>;
}> {
  const customerHistory = await InsightQueries.getCustomerHistory(undefined, 365);
  const noShowRisks: Array<{
    customerId: string;
    customerName: string;
    phone: string;
    noShowProbability: number;
    riskFactors: string[];
  }> = [];

  // Get all walk-ins to analyze patterns
  const walkIns = await prisma.walkIn.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      },
    },
    include: { customer: true },
  });

  for (const history of customerHistory) {
    const customerWalkIns = walkIns.filter(
      (w) => w.customerId === history.customerId
    );

    if (customerWalkIns.length === 0) continue;

    let noShowProbability = 0;
    const riskFactors: string[] = [];

    // Factor 1: Incomplete visits (started but not completed)
    const incompleteVisits = customerWalkIns.filter(
      (w) => w.status !== "done" && w.status !== "waiting"
    ).length;
    if (incompleteVisits > 0) {
      const incompleteRate = incompleteVisits / customerWalkIns.length;
      noShowProbability += incompleteRate * 40;
      riskFactors.push(`${incompleteVisits} incomplete visit(s)`);
    }

    // Factor 2: Low visit frequency
    if (history.averageDaysBetweenVisits && history.averageDaysBetweenVisits > 60) {
      noShowProbability += 20;
      riskFactors.push("Low visit frequency");
    }

    // Factor 3: First-time or very new customers
    if (history.totalVisits <= 2) {
      noShowProbability += 15;
      riskFactors.push("New customer");
    }

    // Factor 4: Long time since last visit
    if (history.daysSinceLastVisit && history.daysSinceLastVisit > 30) {
      noShowProbability += 10;
      riskFactors.push(`${history.daysSinceLastVisit} days since last visit`);
    }

    // Factor 5: Only basic services (might not be committed)
    const basicServiceCount = history.servicesBooked.filter((s) =>
      ["Haircut", "Beard Trim"].includes(s)
    ).length;
    if (basicServiceCount === history.servicesBooked.length && history.servicesBooked.length > 0) {
      noShowProbability += 5;
      riskFactors.push("Only basic services");
    }

    if (noShowProbability > 0) {
      noShowRisks.push({
        customerId: history.customerId,
        customerName: history.customerName,
        phone: history.phone,
        noShowProbability: Math.min(100, Math.round(noShowProbability)),
        riskFactors,
      });
    }
  }

  // Sort by probability
  noShowRisks.sort((a, b) => b.noShowProbability - a.noShowProbability);

  // Generate insights
  const insights: BaseInsight[] = [];
  const highRiskCount = noShowRisks.filter((r) => r.noShowProbability >= 50).length;

  if (highRiskCount > 0) {
    insights.push({
      id: "no-show-high-risk",
      category: InsightCategory.CUSTOMER_BEHAVIOR,
      title: "High No-Show Risk",
      description: `${highRiskCount} customers have high no-show probability`,
      emoji: "🚫",
      priority: InsightPriority.MEDIUM,
      value: `${highRiskCount} customers`,
      actionable: true,
      actionLabel: "Review Customers",
      actionUrl: "/customers?filter=no-show-risk",
      metadata: { highRiskCount },
    });
  }

  return { insights, noShowRisks };
}

/**
 * Detect upsell opportunities
 */
export async function detectUpsellOpportunities(): Promise<{
  insights: BaseInsight[];
  opportunities: UpsellOpportunity[];
}> {
  const customerHistory = await InsightQueries.getCustomerHistory(undefined, 365);
  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    include: { category: true },
  });

  // Define basic vs premium services (services below average price are basic)
  const averagePrice =
    allServices.reduce((sum, s) => sum + s.price, 0) / allServices.length;
  const basicServices = allServices
    .filter((s) => s.price <= averagePrice)
    .map((s) => s.name);
  const premiumServices = allServices
    .filter((s) => s.price > averagePrice)
    .map((s) => s.name);

  const opportunities: UpsellOpportunity[] = [];

  for (const history of customerHistory) {
    // Only customers who book basic services
    const hasOnlyBasicServices = history.servicesBooked.every((s) =>
      basicServices.includes(s)
    );

    if (!hasOnlyBasicServices || history.servicesBooked.length === 0) continue;

    // Find services they haven't tried
    const untriedServices = premiumServices.filter(
      (s) => !history.servicesBooked.includes(s)
    );

    if (untriedServices.length === 0) continue;

    // Calculate potential revenue
    const suggestedServices = untriedServices.slice(0, 3); // Top 3 suggestions
    const potentialRevenue = suggestedServices.reduce((sum, serviceName) => {
      const service = allServices.find((s) => s.name === serviceName);
      return sum + (service?.price || 0);
    }, 0);

    // Calculate confidence based on customer value and visit frequency
    let confidence = 30; // Base confidence
    if (history.totalSpent > 200) confidence += 20;
    if (history.totalVisits >= 5) confidence += 20;
    if (history.averageDaysBetweenVisits && history.averageDaysBetweenVisits < 30) {
      confidence += 20;
    }
    if (history.totalSpent > 500) confidence += 10;

    if (confidence >= 40) {
      opportunities.push({
        customerId: history.customerId,
        customerName: history.customerName,
        phone: history.phone,
        currentServices: history.servicesBooked,
        suggestedServices,
        potentialRevenue: Math.round(potentialRevenue),
        confidence: Math.min(100, confidence),
      });
    }
  }

  // Sort by potential revenue
  opportunities.sort((a, b) => b.potentialRevenue - a.potentialRevenue);

  // Generate insights
  const insights: BaseInsight[] = [];
  const highConfidenceCount = opportunities.filter((o) => o.confidence >= 60).length;
  const totalPotentialRevenue = opportunities.reduce(
    (sum, o) => sum + o.potentialRevenue,
    0
  );

  if (highConfidenceCount > 0) {
    insights.push({
      id: "upsell-opportunities",
      category: InsightCategory.CUSTOMER_BEHAVIOR,
      title: "Upsell Opportunities",
      description: `${highConfidenceCount} customers ready for premium services`,
      emoji: "💰",
      priority: InsightPriority.MEDIUM,
      value: `$${totalPotentialRevenue} potential`,
      actionable: true,
      actionLabel: "View Opportunities",
      actionUrl: "/customers?filter=upsell",
      metadata: { count: highConfidenceCount, potentialRevenue: totalPotentialRevenue },
    });
  }

  return { insights, opportunities };
}

/**
 * Get all customer behavior insights
 */
export async function getCustomerBehaviorInsights(): Promise<BaseInsight[]> {
  const [churnData, noShowData, upsellData] = await Promise.all([
    detectChurnRisk(),
    predictNoShows(),
    detectUpsellOpportunities(),
  ]);

  return [
    ...churnData.insights,
    ...noShowData.insights,
    ...upsellData.insights,
  ].sort((a, b) => a.priority - b.priority);
}

