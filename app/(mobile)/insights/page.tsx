// @cursor: Comprehensive insights dashboard page
// Mobile-first, tabbed interface for each insight category
// Actionable insight cards with recommendations

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Brain,
  TrendingUp,
  Users,
  Lightbulb,
  Repeat,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import { InsightCategory } from "@/lib/insights/base";

interface Insight {
  id: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
  priority: number;
  value: string | number;
  actionable?: boolean;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface InsightsData {
  [key: string]: Insight[];
}

const categoryConfig = {
  [InsightCategory.CUSTOMER_BEHAVIOR]: {
    label: "Customer Behavior",
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  [InsightCategory.REVENUE_OPTIMIZATION]: {
    label: "Revenue",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  [InsightCategory.STAFF_PERFORMANCE]: {
    label: "Staff",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  [InsightCategory.RECOMMENDATIONS]: {
    label: "Recommendations",
    icon: Lightbulb,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  [InsightCategory.REPEAT_VISITS]: {
    label: "Repeat Visits",
    icon: Repeat,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  [InsightCategory.SLOT_OPTIMIZATION]: {
    label: "Slots",
    icon: Clock,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  [InsightCategory.CUSTOMER_PERSONALIZATION]: {
    label: "Personalization",
    icon: User,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
};

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Critical", color: "text-red-600 bg-red-50" },
  2: { label: "High", color: "text-orange-600 bg-orange-50" },
  3: { label: "Medium", color: "text-yellow-600 bg-yellow-50" },
  4: { label: "Low", color: "text-blue-600 bg-blue-50" },
  5: { label: "Info", color: "text-gray-600 bg-gray-50" },
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    setLoading(true);
    try {
      const res = await fetch("/api/insights");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API Error:", res.status, errorData);
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch insights`);
      }
      const insightsData = await res.json();
      console.log("Insights data received:", {
        total: insightsData.total,
        categories: Object.keys(insightsData.insights || {}),
        counts: insightsData.totals,
      });
      
      // Ensure we have the insights object
      if (!insightsData.insights) {
        console.warn("No insights object in response:", insightsData);
        setData({});
        return;
      }
      
      setData(insightsData.insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load insights";
      toast.error(errorMessage);
      // Set empty data structure to prevent crashes
      setData({});
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold">Smart Insights</h1>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Flatten all insights for "all" tab
  const allInsights: Insight[] = Object.values(data).flat();
  allInsights.sort((a, b) => a.priority - b.priority);

  const getInsightsForTab = (tab: string): Insight[] => {
    if (tab === "all") return allInsights;
    return data[tab] || [];
  };

  const currentInsights = getInsightsForTab(activeTab);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold">Smart Insights</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value={InsightCategory.CUSTOMER_BEHAVIOR} className="text-xs">
              Behavior
            </TabsTrigger>
            <TabsTrigger value={InsightCategory.REVENUE_OPTIMIZATION} className="text-xs">
              Revenue
            </TabsTrigger>
            <TabsTrigger value={InsightCategory.RECOMMENDATIONS} className="text-xs">
              AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {currentInsights.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                <p>No insights available for this category yet.</p>
                <p className="text-sm mt-2">Complete more services to see insights.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {currentInsights.map((insight) => {
                  const priorityInfo = priorityLabels[insight.priority] || priorityLabels[5];
                  const categoryInfo =
                    categoryConfig[insight.category as InsightCategory] ||
                    categoryConfig[InsightCategory.RECOMMENDATIONS];

                  return (
                    <Card key={insight.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${categoryInfo.bgColor} flex-shrink-0`}
                        >
                          <span className="text-2xl">{insight.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-gray-900">
                              {insight.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${priorityInfo.color}`}
                            >
                              {priorityInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-gray-900">
                              {typeof insight.value === "number"
                                ? `$${insight.value.toFixed(0)}`
                                : insight.value}
                            </div>
                            {insight.actionable && insight.actionUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (insight.actionUrl?.startsWith("/")) {
                                    window.location.href = insight.actionUrl;
                                  } else {
                                    toast.info("Action: " + insight.actionLabel);
                                  }
                                }}
                                className="text-xs"
                              >
                                {insight.actionLabel || "View"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Category Tabs (Full List) */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">All Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(categoryConfig).map(([category, config]) => {
              const Icon = config.icon;
              const insights = data[category] || [];
              return (
                <Card
                  key={category}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveTab(category)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">
                        {config.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {insights.length} insight{insights.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

