// @cursor: Smart insight module - AI assistant style recommendations
// Clean, minimal design following Uber-style principles

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface Insight {
  emoji: string;
  title: string;
  value: string;
}

interface SmartInsightModuleProps {
  insights: Insight[];
  className?: string;
}

export function SmartInsightModule({
  insights,
  className,
}: SmartInsightModuleProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-200 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-bold text-gray-900">Smart Insights</h3>
        </div>
      </div>

      {/* Insights List */}
      <div className="divide-y divide-gray-100">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg flex-shrink-0 leading-none mt-0.5">
              {insight.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium mb-1">
                {insight.title}
              </div>
              <div className="text-sm font-bold text-gray-900">
                {insight.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

