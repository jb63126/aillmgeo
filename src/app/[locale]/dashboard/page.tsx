"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  BarChart3,
  Activity,
  ArrowRight,
  Microscope,
  Package,
  BarChart,
  Globe,
  Calendar,
  Eye,
} from "lucide-react";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface RecentActivity {
  id: string;
  type: "analysis" | "question" | "export";
  domain: string;
  timestamp: number;
  status: "completed" | "in_progress" | "failed";
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Load recent activity from localStorage
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage);
      const analysisKeys = keys.filter(
        (key) =>
          key.startsWith("flowql_analysis_") || key.startsWith("flowql_search_")
      );

      const activities: RecentActivity[] = [];

      analysisKeys.slice(0, 5).forEach((key) => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "");
          if (data.url || data.domain) {
            activities.push({
              id: key,
              type: "analysis",
              domain:
                data.domain ||
                (data.url ? new URL(data.url).hostname : "Unknown"),
              timestamp: data.timestamp || Date.now(),
              status: "completed",
            });
          }
        } catch (error) {
          console.error("Error parsing activity data:", error);
        }
      });

      // Sort by timestamp, newest first
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivity(activities);
    }
  }, []);

  // Mock data for KPIs
  const mockKPIs = {
    overallScore: 73,
    scoreChange: 5.2,
    totalAnalyses: recentActivity.length,
    competitiveGaps: 3,
    bestPerformingLLM: "ChatGPT",
    bestLLMScore: 89,
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.user_metadata?.full_name || user?.email}
        </p>
      </div>

      {/* KPI Widgets - Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Overall Mention Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Mention Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKPIs.overallScore}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{mockKPIs.scoreChange}%</span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>

        {/* Total Analyses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKPIs.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">Websites analyzed</p>
          </CardContent>
        </Card>

        {/* Best Performing LLM */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Performing LLM
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {mockKPIs.bestPerformingLLM}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockKPIs.bestLLMScore}% success rate
            </p>
          </CardContent>
        </Card>

        {/* Competitive Gaps */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Improvement Areas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockKPIs.competitiveGaps}
            </div>
            <p className="text-xs text-muted-foreground">Areas to optimize</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Trend (spans 2 columns) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4 text-sm">Performance chart coming soon</p>
                  <p className="text-xs">
                    Track your AI search visibility over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => router.push("/")}>
              <Activity className="mr-2 h-4 w-4" />
              Run New Analysis
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/en/dashboard/analysis-lab")}
            >
              <Microscope className="mr-2 h-4 w-4" />
              Analysis Lab
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/en/dashboard/analytics")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/en/dashboard/assets")}
            >
              <Package className="mr-2 h-4 w-4" />
              Manage Assets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/en/dashboard/assets")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Activity className="mx-auto h-8 w-8 opacity-50" />
                <p className="mt-2 text-sm">No recent activity</p>
                <p className="text-xs">
                  Run your first analysis to see activity here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 4).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                        <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.domain}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{activity.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competitive Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Competitive Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">ChatGPT Performance</p>
                  <p className="text-xs text-muted-foreground">
                    vs. industry average
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+15%</p>
                  <p className="text-xs text-muted-foreground">Above avg</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Claude Performance</p>
                  <p className="text-xs text-muted-foreground">
                    vs. industry average
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">-8%</p>
                  <p className="text-xs text-muted-foreground">Below avg</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Content Gaps</p>
                  <p className="text-xs text-muted-foreground">
                    Opportunities found
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {mockKPIs.competitiveGaps}
                  </p>
                  <p className="text-xs text-muted-foreground">Areas</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => router.push("/en/dashboard/analytics")}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                View Detailed Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
