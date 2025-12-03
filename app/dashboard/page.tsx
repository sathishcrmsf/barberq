// @cursor: Dashboard v3.0 - Premium Redesign with Server-Side Rendering
// Modern, data-first homepage that fits everything on one screen
// Uber-style minimalist design with hamburger menu navigation
// Optimized for LCP - renders immediately with server data

import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";
import { DashboardSkeleton } from "./dashboard-skeleton";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
