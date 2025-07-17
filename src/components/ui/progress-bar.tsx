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
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousStepIndex, setPreviousStepIndex] = useState(-1);

  useEffect(() => {
    // Find the current active step (loading or first pending)
    const loadingStepIndex = steps.findIndex(
      (step) => step.status === "loading"
    );
    const currentStepIndex =
      loadingStepIndex !== -1
        ? loadingStepIndex
        : steps.findIndex((step) => step.status === "pending");

    // If we have a valid step and it's different from previous
    if (currentStepIndex !== -1 && currentStepIndex !== previousStepIndex) {
      const currentStep = steps[currentStepIndex];
      const newText = `${currentStep.label}...`;

      // Only animate if we're transitioning to a new step
      if (previousStepIndex !== -1 && currentStatusText !== "") {
        setIsAnimating(true);

        // Start slot machine animation, then settle to new text
        setTimeout(() => {
          setCurrentStatusText(newText);
          setIsAnimating(false);
        }, 2500); // 5x slower animation (was 500ms, now 2500ms)
      } else {
        // First step, no animation needed
        setCurrentStatusText(newText);
      }

      setPreviousStepIndex(currentStepIndex);
    }
  }, [steps, previousStepIndex, currentStatusText]);

  const SlotMachineText = ({
    text,
    isAnimating,
  }: {
    text: string;
    isAnimating: boolean;
  }) => {
    const [displayText, setDisplayText] = useState(text);

    useEffect(() => {
      if (isAnimating) {
        // Slower random text rolling phase (5x slower)
        const rollingInterval = setInterval(() => {
          const randomChars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz";
          const randomText = text
            .split("")
            .map((char) =>
              char === "."
                ? "."
                : randomChars[Math.floor(Math.random() * randomChars.length)]
            )
            .join("");
          setDisplayText(randomText);
        }, 250); // 5x slower (was 50ms, now 250ms)

        // Stop rolling and settle to final text (5x slower)
        setTimeout(() => {
          clearInterval(rollingInterval);
          setDisplayText(text);
        }, 2000); // 5x slower settling (was 400ms, now 2000ms)

        return () => clearInterval(rollingInterval);
      } else {
        setDisplayText(text);
      }
    }, [isAnimating, text]);

    return (
      <div className="relative flex min-h-[1.5rem] items-center justify-center overflow-hidden">
        <div
          className={`transition-all duration-500 ${
            isAnimating ? "scale-105 opacity-70" : "scale-100 opacity-100"
          }`}
        >
          {displayText}
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
          <SlotMachineText text={currentStatusText} isAnimating={isAnimating} />
        </div>
      </div>
    </div>
  );
}
