// @cursor: Final pricing and CTA section
// Free trial focus with clear benefits

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

export function PricingCTA() {
  return (
    <section className="py-20 px-5 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Start your free trial today
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          No credit card required. Full access for 14 days.
        </p>

        {/* Trial Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            "Full feature access",
            "Unlimited walk-ins",
            "Priority support",
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3 justify-center">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-gray-200">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <Button
          asChild
          size="lg"
          className="bg-white text-gray-900 hover:bg-gray-100 min-w-[250px] mb-4"
        >
          <Link href="/signup">
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>

        <p className="text-sm text-gray-400">
          Cancel anytime. No hidden fees.
        </p>
      </div>
    </section>
  );
}

