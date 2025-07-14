"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
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

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="min-h-screen">
      <div className="container flex w-full flex-col items-center justify-center space-y-20 py-16 md:py-20 lg:py-24 xl:py-28">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mx-auto mb-5 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-blue-100 px-7 py-2 transition-colors duration-300 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Own the Answer
            </p>
          </div>

          <h1 className="text-balance bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-center font-heading text-[40px] font-bold leading-tight tracking-[-0.02em] text-transparent drop-shadow-sm duration-300 ease-linear [word-spacing:theme(spacing.1)] dark:bg-gradient-to-br dark:from-gray-100 dark:to-gray-900 md:text-7xl md:leading-[5rem]">
            Rank Higher in AI Search
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-balance text-center text-muted-foreground md:text-xl">
            Optimize your content to be the top-cited source in ChatGPT,
            Perplexity, and Google SGE. Stop losing traffic to AI-generated
            answers
          </p>

          <div className="mx-auto mt-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-full max-w-3xl">
              <div className="relative">
                <Input
                  placeholder="Enter your URL for analysis"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isAnalyzing}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="py-6 pr-12 text-lg"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !url.trim()}
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 transform bg-blue-600 p-0 hover:bg-blue-700"
                  size="sm"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span className="text-lg">✨</span>
                  )}
                </Button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>

        {result && (
          <div className="w-full max-w-4xl space-y-6">
            <Card
              className="border-none shadow-lg"
              style={{
                background: "linear-gradient(145deg, #ffffff, #ffffff)",
                boxShadow: "5px 5px 10px #d1d1d1, -5px -5px 10px #ffffff",
                borderRadius: "12px",
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <img
                    src={result.faviconUrl}
                    alt="Favicon"
                    className="h-6 w-6 rounded-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  Business Analysis
                  {result.isContentTruncated && (
                    <Badge
                      variant="outline"
                      className="ml-2 border-orange-600 text-orange-600"
                    >
                      {result.contentAnalysisFlag}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-600">What They Do</h4>
                    <p className="text-sm text-gray-700">
                      {result.businessSummary?.whatTheyDo || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600">
                      Who They Serve
                    </h4>
                    <p className="text-sm text-gray-700">
                      {result.businessSummary?.whoTheyServe || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-purple-600">
                      City and Country
                    </h4>
                    <p className="text-sm text-gray-700">
                      {result.businessSummary?.cityAndCountry || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-orange-600">
                      Services Offered
                    </h4>
                    <p className="text-sm text-gray-700">
                      {result.businessSummary?.servicesOffered || "Not found"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Pricing</h4>
                    <p className="text-sm text-gray-700">
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
