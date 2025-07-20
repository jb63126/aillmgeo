"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import LLMComparisonTable from "~/components/ui/llm-comparison-table";
import { Plus, Globe, Check, X, Home, Microscope } from "lucide-react";

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

export default function AnalysisLab() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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
    // Load search data from URL params and localStorage
    const searchId = searchParams.get("search");
    const domain = searchParams.get("domain");

    console.log("🔬 [ANALYSIS LAB] Search parameters:", {
      searchId,
      domain,
      allParams: Object.fromEntries(searchParams.entries()),
      currentUrl: typeof window !== "undefined" ? window.location.href : "SSR",
    });

    if (searchId && typeof window !== "undefined") {
      const savedData = localStorage.getItem(`flowql_search_${searchId}`);
      console.log("🔬 [ANALYSIS LAB] LocalStorage lookup:", {
        searchId,
        key: `flowql_search_${searchId}`,
        hasData: !!savedData,
        dataLength: savedData?.length || 0,
      });

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log("🔬 [ANALYSIS LAB] Parsed search data:", {
            hasData: !!parsedData.data,
            domain: parsedData.domain,
            timestamp: parsedData.timestamp,
            resultCount: parsedData.data?.length || 0,
            sampleQuery: parsedData.data?.[0]?.query || "No queries",
          });
          setSearchData(parsedData);
        } catch (error) {
          console.error("🔬 [ANALYSIS LAB] Error parsing search data:", error);
        }
      } else {
        console.log("🔬 [ANALYSIS LAB] No data found for search ID:", searchId);
      }
    } else {
      console.log("🔬 [ANALYSIS LAB] No search ID found or not in browser");
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
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Microscope className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">Analysis Lab</h1>
        </div>
        <p className="text-muted-foreground">
          Deep dive into LLM performance analysis and custom research questions
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
            isAuthenticated={true}
          />

          {/* Add Questions Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Plus className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">
                  Add Custom Questions
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get deeper insights with custom questions tailored to your
                  business needs and research goals
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
        // Default Analysis Lab Content
        <div className="space-y-6">
          {/* Quick Start Card */}
          <Card>
            <CardHeader>
              <CardTitle>Start Your Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Begin analyzing your website&apos;s performance across different
                AI search engines. Get detailed insights into how your content
                performs in ChatGPT, Claude, Perplexity, and Gemini.
              </p>
              <Button onClick={() => router.push("/")}>
                <Home className="mr-2 h-4 w-4" />
                Start New Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Lab Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  LLM Performance Testing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Test how well your content performs across major AI search
                  platforms
                </p>
                <Button className="w-full" onClick={() => router.push("/")}>
                  Run LLM Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Create targeted questions specific to your industry and goals
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleUpgrade}
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Review past analyses and track performance improvements over
                  time
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Research Tools Section */}
          <Card>
            <CardHeader>
              <CardTitle>Research Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Competitive Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare your performance against competitors in AI search
                    results
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Content Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Get recommendations for improving your content visibility
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Trend Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Track changes in AI search performance over time
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Custom Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate detailed reports for stakeholders and teams
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <UpgradeModal />
    </div>
  );
}
