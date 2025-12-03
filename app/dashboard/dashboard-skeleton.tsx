// @cursor: Loading skeleton that renders immediately
// This provides instant visual feedback while data loads

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Content Skeleton */}
      <div className="p-5 space-y-5">
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
    </div>
  );
}

