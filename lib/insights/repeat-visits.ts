// @cursor: Repeat visit boosting - inactive customer identification, basic service customers, win-back campaigns
// Rule-based algorithms for MVP

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
 * Identify inactive customers by days since last visit
 */
export async function identifyInactiveCustomers(): Promise<{
  insights: BaseInsight[];
  inactive: {
    thirtyDays: CustomerHistory[];
    sixtyDays: CustomerHistory[];
    ninetyDays: CustomerHistory[];
  };
}> {
  const customerHistory = await InsightQueries.getCustomerHistory(undefined, 365);

  const thirtyDays: CustomerHistory[] = [];
  const sixtyDays: CustomerHistory[] = [];
  const ninetyDays: CustomerHistory[] = [];

  for (const history of customerHistory) {
    if (!history.daysSinceLastVisit) continue;

    if (history.daysSinceLastVisit >= 90) {
      ninetyDays.push(history);
    } else if (history.daysSinceLastVisit >= 60) {
      sixtyDays.push(history);
    } else if (history.daysSinceLastVisit >= 30) {
      thirtyDays.push(history);
    }
  }

  // Sort by days since last visit (most inactive first)
  thirtyDays.sort((a, b) => (b.daysSinceLastVisit || 0) - (a.daysSinceLastVisit || 0));
  sixtyDays.sort((a, b) => (b.daysSinceLastVisit || 0) - (a.daysSinceLastVisit || 0));
  ninetyDays.sort((a, b) => (b.daysSinceLastVisit || 0) - (a.daysSinceLastVisit || 0));

  const insights: BaseInsight[] = [];

  if (ninetyDays.length > 0) {
    insights.push({
      id: "inactive-90-days",
      category: InsightCategory.REPEAT_VISITS,
      title: "90+ Days Inactive",
      description: `${ninetyDays.length} customers haven't visited in 90+ days`,
      emoji: "🚨",
      priority: InsightPriority.HIGH,
      value: `${ninetyDays.length} customers`,
      actionable: true,
      actionLabel: "Win-Back Campaign",
      actionUrl: "/customers?filter=inactive-90",
      metadata: { count: ninetyDays.length, segment: "90-days" },
    });
  }

  if (sixtyDays.length > 0) {
    insights.push({
      id: "inactive-60-days",
      category: InsightCategory.REPEAT_VISITS,
      title: "60+ Days Inactive",
      description: `${sixtyDays.length} customers haven't visited in 60+ days`,
      emoji: "⚠️",
      priority: InsightPriority.MEDIUM,
      value: `${sixtyDays.length} customers`,
      actionable: true,
      actionLabel: "Re-engage",
      actionUrl: "/customers?filter=inactive-60",
      metadata: { count: sixtyDays.length, segment: "60-days" },
    });
  }

  if (thirtyDays.length > 0) {
    insights.push({
      id: "inactive-30-days",
      category: InsightCategory.REPEAT_VISITS,
      title: "30+ Days Inactive",
      description: `${thirtyDays.length} customers haven't visited in 30+ days`,
      emoji: "📉",
      priority: InsightPriority.LOW,
      value: `${thirtyDays.length} customers`,
      actionable: true,
      actionLabel: "View Customers",
      actionUrl: "/customers?filter=inactive-30",
      metadata: { count: thirtyDays.length, segment: "30-days" },
    });
  }

  return {
    insights,
    inactive: {
      thirtyDays,
      sixtyDays,
      ninetyDays,
    },
  };
}

/**
 * Identify customers who only book basic services
 */
export async function identifyBasicServiceOnlyCustomers(): Promise<{
  insights: BaseInsight[];
  customers: Array<{
    customerId: string;
    customerName: string;
    phone: string;
    currentServices: string[];
    potentialUpsellValue: number;
    suggestedServices: string[];
  }>;
}> {
  const customerHistory = await InsightQueries.getCustomerHistory(undefined, 365);
  const services = await prisma.service.findMany({ where: { isActive: true } });

  // Calculate average price to determine basic vs premium
  const averagePrice = services.reduce((sum, s) => sum + s.price, 0) / services.length;
  const basicServices = services
    .filter((s) => s.price <= averagePrice)
    .map((s) => s.name);
  const premiumServices = services
    .filter((s) => s.price > averagePrice)
    .map((s) => s.name);

  const customers: Array<{
    customerId: string;
    customerName: string;
    phone: string;
    currentServices: string[];
    potentialUpsellValue: number;
    suggestedServices: string[];
  }> = [];

  for (const history of customerHistory) {
    // Check if customer only books basic services
    const hasOnlyBasic = history.servicesBooked.every((s) =>
      basicServices.includes(s)
    );

    if (!hasOnlyBasic || history.servicesBooked.length === 0) continue;

    // Find premium services they haven't tried
    const untriedPremium = premiumServices.filter(
      (s) => !history.servicesBooked.includes(s)
    );

    if (untriedPremium.length === 0) continue;

    // Calculate potential upsell value
    const suggestedServices = untriedPremium.slice(0, 3);
    const potentialUpsellValue = suggestedServices.reduce((sum, serviceName) => {
      const service = services.find((s) => s.name === serviceName);
      return sum + (service?.price || 0);
    }, 0);

    // Only include if they're frequent customers (more likely to upsell)
    if (history.totalVisits >= 3) {
      customers.push({
        customerId: history.customerId,
        customerName: history.customerName,
        phone: history.phone,
        currentServices: history.servicesBooked,
        potentialUpsellValue: Math.round(potentialUpsellValue),
        suggestedServices,
      });
    }
  }

  // Sort by potential value
  customers.sort((a, b) => b.potentialUpsellValue - a.potentialUpsellValue);

  const insights: BaseInsight[] = [];

  if (customers.length > 0) {
    const totalPotential = customers.reduce(
      (sum, c) => sum + c.potentialUpsellValue,
      0
    );
    insights.push({
      id: "basic-service-upsell",
      category: InsightCategory.REPEAT_VISITS,
      title: "Upsell Opportunity",
      description: `${customers.length} customers only book basic services`,
      emoji: "💰",
      priority: InsightPriority.MEDIUM,
      value: `$${totalPotential} potential`,
      actionable: true,
      actionLabel: "View Customers",
      actionUrl: "/customers?filter=basic-only",
      metadata: { count: customers.length, potentialValue: totalPotential },
    });
  }

  return { insights, customers };
}

/**
 * Generate win-back campaign triggers
 */
export async function generateWinBackCampaigns(): Promise<{
  insights: BaseInsight[];
  campaigns: Array<{
    segment: string;
    customerCount: number;
    message: string;
    offer: string;
    discount: number;
    priority: InsightPriority;
  }>;
}> {
  const inactiveData = await identifyInactiveCustomers();
  const campaigns: Array<{
    segment: string;
    customerCount: number;
    message: string;
    offer: string;
    discount: number;
    priority: InsightPriority;
  }> = [];

  // Campaign for 90+ days inactive
  if (inactiveData.inactive.ninetyDays.length > 0) {
    campaigns.push({
      segment: "90+ Days Inactive",
      customerCount: inactiveData.inactive.ninetyDays.length,
      message: "We miss you! Come back and get 20% off your next visit.",
      offer: "Welcome Back - 20% Off",
      discount: 20,
      priority: InsightPriority.HIGH,
    });
  }

  // Campaign for 60+ days inactive
  if (inactiveData.inactive.sixtyDays.length > 0) {
    campaigns.push({
      segment: "60+ Days Inactive",
      customerCount: inactiveData.inactive.sixtyDays.length,
      message: "It's been a while! Enjoy 15% off your next service.",
      offer: "Come Back - 15% Off",
      discount: 15,
      priority: InsightPriority.MEDIUM,
    });
  }

  // Campaign for 30+ days inactive (lighter touch)
  if (inactiveData.inactive.thirtyDays.length > 0) {
    campaigns.push({
      segment: "30+ Days Inactive",
      customerCount: inactiveData.inactive.thirtyDays.length,
      message: "We'd love to see you again! 10% off your next visit.",
      offer: "Returning Customer - 10% Off",
      discount: 10,
      priority: InsightPriority.LOW,
    });
  }

  const insights: BaseInsight[] = [];

  if (campaigns.length > 0) {
    const highPriorityCampaigns = campaigns.filter(
      (c) => c.priority === InsightPriority.HIGH
    );

    if (highPriorityCampaigns.length > 0) {
      const topCampaign = highPriorityCampaigns[0];
      insights.push({
        id: "win-back-campaign",
        category: InsightCategory.REPEAT_VISITS,
        title: "Win-Back Campaign Ready",
        description: `${topCampaign.customerCount} customers in ${topCampaign.segment} segment`,
        emoji: "📢",
        priority: InsightPriority.HIGH,
        value: `${topCampaign.offer}`,
        actionable: true,
        actionLabel: "Launch Campaign",
        actionUrl: "/customers?filter=win-back",
        metadata: {
          segment: topCampaign.segment,
          customerCount: topCampaign.customerCount,
          offer: topCampaign.offer,
        },
      });
    }
  }

  return { insights, campaigns };
}

/**
 * Get all repeat visit insights
 */
export async function getRepeatVisitInsights(): Promise<BaseInsight[]> {
  const [inactiveData, basicServiceData, campaignData] = await Promise.all([
    identifyInactiveCustomers(),
    identifyBasicServiceOnlyCustomers(),
    generateWinBackCampaigns(),
  ]);

  return [
    ...inactiveData.insights,
    ...basicServiceData.insights,
    ...campaignData.insights,
  ].sort((a, b) => a.priority - b.priority);
}

