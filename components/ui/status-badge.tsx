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
    waiting: "bg-gray-100 text-gray-800 border-gray-300",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
    done: "bg-green-100 text-green-800 border-green-300",
  };

  const labels = {
    waiting: "Waiting",
    "in-progress": "In Progress",
    done: "Done",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}


