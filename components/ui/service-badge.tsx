interface ServiceBadgeProps {
  isActive: boolean;
}

export function ServiceBadge({ isActive }: ServiceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium shrink-0 ${
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

