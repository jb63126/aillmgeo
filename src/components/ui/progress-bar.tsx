"use client";

import { useState, useEffect } from "react";

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
  const [currentStatusText, setCurrentStatusText] = useState("");

  useEffect(() => {
    // Find the current active step (loading or first pending)
    const loadingStepIndex = steps.findIndex(
      (step) => step.status === "loading"
    );
    const currentStepIndex =
      loadingStepIndex !== -1
        ? loadingStepIndex
        : steps.findIndex((step) => step.status === "pending");

    // If we have a valid step, set the text immediately
    if (currentStepIndex !== -1) {
      const currentStep = steps[currentStepIndex];
      const newText = currentStep.label;
      setCurrentStatusText(newText);
    }
  }, [steps]);

  const EllipsisLoader = ({ text }: { text: string }) => {
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
      const interval = setInterval(() => {
        setDotCount((prev) => (prev === 3 ? 1 : prev + 1));
      }, 400); // 1200ms / 3 = 400ms per dot

      return () => clearInterval(interval);
    }, []);

    const baseText = text.replace(/\.+$/, ""); // Remove existing dots
    const dots = ".".repeat(dotCount);

    return (
      <div className="relative flex min-h-[1.5rem] items-center justify-center overflow-hidden">
        <div className="transition-all duration-200">
          {baseText}
          {dots}
        </div>
      </div>
    );
  };

  // Don't render anything if no steps or no current status
  if (!steps.length || !currentStatusText) {
    return null;
  }

  return (
    <div className={`mx-auto w-full max-w-3xl ${className}`}>
      {/* Single Centered Status Line */}
      <div className="py-8 text-center">
        <div className="text-lg font-medium text-blue-700 dark:text-blue-400">
          <EllipsisLoader text={currentStatusText} />
        </div>
      </div>
    </div>
  );
}
