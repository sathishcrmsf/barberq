// @cursor: Dashboard v3.0 - Premium Redesign with Server-Side Rendering
// Modern, data-first homepage that fits everything on one screen
// Uber-style minimalist design with hamburger menu navigation
// Optimized for LCP - renders header immediately, streams data progressively

import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardHeader } from "./dashboard-header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Render header immediately - no waiting for data (LCP element) */}
      <DashboardHeader />
      
      {/* Stream in content progressively */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
