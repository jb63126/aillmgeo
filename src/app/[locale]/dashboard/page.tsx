"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import LLMComparisonTable from "~/components/ui/llm-comparison-table";
import { Plus, Globe, Check, X, Home } from "lucide-react";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface LLMResult {
  llm: string;
  result: boolean;
  status?: string;
}

interface QueryResult {
  query: string;
  results: LLMResult[];
}

interface SearchData {
  data: QueryResult[];
  domain?: string;
  timestamp: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // This component is now rendered within the dashboard layout, so no auth check needed here
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
    // Load search data from URL params and session storage
    const searchId = searchParams.get("search");
    const domain = searchParams.get("domain");

    console.log("🔍 [DASHBOARD PAGE] Search parameters:", {
      searchId,
      domain,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    if (searchId && typeof window !== "undefined") {
      const savedData = sessionStorage.getItem(`flowql_search_${searchId}`);
      console.log(
        "🔍 [DASHBOARD PAGE] Session storage data:",
        savedData ? "Found" : "Not found"
      );

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log("🔍 [DASHBOARD PAGE] Parsed search data:", {
            hasData: !!parsedData.data,
            domain: parsedData.domain,
            timestamp: parsedData.timestamp,
            resultCount: parsedData.data?.length || 0,
          });
          setSearchData(parsedData);
        } catch (error) {
          console.error(
            "🔍 [DASHBOARD PAGE] Error parsing search data:",
            error
          );
        }
      }
    } else {
      console.log("🔍 [DASHBOARD PAGE] No search ID found or not in browser");
    }
  }, [searchParams]);

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const UpgradeModal = () => {
    if (!showUpgradeModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Upgrade to Pro
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Add custom questions and get deeper insights
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Pro Plan
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Unlimited custom questions
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      $29
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      /month
                    </span>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Add unlimited custom questions
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Advanced analytics and insights
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Export detailed reports
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // In a real app, this would integrate with payment system
                  alert("Upgrade functionality coming soon!");
                  setShowUpgradeModal(false);
                }}
                className="flex-1"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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

      {searchData ? (
        // Display LLM Analysis Results
        <div className="space-y-6">
          {/* Domain Header */}
          {searchData.domain && (
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">
                Analysis for {searchData.domain}
              </h2>
              <Badge variant="secondary">
                {new Date(searchData.timestamp).toLocaleDateString()}
              </Badge>
            </div>
          )}

          {/* LLM Comparison Table */}
          <LLMComparisonTable
            data={searchData.data}
            domain={searchData.domain}
            title="LLM Performance Results"
          />

          {/* Add Questions Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Plus className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">
                  Add More Questions
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get deeper insights with custom questions tailored to your
                  business
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleUpgrade}
                >
                  Upgrade to Add Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Default Dashboard Content
        <div className="space-y-6">
          {/* Quick Start Card */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome to FlowQL</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Start analyzing your website&apos;s performance across different
                AI search engines.
              </p>
              <Button onClick={() => router.push("/")}>
                <Home className="mr-2 h-4 w-4" />
                Analyze New Website
              </Button>
            </CardContent>
          </Card>

          {/* Dashboard Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => router.push("/")}>
                  Analyze New Website
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  View Analysis History
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Coming Soon)
                  </span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No recent analyses. Start by analyzing a website to see
                  results here.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Email:</span>
                  <br />
                  <span className="text-muted-foreground">{user?.email}</span>
                </div>
                {user?.user_metadata?.full_name && (
                  <div className="text-sm">
                    <span className="font-medium">Name:</span>
                    <br />
                    <span className="text-muted-foreground">
                      {user.user_metadata.full_name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <UpgradeModal />
    </div>
  );
}
