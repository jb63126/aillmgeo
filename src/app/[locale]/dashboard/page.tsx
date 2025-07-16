"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Plus, Search, Globe, BarChart3, User, Check, X } from "lucide-react";

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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      } else if (session) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    // Load search data from URL params and session storage
    const searchId = searchParams.get("search");
    if (searchId && typeof window !== "undefined") {
      const savedData = sessionStorage.getItem(`flowql_search_${searchId}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setSearchData(parsedData);
        } catch (error) {
          console.error("Error parsing search data:", error);
        }
      }
    }
  }, [searchParams]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const UpgradeModal = () => {
    if (!showUpgradeModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Upgrade to Pro
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Add custom questions and get deeper insights
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Pro Plan</h3>
                    <p className="text-sm text-gray-600">
                      Unlimited custom questions
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      $29
                    </span>
                    <span className="text-sm text-gray-600">/month</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-600">
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const ResultIcon = ({
    result,
    status,
  }: {
    result: boolean;
    status?: string;
  }) => (
    <div className="flex items-center justify-center">
      {status === "Fail" ? (
        <span className="text-xs font-bold text-orange-500">Fail</span>
      ) : result ? (
        <Check className="h-4 w-4 text-green-500" strokeWidth={2} />
      ) : (
        <X className="h-4 w-4 text-red-500" strokeWidth={2} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-2xl font-black text-transparent">
              FlowQL Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {searchData ? (
              <div className="space-y-6">
                {/* Domain Header */}
                {searchData.domain && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Analysis for {searchData.domain}
                    </h2>
                    <Badge variant="secondary">
                      {new Date(searchData.timestamp).toLocaleDateString()}
                    </Badge>
                  </div>
                )}

                {/* Search Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      LLM Performance Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {searchData.data.map((item, index) => (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="mb-3">
                            <h3 className="font-medium text-gray-900">
                              {item.query}
                            </h3>
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            {item.results.map((result, resultIndex) => (
                              <div
                                key={resultIndex}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm text-gray-600">
                                  {result.llm}
                                </span>
                                <ResultIcon
                                  result={result.result}
                                  status={result.status}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Add Questions Row */}
                      <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
                        <div className="space-y-2">
                          <Plus className="mx-auto h-8 w-8 text-gray-400" />
                          <h3 className="font-medium text-gray-600">
                            Add More Questions
                          </h3>
                          <p className="text-sm text-gray-500">
                            Get deeper insights with custom questions
                          </p>
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={handleUpgrade}
                          >
                            Upgrade to Add Questions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Default dashboard content when no search results
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Welcome to FlowQL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      You now have access to our full LLM analysis results and
                      advanced features.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        className="w-full"
                        onClick={() => router.push("/")}
                      >
                        Analyze New Website
                      </Button>
                      <Button variant="outline" className="w-full" disabled>
                        View Analysis History
                        <span className="ml-2 text-xs">(Coming Soon)</span>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        No recent analyses. Start by analyzing a website to see
                        results here.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="searches" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="searches">
                      <Search className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="domains">
                      <Globe className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                      <BarChart3 className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="profile">
                      <User className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="searches" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Recent Searches</h3>
                      {searchData ? (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">
                            {searchData.domain || "Unknown Domain"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(searchData.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">
                          No recent searches
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="domains" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Analyzed Domains</h3>
                      {searchData?.domain ? (
                        <div className="text-xs text-gray-600">
                          {searchData.domain}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">
                          No domains analyzed
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Analytics</h3>
                      <p className="text-xs text-gray-500">Coming soon</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="profile" className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Profile</h3>
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="font-medium">Email:</span>
                          <br />
                          {user?.email}
                        </div>
                        {user?.user_metadata?.full_name && (
                          <div className="text-xs">
                            <span className="font-medium">Name:</span>
                            <br />
                            {user.user_metadata.full_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <UpgradeModal />
    </div>
  );
}
