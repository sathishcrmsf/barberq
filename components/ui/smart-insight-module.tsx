// @cursor: Smart insight module - AI assistant style recommendations
// Premium card with multiple insights in compact format

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
        "bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Sparkles className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">Smart Insights</h3>
      </div>

      {/* Insights Grid */}
      <div className="space-y-2.5">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3.5"
          >
            <span className="text-xl flex-shrink-0 leading-none">{insight.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600 font-medium mb-1">
                {insight.title}
              </div>
              <div className="text-base font-bold text-gray-900 break-words">
                {insight.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

