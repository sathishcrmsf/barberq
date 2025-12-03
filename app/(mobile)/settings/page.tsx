// @cursor: This screen should strictly follow the BRD:
// Settings page → displays app settings and preferences.
// Mobile-first, Uber-style minimalistic design.

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Settings,
  Bell,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  Info,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();

  const settingsSections = [
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { label: "Push Notifications", href: "#", action: "toggle" },
        { label: "Email Notifications", href: "#", action: "toggle" },
        { label: "Queue Alerts", href: "#", action: "toggle" },
      ],
    },
    {
      title: "Appearance",
      icon: Moon,
      items: [
        { label: "Dark Mode", href: "#", action: "toggle" },
        { label: "Language", href: "#", action: "navigate" },
      ],
    },
    {
      title: "General",
      icon: Settings,
      items: [
        { label: "Shop Profile", href: "/shop", action: "navigate" },
        { label: "Hours & Pricing", href: "/hours", action: "navigate" },
        { label: "Privacy Policy", href: "#", action: "navigate" },
        { label: "Terms of Service", href: "#", action: "navigate" },
      ],
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: [
        { label: "Help Center", href: "#", action: "navigate" },
        { label: "Contact Support", href: "#", action: "navigate" },
        { label: "About", href: "#", action: "navigate" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Back"
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {settingsSections.map((section, sectionIdx) => (
          <Card key={sectionIdx} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <section.icon className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
            </div>

            <div className="space-y-1">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx}>
                  {item.action === "navigate" ? (
                    <Link
                      href={item.href}
                      className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm text-gray-900">{item.label}</span>
                      <span className="text-gray-400">›</span>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between py-3 px-2 rounded-lg">
                      <span className="text-sm text-gray-900">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                  )}
                  {itemIdx < section.items.length - 1 && (
                    <div className="border-b border-gray-100" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* App Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Info className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">App Information</h2>
          </div>
          <p className="text-sm text-gray-600">BarberQ v1.0.0</p>
          <p className="text-xs text-gray-500 mt-1">Queue Management System</p>
        </Card>
      </main>
    </div>
  );
}

