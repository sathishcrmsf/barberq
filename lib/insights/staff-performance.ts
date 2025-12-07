// @cursor: Staff performance analytics - productivity, satisfaction proxy, rebooking analysis
// Rule-based metrics for MVP

import {
  BaseInsight,
  InsightCategory,
  InsightPriority,
  InsightQueries,
  StaffPerformance,
  calculatePriority,
} from "./base";
import { prisma } from "@/lib/prisma";

/**
 * Analyze staff productivity metrics
 */
export async function analyzeProductivity(): Promise<{
  insights: BaseInsight[];
  productivity: StaffPerformance[];
}> {
  const staffPerformance = await InsightQueries.getStaffPerformance(30);
  const insights: BaseInsight[] = [];

  if (staffPerformance.length === 0) {
    return { insights, productivity: [] };
  }

  // Find most productive (services completed)
  const mostProductive = staffPerformance
    .filter((s) => s.completedServices > 0)
    .sort((a, b) => b.completedServices - a.completedServices)[0];

  if (mostProductive) {
    insights.push({
      id: "most-productive-staff",
      category: InsightCategory.STAFF_PERFORMANCE,
      title: "Most Productive Staff",
      description: `${mostProductive.staffName} completed the most services`,
      emoji: "⚡",
      priority: InsightPriority.INFO,
      value: `${mostProductive.completedServices} services`,
      actionable: true,
      actionLabel: "View Staff",
      actionUrl: "/staff",
      metadata: { staffId: mostProductive.staffId },
    });
  }

  // Find fastest (lowest average duration)
  const fastestStaff = staffPerformance
    .filter((s) => s.averageServiceDuration > 0)
    .sort((a, b) => a.averageServiceDuration - b.averageServiceDuration)[0];

  if (fastestStaff && fastestStaff.completedServices >= 5) {
    insights.push({
      id: "fastest-staff",
      category: InsightCategory.STAFF_PERFORMANCE,
      title: "Fastest Service Time",
      description: `${fastestStaff.staffName} has the fastest average service time`,
      emoji: "⏱️",
      priority: InsightPriority.INFO,
      value: `${fastestStaff.averageServiceDuration} min avg`,
      actionable: false,
      metadata: { staffId: fastestStaff.staffId },
    });
  }

  // Calculate utilization rates
  const averageUtilization =
    staffPerformance.reduce((sum, s) => sum + s.utilizationRate, 0) /
    staffPerformance.length;

  const lowUtilization = staffPerformance.filter(
    (s) => s.utilizationRate < averageUtilization * 0.7 && s.completedServices >= 3
  );

  if (lowUtilization.length > 0) {
    insights.push({
      id: "low-utilization",
      category: InsightCategory.STAFF_PERFORMANCE,
      title: "Low Utilization",
      description: `${lowUtilization.length} staff members have low utilization rates`,
      emoji: "📊",
      priority: InsightPriority.MEDIUM,
      value: `${lowUtilization.length} staff`,
      actionable: true,
      actionLabel: "Review Staff",
      actionUrl: "/staff",
      metadata: { count: lowUtilization.length },
    });
  }

  return { insights, productivity: staffPerformance };
}

/**
 * Analyze customer satisfaction proxy metrics
 */
export async function analyzeCustomerSatisfaction(): Promise<{
  insights: BaseInsight[];
  satisfaction: Array<{
    staffId: string;
    staffName: string;
    rebookingRate: number;
    averageTicketSize: number;
    customerRetention: number;
    completionRate: number;
  }>;
}> {
  const staffPerformance = await InsightQueries.getStaffPerformance(90);
  const insights: BaseInsight[] = [];

  // Calculate satisfaction metrics
  const satisfaction = staffPerformance.map((s) => ({
    staffId: s.staffId,
    staffName: s.staffName,
    rebookingRate: s.rebookingRate,
    averageTicketSize: s.averageTicketSize,
    customerRetention: s.rebookingRate, // Using rebooking as proxy
    completionRate:
      s.totalServices > 0 ? (s.completedServices / s.totalServices) * 100 : 0,
  }));

  if (satisfaction.length === 0) {
    return { insights, satisfaction: [] };
  }

  // Find highest rebooking rate (customer loyalty)
  const topRebooking = satisfaction
    .filter((s) => s.rebookingRate > 0)
    .sort((a, b) => b.rebookingRate - a.rebookingRate)[0];

  if (topRebooking && topRebooking.rebookingRate >= 30) {
    insights.push({
      id: "highest-loyalty",
      category: InsightCategory.STAFF_PERFORMANCE,
      title: "Highest Customer Loyalty",
      description: `${topRebooking.staffName} has the highest rebooking rate`,
      emoji: "❤️",
      priority: InsightPriority.INFO,
      value: `${topRebooking.rebookingRate.toFixed(0)}% rebooking`,
      actionable: true,
      actionLabel: "View Staff",
      actionUrl: "/staff",
      metadata: { staffId: topRebooking.staffId },
    });
  }

  // Find highest average ticket (upselling ability)
  const topTicket = satisfaction
    .filter((s) => s.averageTicketSize > 0)
    .sort((a, b) => b.averageTicketSize - a.averageTicketSize)[0];

  if (topTicket && topTicket.averageTicketSize > 50) {
    insights.push({
      id: "highest-ticket",
      category: InsightCategory.STAFF_PERFORMANCE,
      title: "Highest Average Ticket",
      description: `${topTicket.staffName} generates the highest ticket sizes`,
      emoji: "💰",
      priority: InsightPriority.INFO,
      value: `₹${topTicket.averageTicketSize.toFixed(0)} avg`,
      actionable: false,
      metadata: { staffId: topTicket.staffId },
    });
  }

  // Flag low completion rates
  const lowCompletion = satisfaction.filter(
    (s) => s.completionRate < 80 && s.completionRate > 0
  );

  if (lowCompletion.length > 0) {
    insights.push({
      id: "low-completion",
      category: InsightCategory.STAFF_PERFORMANCE,
      title: "Low Completion Rate",
      description: `${lowCompletion.length} staff have completion rates below 80%`,
      emoji: "⚠️",
      priority: InsightPriority.HIGH,
      value: `${lowCompletion.length} staff`,
      actionable: true,
      actionLabel: "Review Staff",
      actionUrl: "/staff",
      metadata: { count: lowCompletion.length },
    });
  }

  return { insights, satisfaction };
}

/**
 * Analyze rebooking patterns
 */
export async function analyzeRebooking(): Promise<{
  insights: BaseInsight[];
  rebooking: Array<{
    staffId: string;
    staffName: string;
    rebookingRate: number;
    repeatCustomers: number;
    totalCustomers: number;
  }>;
}> {
  const staffPerformance = await InsightQueries.getStaffPerformance(90);
  const insights: BaseInsight[] = [];

  const rebooking = staffPerformance.map((s) => ({
    staffId: s.staffId,
    staffName: s.staffName,
    rebookingRate: s.rebookingRate,
    repeatCustomers: Math.round((s.uniqueCustomers * s.rebookingRate) / 100),
    totalCustomers: s.uniqueCustomers,
  }));

  if (rebooking.length === 0) {
    return { insights, rebooking: [] };
  }

  // Find staff with highest rebooking
  const topRebooking = rebooking
    .filter((r) => r.totalCustomers >= 5)
    .sort((a, b) => b.rebookingRate - a.rebookingRate)[0];

  if (topRebooking) {
    insights.push({
      id: "top-rebooking",
      category: InsightCategory.STAFF_PERFORMANCE,
      title: "Top Rebooking Rate",
      description: `${topRebooking.staffName} has ${topRebooking.repeatCustomers} repeat customers`,
      emoji: "🔄",
      priority: InsightPriority.INFO,
      value: `${topRebooking.rebookingRate.toFixed(0)}%`,
      actionable: true,
      actionLabel: "View Staff",
      actionUrl: "/staff",
      metadata: { staffId: topRebooking.staffId },
    });
  }

  // Find staff with low rebooking (training opportunity)
  const averageRebooking =
    rebooking.reduce((sum, r) => sum + r.rebookingRate, 0) / rebooking.length;

  const lowRebooking = rebooking.filter(
    (r) =>
      r.rebookingRate < averageRebooking * 0.7 &&
      r.totalCustomers >= 5
  );

  if (lowRebooking.length > 0) {
    insights.push({
      id: "low-rebooking",
      category: InsightCategory.STAFF_PERFORMANCE,
      title: "Low Rebooking Rate",
      description: `${lowRebooking.length} staff have below-average rebooking rates`,
      emoji: "📉",
      priority: InsightPriority.MEDIUM,
      value: `${lowRebooking.length} staff`,
      actionable: true,
      actionLabel: "Review Staff",
      actionUrl: "/staff",
      metadata: { count: lowRebooking.length },
    });
  }

  return { insights, rebooking };
}

/**
 * Get all staff performance insights
 */
export async function getStaffPerformanceInsights(): Promise<BaseInsight[]> {
  const [productivityData, satisfactionData, rebookingData] = await Promise.all([
    analyzeProductivity(),
    analyzeCustomerSatisfaction(),
    analyzeRebooking(),
  ]);

  return [
    ...productivityData.insights,
    ...satisfactionData.insights,
    ...rebookingData.insights,
  ].sort((a, b) => a.priority - b.priority);
}

