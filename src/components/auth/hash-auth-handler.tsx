"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "~/lib/supabase";

export default function HashAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleHashAuth = async () => {
      if (typeof window === "undefined") return;

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const tokenType = hashParams.get("token_type");
      const type = hashParams.get("type");

      console.log("🔍 [HASH_AUTH] Hash auth detection:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        tokenType,
        type,
        fullHash: window.location.hash,
        currentPath: window.location.pathname,
      });

      if (accessToken && refreshToken && type === "magiclink") {
        console.log(
          "🔍 [HASH_AUTH] Magic link tokens found, establishing session"
        );

        try {
          // Set the session using the tokens from the hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          console.log("🔍 [HASH_AUTH] Session establishment result:", {
            hasSession: !!data.session,
            hasUser: !!data.user,
            error: error?.message,
          });

          if (!error && data.session) {
            // Clear the hash from URL
            window.history.replaceState(null, "", window.location.pathname);

            // DEBUG: List all sessionStorage keys - THIS IS CRITICAL
            console.log(
              "🔍 [HASH_AUTH] ===== SESSIONSTORAGE DEBUG START ====="
            );
            const allStorageKeys = Object.keys(sessionStorage);
            console.log(
              "🔍 [HASH_AUTH] All sessionStorage keys:",
              allStorageKeys
            );
            console.log(
              "🔍 [HASH_AUTH] SessionStorage contents:",
              Object.fromEntries(
                allStorageKeys.map((key) => [key, sessionStorage.getItem(key)])
              )
            );

            // Check if there was a redirect parameter in session storage
            const redirectInfo = sessionStorage.getItem("flowql_auth_redirect");
            console.log("🔍 [HASH_AUTH] Looking for flowql_auth_redirect:", {
              exists: !!redirectInfo,
              value: redirectInfo,
              rawValue: redirectInfo ? JSON.stringify(redirectInfo) : null,
            });
            console.log("🔍 [HASH_AUTH] ===== SESSIONSTORAGE DEBUG END =====");

            let redirectPath = "/en/dashboard";

            if (redirectInfo) {
              try {
                const parsed = JSON.parse(redirectInfo);
                redirectPath = parsed.redirect || "/en/dashboard";
                sessionStorage.removeItem("flowql_auth_redirect");

                console.log(
                  "🔍 [HASH_AUTH] Restored redirect path:",
                  redirectPath
                );

                // Check if the redirect path contains search parameters
                if (redirectPath.includes("?search=")) {
                  const url = new URL(redirectPath, window.location.origin);
                  const searchId = url.searchParams.get("search");
                  const domain = url.searchParams.get("domain");

                  console.log("🔍 [HASH_AUTH] Search parameters found:", {
                    searchId,
                    domain,
                  });

                  // Verify search data exists in sessionStorage
                  if (searchId) {
                    const savedData = sessionStorage.getItem(
                      `flowql_search_${searchId}`
                    );
                    console.log(
                      "🔍 [HASH_AUTH] Search data in sessionStorage:",
                      savedData ? "Found" : "Not found"
                    );
                  }
                }
              } catch (e) {
                console.log("🔍 [HASH_AUTH] Could not parse redirect info");
              }
            }

            console.log("🔍 [HASH_AUTH] Final redirect path:", redirectPath);
            router.push(redirectPath);
          } else {
            console.error("🔍 [HASH_AUTH] Failed to establish session:", error);
          }
        } catch (err) {
          console.error("🔍 [HASH_AUTH] Error setting session:", err);
        }
      }
    };

    handleHashAuth();
  }, [router]);

  // This component doesn't render anything, it just handles authentication
  return null;
}
