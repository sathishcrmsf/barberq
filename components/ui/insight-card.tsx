// @cursor: Insight card component for displaying AI-driven recommendations
// Supports multiple types: alert, info, success, trending

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface InsightCardProps {
  type: "alert" | "info" | "success" | "trending";
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

const typeStyles = {
  alert: {
    bg: "bg-orange-50",
    border: "border-orange-500",
    text: "text-orange-900",
    emoji: "🔥",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-500",
    text: "text-blue-900",
    emoji: "💡",
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-500",
    text: "text-emerald-900",
    emoji: "⭐",
  },
  trending: {
    bg: "bg-purple-50",
    border: "border-purple-500",
    text: "text-purple-900",
    emoji: "📈",
  },
};

export function InsightCard({
  type,
  title,
  description,
  action,
  className,
}: InsightCardProps) {
  const styles = typeStyles[type];

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 p-4",
        styles.bg,
        styles.border,
        className
      )}
      role="article"
      aria-label={`${type} insight: ${title}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-xl flex-shrink-0" role="img" aria-hidden="true">
          {styles.emoji}
        </span>
        <div className="flex-1">
          <h3 className={cn("font-semibold text-sm mb-1", styles.text)}>
            {title}
          </h3>
          <p className={cn("text-sm", styles.text, "opacity-80")}>
            {description}
          </p>
        </div>
      </div>

      {/* Action */}
      {action && (
        <Link
          href={action.href}
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium mt-2 hover:underline",
            styles.text
          )}
        >
          {action.label}
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

