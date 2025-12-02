// @cursor: First-time user onboarding wizard
// Step-by-step guide to help new users get started

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  action: {
    label: string;
    href: string;
  };
  completed: boolean;
}

const steps: Omit<OnboardingStep, "completed">[] = [
  {
    id: 1,
    title: "Welcome! Let's set up your shop",
    description:
      "BarberQ helps you manage walk-ins, track customers, and grow your business. Let's get you started in just a few steps.",
    action: {
      label: "Get Started",
      href: "#",
    },
  },
  {
    id: 2,
    title: "Add your first service",
    description:
      "Start by adding the services you offer. You can add prices, durations, and organize them by categories.",
    action: {
      label: "Add Service",
      href: "/services",
    },
  },
  {
    id: 3,
    title: "Add your first customer",
    description:
      "Track customers by phone number. This helps you see their visit history and know when to follow up.",
    action: {
      label: "Add Customer",
      href: "/customers",
    },
  },
  {
    id: 4,
    title: "Record a walk-in",
    description:
      "When a customer walks in, add them to the queue. You can track their status from waiting to in-progress to done.",
    action: {
      label: "Go to Queue",
      href: "/queue",
    },
  },
  {
    id: 5,
    title: "Explore your dashboard",
    description:
      "Your dashboard shows revenue, queue status, and smart insights. Everything you need to run your shop efficiently.",
    action: {
      label: "View Dashboard",
      href: "/dashboard",
    },
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Check if onboarding should be shown
    const onboardingShown = localStorage.getItem("barberq_onboarding_shown");
    const urlParams = new URLSearchParams(window.location.search);
    const showOnboarding = urlParams.get("onboarding") === "true";

    if (showOnboarding || !onboardingShown) {
      setIsOpen(true);
      localStorage.setItem("barberq_onboarding_shown", "true");
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsOpen(false);
    // Remove onboarding param from URL
    router.push("/dashboard");
  };

  const handleActionClick = (href: string) => {
    if (href !== "#") {
      // Mark step as completed
      setCompletedSteps([...completedSteps, currentStep]);
      // Close wizard and navigate
      setIsOpen(false);
      router.push(href);
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Getting Started</h2>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-gray-900 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {completedSteps.includes(currentStep) ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  {currentStep + 1}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx <= currentStep ? "bg-gray-900" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          {currentStepData.action.href !== "#" && (
            <Button
              onClick={() => handleActionClick(currentStepData.action.href)}
              className="w-full bg-gray-900 text-white hover:bg-gray-800"
              size="lg"
            >
              {currentStepData.action.label}
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-500 hover:text-gray-700 text-center py-2"
          >
            Skip onboarding
          </button>
        </div>
      </div>
    </div>
  );
}

