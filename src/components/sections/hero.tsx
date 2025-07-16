"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import LLMComparisonTable from "~/components/ui/llm-comparison-table";
import { websiteAnalysisQueries } from "~/data/llm-comparison-data";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [showLLMSection, setShowLLMSection] = useState(false);
  const businessAnalysisRef = useRef<HTMLDivElement>(null);

  // Scroll to business analysis when result appears, then show LLM section after scroll
  useEffect(() => {
    if (result && businessAnalysisRef.current) {
      // Reset LLM section visibility
      setShowLLMSection(false);

      setTimeout(() => {
        businessAnalysisRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Show LLM section 3 seconds after scroll completes
        setTimeout(() => {
          setShowLLMSection(true);
        }, 3000);
      }, 100);
    }
  }, [result]);

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

    try {
      const normalizedUrl = normalizeUrl(url);

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

      // Log the extracted data to console
      console.log("=== SCRAPED DATA ===");
      console.log("Raw Content Length:", data.rawContent?.length || 0);
      console.log("Business Summary:", data.businessSummary);
      console.log("What They Do:", data.businessSummary?.whatTheyDo);
      console.log("Who They Serve:", data.businessSummary?.whoTheyServe);
      console.log("Industry:", data.businessSummary?.industry);
      console.log("Location:", data.businessSummary?.location);
      console.log("===================");

      // Add the normalized URL to the result for caching
      setResult({
        ...data,
        url: normalizedUrl,
      });

      // Automatically generate questions after business analysis completes
      if (data.businessSummary) {
        generateQuestions(data.businessSummary, normalizedUrl);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateQuestions = async (businessSummary: any, url: string) => {
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

      // Update result state with generated questions
      setResult((prev: any) => ({
        ...prev,
        generatedQuestions: data.questions,
      }));

      // Query LLMs with the generated questions
      if (data.questions && businessSummary.companyName && url) {
        console.log("=== TRIGGERING LLM QUERIES ===");
        console.log("Questions generated:", data.questions);
        console.log("Company name:", businessSummary.companyName);
        console.log("URL:", url);
        console.log("=============================");

        const llmResults = await queryLLMs(
          data.questions,
          businessSummary.companyName,
          url
        );

        console.log("=== LLM RESULTS RECEIVED ===");
        console.log("Results:", llmResults);
        console.log("===========================");

        // Update result with real LLM data
        setResult((prev: any) => ({
          ...prev,
          llmResults: llmResults,
        }));
      } else {
        console.log("=== LLM QUERY SKIPPED ===");
        console.log("Has questions:", !!data.questions);
        console.log("Has company name:", !!businessSummary.companyName);
        console.log("Has URL:", !!url);
        console.log("========================");
      }
    } catch (err) {
      console.error("Error generating questions:", err);
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
            Optimize your content to be the top-cited source in ChatGPT,
            Perplexity, and Google SGE. Stop losing traffic to AI-generated
            answers
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

        {result && (
          <div
            ref={businessAnalysisRef}
            className="w-full max-w-4xl space-y-6 px-4 sm:px-0"
          >
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

        {/* LLM Comparison Table Section */}
        {result && showLLMSection && (
          <div
            className="animate__animated animate__slideInUp w-full max-w-6xl space-y-6 px-4 sm:px-0"
            style={{ animationDuration: "4s" }}
          >
            <div className="space-y-4 pt-8 text-center sm:pt-16">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                LLM Performance Analysis
              </h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
                See how different AI models perform on website analysis tasks.
                This comparison helps you understand which AI provides the most
                reliable results.
              </p>
            </div>

            {isGeneratingQuestions ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-lg">
                    Generating search questions...
                  </span>
                </div>
              </div>
            ) : (
              <LLMComparisonTable
                data={
                  result.llmResults
                    ? result.llmResults
                    : result.generatedQuestions
                      ? createDynamicTableData(result.generatedQuestions)
                      : websiteAnalysisQueries
                }
                title="Website Analysis Performance"
                className="mt-8"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
