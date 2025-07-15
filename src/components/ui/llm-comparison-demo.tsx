"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import LLMComparisonTable from "./llm-comparison-table";
import {
  sampleLLMData,
  websiteAnalysisQueries,
} from "~/data/llm-comparison-data";

export default function LLMComparisonDemo() {
  const [activeTab, setActiveTab] = useState<"business" | "analysis">(
    "business"
  );

  const calculateSuccessRate = (data: any[]) => {
    const totalQueries = data.length;
    const llmStats =
      data[0]?.results.map((llmResult: any) => ({
        llm: llmResult.llm,
        successCount: data.filter(
          (query) =>
            query.results.find((r: any) => r.llm === llmResult.llm)?.result
        ).length,
        totalQueries,
        successRate: Math.round(
          (data.filter(
            (query) =>
              query.results.find((r: any) => r.llm === llmResult.llm)?.result
          ).length /
            totalQueries) *
            100
        ),
      })) || [];

    return llmStats;
  };

  const businessStats = calculateSuccessRate(sampleLLMData);
  const analysisStats = calculateSuccessRate(websiteAnalysisQueries);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          LLM Performance Comparison
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          Comprehensive analysis of how different Large Language Models perform
          across various business intelligence and website analysis tasks.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={activeTab === "business" ? "default" : "outline"}
          onClick={() => setActiveTab("business")}
          className="px-6"
        >
          Business Intelligence
        </Button>
        <Button
          variant={activeTab === "analysis" ? "default" : "outline"}
          onClick={() => setActiveTab("analysis")}
          className="px-6"
        >
          Website Analysis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {(activeTab === "business" ? businessStats : analysisStats).map(
          (stat: any) => (
            <Card key={stat.llm} className="text-center">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{stat.llm}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-3xl font-bold">
                  {stat.successRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.successCount} of {stat.totalQueries} tasks completed
                </div>
                <Badge
                  variant={
                    stat.successRate >= 80
                      ? "default"
                      : stat.successRate >= 60
                        ? "secondary"
                        : "destructive"
                  }
                  className="mt-2"
                >
                  {stat.successRate >= 80
                    ? "Excellent"
                    : stat.successRate >= 60
                      ? "Good"
                      : "Needs Improvement"}
                </Badge>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Comparison Table */}
      <LLMComparisonTable
        data={activeTab === "business" ? sampleLLMData : websiteAnalysisQueries}
        title={
          activeTab === "business"
            ? "Business Intelligence Tasks"
            : "Website Analysis Tasks"
        }
        className="mt-8"
      />

      {/* Key Insights */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Strengths</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• All models excel at basic information extraction</li>
                <li>• Company identification and core business analysis</li>
                <li>• Contact information and location detection</li>
                <li>• Value proposition identification</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Challenges</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Pricing information often unavailable on websites</li>
                <li>• Team size and workforce details rarely public</li>
                <li>• Recent achievements require real-time data</li>
                <li>• Partnership information may be outdated</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
