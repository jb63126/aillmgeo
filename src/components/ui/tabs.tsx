"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";

export interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export const Tabs = ({ defaultValue, className, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={cn("w-full", className)}>
      <div data-active-tab={activeTab}>{children}</div>
    </div>
  );
};

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList = ({ className, children }: TabsListProps) => {
  return (
    <div className={cn("flex rounded-lg bg-muted p-1", className)}>
      {children}
    </div>
  );
};

export interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsTrigger = ({
  value,
  className,
  children,
}: TabsTriggerProps) => {
  return (
    <button
      className={cn(
        "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all hover:bg-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      data-state="active"
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent = ({
  value,
  className,
  children,
}: TabsContentProps) => {
  return <div className={cn("mt-4", className)}>{children}</div>;
};
