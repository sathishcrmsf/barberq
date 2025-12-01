// @cursor: Shopify/Stripe-style inline toggle switch component
// Accessible, touch-friendly toggle for instant status changes

"use client";

import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  size = "md",
  className,
}: ToggleSwitchProps) {
  const sizes = {
    sm: "w-9 h-5",
    md: "w-11 h-6",
    lg: "w-14 h-7",
  };

  const thumbSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const translateX = {
    sm: "translate-x-5",
    md: "translate-x-6",
    lg: "translate-x-8",
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        sizes[size],
        checked ? "bg-green-600" : "bg-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer hover:shadow-md",
        className
      )}
      // Ensure min 48px touch target for mobile
      style={{ minHeight: "48px", minWidth: "48px", padding: "11px" }}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow-lg transform transition-transform",
          thumbSizes[size],
          checked ? translateX[size] : "translate-x-1"
        )}
      />
    </button>
  );
}

