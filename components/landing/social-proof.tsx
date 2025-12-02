// @cursor: Social proof section with testimonials and trust signals
// Structure ready for content

"use client";

import { Star } from "lucide-react";

// Placeholder testimonials - replace with real ones when available
const testimonials = [
  {
    name: "Coming Soon",
    role: "Salon Owner",
    text: "Testimonials from beta users will appear here.",
    rating: 5,
  },
  {
    name: "Coming Soon",
    role: "Barber",
    text: "More testimonials coming after pilot program.",
    rating: 5,
  },
];

export function SocialProof() {
  return (
    <section className="py-20 px-5 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Trust Badge */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-gray-200 shadow-sm mb-4">
            <span className="text-2xl">✓</span>
            <span className="font-semibold text-gray-900">
              Trusted by salon owners
            </span>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>
              <div>
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Case Study Placeholder */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Case Studies Coming Soon
          </h3>
          <p className="text-gray-600">
            After piloting with 3-5 local salons, we&apos;ll share detailed case
            studies showing how BarberQ improved their operations.
          </p>
        </div>
      </div>
    </section>
  );
}

