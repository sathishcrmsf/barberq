// @cursor: Loading skeleton that renders immediately
// This provides instant visual feedback while data loads
// Note: Header is rendered separately in page.tsx for immediate LCP

export function DashboardSkeleton() {
  return (
    <div className="p-5 space-y-5">
      {/* Content Skeleton - header already rendered */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
      <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
    </div>
  );
}

