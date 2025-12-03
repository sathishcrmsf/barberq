// @cursor: Static header component that renders immediately
// This is the LCP element - must render without any data fetching

import { Menu } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">BarberQ</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Queue Management System
          </p>
        </div>
        {/* Menu button - will be hydrated by client component */}
        <div id="menu-button-placeholder">
          <button
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
            aria-label="Open menu"
            disabled
          >
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      </div>
    </header>
  );
}

