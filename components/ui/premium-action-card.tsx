// @cursor: Premium action card component for main CTAs
// Gradient-based, elevated design similar to Uber/DoorDash

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";

interface PremiumActionCardProps {
  title: string;
  icon: LucideIcon;
  href: string;
  gradient?: string;
  badge?: string;
  queueCount?: number;
  className?: string;
}

export function PremiumActionCard({
  title,
  icon: Icon,
  href,
  gradient = "from-gray-900 to-gray-700",
  badge,
  queueCount,
  className,
}: PremiumActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative group block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]",
        className
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "bg-gradient-to-br p-5 min-h-[110px] flex items-center",
          gradient
        )}
      >
        {/* Content */}
        <div className="flex items-center justify-between flex-1 gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white leading-tight whitespace-nowrap">
              {title}
              {queueCount !== undefined && (
                <span className="ml-1.5 opacity-90">({queueCount})</span>
              )}
            </h3>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
    </Link>
  );
}

