// @cursor: Homepage routing logic
// New visitors → landing page, returning users → dashboard

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has visited before (localStorage)
    const hasVisited = typeof window !== "undefined" && localStorage.getItem("barberq_has_visited");
    
    if (hasVisited) {
      // Returning user → dashboard
      router.push("/dashboard");
    } else {
      // New visitor → landing page
      router.push("/landing");
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
