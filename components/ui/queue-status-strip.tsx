// @cursor: Queue status strip component for real-time queue visibility
// Shows now serving, next up, and estimated wait time

"use client";

import { useRouter } from "next/navigation";
import { Clock, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueStatusStripProps {
  nowServing?: {
    customerName: string;
    service: string;
  };
  nextUp?: {
    customerName: string;
    service: string;
  };
  estimatedWait: number; // in minutes
  queueCount: number;
  className?: string;
}

export function QueueStatusStrip({
  nowServing,
  nextUp,
  estimatedWait,
  queueCount,
  className,
}: QueueStatusStripProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/queue");
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-gray-900 text-white rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.99] hover:bg-gray-800",
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      aria-label={`Queue status: ${queueCount} in queue, estimated wait ${estimatedWait} minutes. Tap to view full queue.`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" />
          Queue Status
        </h3>
        <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
          {queueCount} in queue
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Now Serving */}
        <div>
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Now Serving
          </div>
          {nowServing ? (
            <div>
              <div className="text-sm font-semibold truncate">
                {nowServing.customerName}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {nowServing.service}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No one</div>
          )}
        </div>

        {/* Next Up */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Next Up</div>
          {nextUp ? (
            <div>
              <div className="text-sm font-semibold truncate">
                {nextUp.customerName}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {nextUp.service}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No one</div>
          )}
        </div>
      </div>

      {/* Estimated Wait */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400">Estimated Wait:</span>
        <span className="text-sm font-semibold">
          {estimatedWait > 0 ? `${estimatedWait} min` : "No wait"}
        </span>
      </div>
    </div>
  );
}

