// @cursor: Landing page hero section with value proposition and primary CTA
// Mobile-first, conversion-focused design

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-5 py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Never miss a returning customer again
        </h1>

        {/* Sub-headline */}
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          BarberQ helps barbershops track walk-ins, manage queues, and build
          lasting customer relationships—all from your phone.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            asChild
            size="lg"
            className="bg-gray-900 text-white hover:bg-gray-800 w-full sm:w-auto min-w-[200px]"
          >
            <Link href="/signup">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
          >
            <Link href="/landing#demo">
              <Play className="w-5 h-5" />
              Watch Demo
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Setup in 2 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

