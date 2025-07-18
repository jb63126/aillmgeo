"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarNav from "~/components/layout/sidebar-nav";
import { supabase } from "~/lib/supabase";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 [DASHBOARD LAYOUT] Checking authentication");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log("🔍 [DASHBOARD LAYOUT] Session check result:", {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: error?.message,
      });

      if (!session) {
        console.log(
          "🔍 [DASHBOARD LAYOUT] No session found, redirecting to login"
        );
        router.push("/en/login");
        return;
      }

      console.log("🔍 [DASHBOARD LAYOUT] Session found, setting authenticated");
      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔍 [DASHBOARD LAYOUT] Auth state change:", event, {
        hasSession: !!session,
        userId: session?.user?.id,
      });

      if (event === "SIGNED_OUT" || !session) {
        console.log(
          "🔍 [DASHBOARD LAYOUT] Auth state change - redirecting to login"
        );
        router.push("/en/login");
      } else if (session) {
        console.log(
          "🔍 [DASHBOARD LAYOUT] Auth state change - setting authenticated"
        );
        setAuthenticated(true);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container">
      <div className="flex min-h-[calc(100vh-140px)] flex-col gap-8 rounded-md py-8 md:min-h-[calc(100vh-160px)] lg:flex-row 2xl:gap-12">
        <aside className="lg:w-1/5">
          <SidebarNav />
        </aside>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
