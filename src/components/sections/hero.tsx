"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import LLMComparisonTable from "~/components/ui/llm-comparison-table";
import ProgressBar, { ProgressStep } from "~/components/ui/progress-bar";
import { websiteAnalysisQueries } from "~/data/llm-comparison-data";
import { supabase } from "~/lib/supabase";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [showLLMSection, setShowLLMSection] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [businessAnalysis, setBusinessAnalysis] = useState<any>(null);
  const llmTableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle hash-based authentication tokens from magic link
  useEffect(() => {
    const handleHashAuth = async () => {
      if (typeof window === "undefined") return;

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const tokenType = hashParams.get("token_type");
      const type = hashParams.get("type");

      console.log("🔍 [HERO] Hash auth detection:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        tokenType,
        type,
        fullHash: window.location.hash,
      });

      if (accessToken && refreshToken && type === "magiclink") {
        console.log("🔍 [HERO] Magic link tokens found, establishing session");

        try {
          // Set the session using the tokens from the hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          console.log("🔍 [HERO] Session establishment result:", {
            hasSession: !!data.session,
            hasUser: !!data.user,
            error: error?.message,
          });

          if (!error && data.session) {
            // Clear the hash from URL
            window.history.replaceState(null, "", window.location.pathname);

            // Check if there was a redirect parameter in session storage
            const redirectInfo = sessionStorage.getItem("flowql_auth_redirect");
            let redirectPath = "/en/dashboard";

            if (redirectInfo) {
              try {
                const parsed = JSON.parse(redirectInfo);
                redirectPath = parsed.redirect || "/en/dashboard";
                sessionStorage.removeItem("flowql_auth_redirect");
              } catch (e) {
                console.log("🔍 [HERO] Could not parse redirect info");
              }
            }

            console.log("🔍 [HERO] Redirecting to:", redirectPath);
            router.push(redirectPath);
          } else {
            console.error("🔍 [HERO] Failed to establish session:", error);
          }
        } catch (err) {
          console.error("🔍 [HERO] Error setting session:", err);
        }
      }
    };

    handleHashAuth();
  }, [router]);

  // Scroll to LLM table when analysis is complete
  useEffect(() => {
    if (result && showLLMSection && llmTableRef.current) {
      setTimeout(() => {
        llmTableRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [result, showLLMSection]);

  const normalizeUrl = (inputUrl: string) => {
    let normalizedUrl = inputUrl.trim();

    // If URL doesn't start with http:// or https://, add https://
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    return normalizedUrl;
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setShowProgressBar(true);
    setShowLLMSection(false);
    setResult(null);

    // Initialize progress steps
    const steps: ProgressStep[] = [
      {
        id: "gathering",
        label: "Gathering business details",
        status: "loading",
      },
      { id: "analyzing", label: "Analyzing business", status: "pending" },
      { id: "contacting", label: "Contacting LLMs", status: "pending" },
      { id: "compiling", label: "Compiling results", status: "pending" },
    ];
    setProgressSteps(steps);

    try {
      const normalizedUrl = normalizeUrl(url);

      // Step 1: Gathering business details
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze website");
      }

      const data = await response.json();

      // Step 1 Complete - Update progress
      setProgressSteps((prev) =>
        prev.map((step) =>
          step.id === "gathering"
            ? { ...step, status: "completed" }
            : step.id === "analyzing"
              ? { ...step, status: "loading" }
              : step
        )
      );

      // Store business analysis data (hidden from UI)
      setBusinessAnalysis(data.businessSummary);

      // Step 2: Analyzing business (brief pause for UX)
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgressSteps((prev) =>
        prev.map((step) =>
          step.id === "analyzing"
            ? { ...step, status: "completed" }
            : step.id === "contacting"
              ? { ...step, status: "loading" }
              : step
        )
      );

      // Step 3: Contacting LLMs
      if (data.businessSummary) {
        const questions = await generateQuestions(
          data.businessSummary,
          normalizedUrl
        );
        const llmResults = await queryLLMs(
          questions,
          data.businessSummary.companyName || "Company",
          normalizedUrl
        );

        setProgressSteps((prev) =>
          prev.map((step) =>
            step.id === "contacting"
              ? { ...step, status: "completed" }
              : step.id === "compiling"
                ? { ...step, status: "loading" }
                : step
          )
        );

        // Step 4: Compiling results
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProgressSteps((prev) =>
          prev.map((step) =>
            step.id === "compiling" ? { ...step, status: "completed" } : step
          )
        );

        // Set final result with LLM data
        setResult({
          ...data,
          url: normalizedUrl,
          llmResults,
        });

        // Hide progress bar and show LLM section
        setTimeout(() => {
          setShowProgressBar(false);
          setShowLLMSection(true);
        }, 1000);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);

      // Update progress steps to show error
      setProgressSteps((prev) =>
        prev.map((step) =>
          step.status === "loading"
            ? { ...step, status: "error", error: errorMessage }
            : step
        )
      );

      setShowProgressBar(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateQuestions = async (
    businessSummary: any,
    url: string
  ): Promise<string[]> => {
    setIsGeneratingQuestions(true);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessSummary }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();

      // Return the generated questions
      return data.questions || [];
    } catch (err) {
      console.error("Error generating questions:", err);
      return [];
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const queryLLMs = async (
    questions: string[],
    companyName: string,
    url: string
  ) => {
    console.log("=== QUERY LLMS FUNCTION CALLED ===");
    console.log("About to call /api/llm/query");
    console.log("====================================");

    try {
      const response = await fetch("/api/llm/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions,
          companyName,
          url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to query LLMs");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error querying LLMs:", error);
      // Return fallback data structure
      return questions.map((question) => ({
        query: question,
        results: [
          { llm: "ChatGPT", result: false, status: "Fail" },
          { llm: "Perplexity", result: false, status: "Fail" },
          { llm: "Claude", result: false, status: "Fail" },
          { llm: "Gemini", result: false, status: "Fail" },
        ],
      }));
    }
  };

  const createDynamicTableData = (questions: string[]) => {
    return questions.map((question) => ({
      query: question,
      results: [
        { llm: "ChatGPT", result: Math.random() > 0.3 },
        { llm: "Perplexity", result: Math.random() > 0.4 },
        { llm: "Claude", result: Math.random() > 0.3 },
        { llm: "Gemini", result: Math.random() > 0.3 },
      ],
    }));
  };

  return (
    <section className="min-h-screen">
      <div className="container flex w-full flex-col items-center justify-center space-y-12 px-4 py-12 sm:space-y-20 sm:py-16 md:py-20 lg:py-24 xl:py-28">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-blue-100 px-4 py-2 transition-colors duration-300 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 sm:mb-5 sm:px-7">
            <AlertCircle className="h-4 w-4 text-blue-700 dark:text-blue-300 sm:h-5 sm:w-5" />
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 sm:text-sm">
              Own the Answer
            </p>
          </div>

          <h1 className="text-balance bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-center font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-transparent drop-shadow-sm duration-300 ease-linear [word-spacing:theme(spacing.1)] dark:bg-gradient-to-br dark:from-gray-100 dark:to-gray-900 sm:text-[40px] md:text-7xl md:leading-[5rem]">
            Rank Higher in AI Search
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-balance px-4 text-center text-base text-muted-foreground sm:mt-6 sm:px-0 md:text-xl">
            Optimize your content to be the top-cited source in ChatGPT, Claude,
            Perplexity, and Gemini. Stop losing traffic to AI-generated answers
          </p>

          <div className="mx-auto mt-6 flex flex-col items-center justify-center space-y-4 sm:mt-8">
            <div className="w-full max-w-3xl px-4 sm:px-0">
              <div className="relative">
                <Input
                  placeholder="Enter your website (e.g., example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isAnalyzing}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="py-4 pr-12 text-base sm:py-6 sm:pr-12 sm:text-lg"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !url.trim()}
                  className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 transform bg-blue-600 p-0 hover:bg-blue-700 sm:h-8 sm:w-8"
                  size="sm"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-3 w-3 animate-spin text-white sm:h-4 sm:w-4" />
                  ) : (
                    <span className="text-base sm:text-lg">✨</span>
                  )}
                </Button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>

        {/* Progress Bar - moved up closer to URL input */}
        {showProgressBar && (
          <div className="-mt-6 w-full max-w-4xl px-4 sm:px-0">
            <ProgressBar steps={progressSteps} />
          </div>
        )}

        {/* LLM Results Table */}
        {showLLMSection && result && (
          <div
            ref={llmTableRef}
            className="w-full max-w-4xl space-y-6 px-4 sm:px-0"
          >
            <LLMComparisonTable
              data={result.llmResults || []}
              domain={new URL(result.url).hostname}
            />
          </div>
        )}

        {/* Remove business analysis card - keeping this comment for reference */}
        {false && result && (
          <div className="w-full max-w-4xl space-y-6 px-4 sm:px-0">
            <Card
              className="animate__animated animate__slideInUp mx-auto w-full max-w-6xl"
              style={{ animationDuration: "4s" }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex flex-col items-start gap-2 text-lg sm:flex-row sm:items-center sm:gap-3 sm:text-xl">
                  <div className="flex items-center gap-2">
                    <img
                      src={result.faviconUrl}
                      alt="Favicon"
                      className="h-5 w-5 rounded-sm sm:h-6 sm:w-6"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span>Business Analysis</span>
                  </div>
                  {result.isContentTruncated && (
                    <Badge variant="outline" className="text-xs">
                      {result.contentAnalysisFlag}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Company Name - Full Width */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground sm:text-base">
                    Company Name
                  </h4>
                  <p className="text-xs font-semibold text-muted-foreground sm:text-sm">
                    {result.businessSummary?.companyName || "Not found"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground sm:text-base">
                      What They Do
                    </h4>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {result.businessSummary?.whatTheyDo || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground sm:text-base">
                      Who They Serve
                    </h4>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {result.businessSummary?.whoTheyServe || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground sm:text-base">
                      City and Country
                    </h4>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {result.businessSummary?.cityAndCountry || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground sm:text-base">
                      Services Offered
                    </h4>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {result.businessSummary?.servicesOffered || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground sm:text-base">
                      Industry
                    </h4>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {result.businessSummary?.industry || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground sm:text-base">
                      Business Type
                    </h4>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {result.businessSummary?.businessType || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <h4 className="text-sm font-medium text-foreground sm:text-base">
                      Pricing
                    </h4>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {result.businessSummary?.pricing || "Not found"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
