// @cursor: Features showcase section for landing page
// Simple, benefit-focused feature cards

"use client";

import {
  Clock,
  Users,
  Phone,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Track walk-ins in real-time",
    description:
      "See who's waiting, who's being served, and manage your queue with a single tap.",
  },
  {
    icon: Users,
    title: "Never lose a customer",
    description:
      "Automatically track every customer visit and get smart reminders for follow-ups.",
  },
  {
    icon: Phone,
    title: "Smart follow-up reminders",
    description:
      "Know exactly when to call customers back based on their service history.",
  },
  {
    icon: BarChart3,
    title: "Revenue insights at a glance",
    description:
      "See your daily revenue, popular services, and performance metrics instantly.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to run your shop
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple tools designed for busy barbers who need speed and clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            "Mobile-first design",
            "No training required",
            "Works offline",
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

