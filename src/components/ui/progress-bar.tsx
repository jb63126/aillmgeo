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
  const [animatingSteps, setAnimatingSteps] = useState<Set<string>>(new Set());

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

  // Track when steps change status to trigger animation
  useEffect(() => {
    steps.forEach((step, index) => {
      if (step.status === "loading" && !animatingSteps.has(step.id)) {
        setAnimatingSteps((prev) => new Set(prev).add(step.id));
        // Remove animation after completion
        setTimeout(() => {
          setAnimatingSteps((prev) => {
            const newSet = new Set(prev);
            newSet.delete(step.id);
            return newSet;
          });
        }, 800);
      }
    });
  }, [steps, animatingSteps]);

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

  const SlotMachineText = ({
    text,
    isAnimating,
  }: {
    text: string;
    isAnimating: boolean;
  }) => {
    const [displayText, setDisplayText] = useState(text);
    const [animationPhase, setAnimationPhase] = useState<
      "idle" | "rolling" | "settling"
    >("idle");

    useEffect(() => {
      if (isAnimating) {
        setAnimationPhase("rolling");

        // Random text rolling phase
        const rollingInterval = setInterval(() => {
          const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
          const randomText = text
            .split("")
            .map(
              () => randomChars[Math.floor(Math.random() * randomChars.length)]
            )
            .join("");
          setDisplayText(randomText);
        }, 50);

        // Stop rolling and settle to final text
        setTimeout(() => {
          clearInterval(rollingInterval);
          setAnimationPhase("settling");
          setDisplayText(text);

          setTimeout(() => {
            setAnimationPhase("idle");
          }, 200);
        }, 600);

        return () => clearInterval(rollingInterval);
      }
    }, [isAnimating, text]);

    return (
      <div className="relative h-6 overflow-hidden">
        <div
          className={`transition-all duration-200 ${
            animationPhase === "rolling"
              ? "animate-pulse opacity-80"
              : animationPhase === "settling"
                ? "animate-bounce opacity-100"
                : "opacity-100"
          }`}
          style={{
            transform:
              animationPhase === "rolling" || animationPhase === "settling"
                ? "translateY(0)"
                : "translateY(0)",
          }}
        >
          {displayText}
        </div>
      </div>
    );
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
                <SlotMachineText
                  text={step.label}
                  isAnimating={animatingSteps.has(step.id)}
                />
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
