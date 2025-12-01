// @cursor: StatCard component for displaying KPI metrics on dashboard
// Mobile-first, Uber-style minimalist design with optional trend indicators

import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: number;
    label: string;
  };
  variant?: "default" | "highlighted";
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-4 shadow-sm transition-shadow hover:shadow-md",
        variant === "highlighted" && "border-blue-500 border-2",
        className
      )}
      aria-label={`${label}: ${value}${trend ? `, ${trend.direction} ${trend.value}% ${trend.label}` : ""}`}
    >
      {/* Icon and Trend Row */}
      <div className="flex items-start justify-between mb-2">
        {Icon && (
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
        )}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.direction === "up" && "bg-emerald-50 text-emerald-700",
              trend.direction === "down" && "bg-red-50 text-red-700",
              trend.direction === "neutral" && "bg-gray-50 text-gray-700"
            )}
          >
            {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
            {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-black mb-1">{value}</div>

      {/* Label */}
      <div className="text-xs text-gray-600 font-medium">{label}</div>

      {/* Trend Label */}
      {trend && (
        <div className="text-xs text-gray-500 mt-1">{trend.label}</div>
      )}
    </article>
  );
}

