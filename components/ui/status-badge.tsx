// @cursor: This component must be mobile-first,
// Uber-style minimalistic, with thumb-friendly controls.
// Avoid complex layout. Prioritize clarity and speed.

import { cn } from "@/lib/utils";

type Status = "waiting" | "in-progress" | "done";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    waiting: "bg-gray-100 text-gray-700",
    "in-progress": "bg-blue-50 text-[#007AFF]",
    done: "bg-green-50 text-[#34C759]",
  };

  const labels = {
    waiting: "Waiting",
    "in-progress": "In Progress",
    done: "Done",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shrink-0",
        variants[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}


