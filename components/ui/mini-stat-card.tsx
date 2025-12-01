// @cursor: Mini stat card component for compact KPI display
// Ultra-minimal design for 3-column grid layout with color-coded variants

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MiniStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "success" | "info" | "warning" | "default";
  className?: string;
}

const variantStyles = {
  success: {
    bg: "bg-gradient-to-br from-green-50 to-emerald-50",
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
    valueColor: "text-green-900",
  },
  info: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    valueColor: "text-blue-900",
  },
  warning: {
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
    border: "border-orange-200",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-700",
    valueColor: "text-orange-900",
  },
  default: {
    bg: "bg-white",
    border: "border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-700",
    valueColor: "text-black",
  },
};

export function MiniStatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  className,
}: MiniStatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm transition-all",
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("p-1.5 rounded-lg", styles.iconBg)}>
          <Icon className={cn("w-4 h-4", styles.iconColor)} />
        </div>
      </div>
      <div className={cn("text-2xl font-bold mb-1", styles.valueColor)}>
        {value}
      </div>
      <div className="text-xs text-gray-600 font-medium">{label}</div>
    </div>
  );
}

