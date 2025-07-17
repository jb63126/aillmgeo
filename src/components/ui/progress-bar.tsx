"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "loading" | "completed" | "error";
  error?: string;
}

interface ProgressBarProps {
  steps: ProgressStep[];
  className?: string;
}

export default function ProgressBar({
  steps,
  className = "",
}: ProgressBarProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completedSteps = steps.filter(
      (step) => step.status === "completed"
    ).length;
    const loadingStepIndex = steps.findIndex(
      (step) => step.status === "loading"
    );

    if (loadingStepIndex !== -1) {
      setCurrentStep(loadingStepIndex);
    } else {
      setCurrentStep(completedSteps);
    }
  }, [steps]);

  const getStepIcon = (step: ProgressStep, index: number) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return (
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
        );
    }
  };

  const getStepTextColor = (step: ProgressStep) => {
    switch (step.status) {
      case "completed":
        return "text-green-700 dark:text-green-400";
      case "loading":
        return "text-blue-700 dark:text-blue-400";
      case "error":
        return "text-red-700 dark:text-red-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const getProgressWidth = () => {
    const completedSteps = steps.filter(
      (step) => step.status === "completed"
    ).length;
    return (completedSteps / steps.length) * 100;
  };

  return (
    <div className={`mx-auto w-full max-w-3xl ${className}`}>
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${getProgressWidth()}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center space-x-3 transition-all duration-300 ${
              index <= currentStep ? "opacity-100" : "opacity-50"
            }`}
          >
            {getStepIcon(step, index)}
            <div className="flex-1">
              <div className={`font-medium ${getStepTextColor(step)}`}>
                {step.label}
              </div>
              {step.status === "error" && step.error && (
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {step.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
