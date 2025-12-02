// @cursor: Marketing landing page for prospects
// Conversion-focused with clear value proposition, visuals, and CTAs
// Mobile-first Uber-style minimalism

"use client";

import Link from "next/link";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SocialProof } from "@/components/landing/social-proof";
import { PricingCTA } from "@/components/landing/pricing-cta";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Visual Assets / Demo Section */}
      <section id="demo" className="py-16 px-5 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            See It In Action
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Watch how BarberQ helps you manage walk-ins, track customers, and
            grow your business.
          </p>

          {/* Demo Video Placeholder */}
          <div className="bg-gray-200 rounded-2xl aspect-video flex items-center justify-center mb-8">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Demo Video Coming Soon</p>
              <p className="text-sm text-gray-400">
                60-90 second walkthrough of key features
              </p>
            </div>
          </div>

          {/* Screenshot Gallery Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "Dashboard Overview",
              "Queue Management",
              "Customer Tracking",
            ].map((label, idx) => (
              <div
                key={idx}
                className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center"
              >
                <p className="text-gray-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProof />

      {/* Pricing / Final CTA */}
      <PricingCTA />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">BarberQ</h3>
              <p className="text-gray-400 text-sm">
                Queue management for modern barbershops.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white">
                    Free Trial
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} BarberQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

