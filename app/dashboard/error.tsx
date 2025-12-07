"use client";

// Error boundary for dashboard
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Unable to Load Dashboard
        </h2>
        <p className="text-gray-600 mb-4">
          {error.message || "An unexpected error occurred while loading the dashboard."}
        </p>
        {error.message?.includes("database") || error.message?.includes("connection") ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Database Connection Issue:</strong> Check your DATABASE_URL environment variable and ensure your database is accessible.
            </p>
          </div>
        ) : null}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Try Again
          </button>
          <a
            href="/queue"
            className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition text-center"
          >
            Go to Queue
          </a>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

