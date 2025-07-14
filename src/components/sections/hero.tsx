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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Analysis Results for {result.url}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {result.scrapedContent?.wordCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {result.scrapedContent?.readingTime || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Min Read
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary">
                      {result.analysis?.sentiment || "N/A"}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Sentiment
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">
                      {result.analysis?.complexity || "N/A"}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Complexity
                    </div>
                  </div>
                </div>

                {result.analysis?.topics && (
                  <div>
                    <h4 className="mb-2 font-medium">Key Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.topics
                        .slice(0, 5)
                        .map((topic: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
