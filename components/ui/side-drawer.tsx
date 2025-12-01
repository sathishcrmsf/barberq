// @cursor: Side drawer navigation component
// Premium hamburger menu with smooth slide-in animation

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  X,
  Store,
  Scissors,
  Tags,
  UsersIcon,
  Clock,
  DollarSign,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const menuItems = [
    {
      section: "Shop Management",
      items: [
        { icon: Store, label: "Shop Profile", href: "/shop" },
        { icon: Scissors, label: "Services", href: "/services" },
        { icon: Tags, label: "Categories", href: "/categories" },
        { icon: UsersIcon, label: "Staff", href: "/staff" },
      ],
    },
    {
      section: "Business",
      items: [
        { icon: Clock, label: "Hours & Pricing", href: "/hours" },
        { icon: DollarSign, label: "Revenue Reports", href: "/analytics" },
      ],
    },
    {
      section: "Support",
      items: [
        { icon: Settings, label: "Settings", href: "/settings" },
        { icon: HelpCircle, label: "Help & Support", href: "/support" },
        { icon: LogOut, label: "Logout", href: "/logout" },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-black">Menu</h2>
            <p className="text-xs text-gray-600 mt-0.5">BarberQ Management</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="overflow-y-auto h-[calc(100%-80px)] p-4">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors group"
                    >
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                        <item.icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

