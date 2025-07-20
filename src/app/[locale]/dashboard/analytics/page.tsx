"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { BarChart3, TrendingUp, Target, Calendar, Filter } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        </div>
        <p className="text-muted-foreground">
          Track your AI search performance metrics and insights over time
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Time Range:</span>
        <div className="flex gap-1">
          {["7d", "30d", "90d", "1y"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="text-xs"
            >
              {range === "7d" && "Last 7 days"}
              {range === "30d" && "Last 30 days"}
              {range === "90d" && "Last 90 days"}
              {range === "1y" && "Last year"}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Mention Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Performing LLM
            </CardTitle>
            <Badge variant="secondary">ChatGPT</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Improvement Opportunities
            </CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Areas to optimize</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2 text-sm">Performance chart coming soon</p>
                <p className="text-xs">Track your improvement over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LLM Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Target className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2 text-sm">
                  LLM performance chart coming soon
                </p>
                <p className="text-xs">
                  Compare performance across AI platforms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Analysis Results</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-4 text-sm">No analysis data available</p>
            <p className="text-xs">
              Run your first analysis to see detailed metrics here
            </p>
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/")}
            >
              Start Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export and Sharing */}
      <Card>
        <CardHeader>
          <CardTitle>Export & Share</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Export CSV
            </Button>
            <Button variant="outline" disabled>
              Generate Report
            </Button>
            <Button variant="outline" disabled>
              Share Dashboard
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Export and sharing features coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
