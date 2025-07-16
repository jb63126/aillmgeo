"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
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

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Email:
                </span>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  User ID:
                </span>
                <p className="font-mono text-sm text-xs">{user?.id}</p>
              </div>
              {user?.user_metadata?.full_name && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Name:
                  </span>
                  <p className="text-sm">{user.user_metadata.full_name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
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
                <span className="ml-2 text-xs">(Coming Soon)</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Coming Soon */}
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Features Coming Soon
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">
                  Analysis History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  View all your previous website analyses and LLM comparison
                  results.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">
                  Custom Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Generate detailed PDF reports of your LLM performance
                  analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">
                  API Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Integrate FlowQL analysis directly into your applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
