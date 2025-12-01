// @cursor: Action button components for dashboard quick actions
// Primary and secondary variants with icon support

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";

interface ActionButtonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export function ActionButton({
  title,
  description,
  icon: Icon,
  href,
  badge,
  variant = "primary",
  className,
}: ActionButtonProps) {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          "rounded-2xl p-5 min-h-[100px] flex items-center gap-4 transition-all active:scale-[0.98] relative overflow-hidden",
          variant === "primary" &&
            "bg-black text-white hover:bg-gray-900 shadow-lg",
          variant === "secondary" &&
            "bg-white text-black border-2 border-gray-200 hover:border-gray-300 hover:shadow-md",
          className
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "p-3 rounded-xl flex-shrink-0",
            variant === "primary" && "bg-white/10",
            variant === "secondary" && "bg-gray-100"
          )}
        >
          <Icon
            className={cn(
              "w-6 h-6",
              variant === "primary" && "text-white",
              variant === "secondary" && "text-black"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {badge && (
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  variant === "primary" && "bg-white/20 text-white",
                  variant === "secondary" && "bg-gray-900 text-white"
                )}
              >
                {badge}
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-sm",
              variant === "primary" && "text-gray-300",
              variant === "secondary" && "text-gray-600"
            )}
          >
            {description}
          </p>
        </div>

        {/* Chevron */}
        <ChevronRight
          className={cn(
            "w-5 h-5 flex-shrink-0",
            variant === "primary" && "text-white/60",
            variant === "secondary" && "text-gray-400"
          )}
        />
      </div>
    </Link>
  );
}

