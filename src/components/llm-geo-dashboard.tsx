"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Loader2,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface AnalysisResult {
  success: boolean;
  websiteId: number;
  url: string;
  scrapedContent: {
    title: string;
    description: string;
    wordCount: number;
    readingTime: number;
  };
  analysis: {
    sentiment: string;
    topics: string[];
    keyPhrases: string[];
    complexity: string;
    seoMetrics: {
      hasTitle: boolean;
      hasDescription: boolean;
      titleLength: number;
      descriptionLength: number;
    };
  };
  llmResults: Array<{
    model: string;
    query: string;
    response: string;
    responseTime: number;
    verification: {
      isAccurate: boolean;
      confidence: number;
      notes: string;
    };
  }>;
  pageSpeedResult?: {
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    seoScore: number;
  };
  queries: string[];
}

export default function LLMGeoDashboard() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getAccuracyIcon = (isAccurate: boolean) => {
    return isAccurate ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section>
        <div className="container flex w-full flex-col items-center justify-center space-y-20 py-16 md:py-20 lg:py-24 xl:py-28">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mx-auto mb-5 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-blue-100 px-7 py-2 transition-colors duration-300 hover:bg-blue-200">
              <AlertCircle className="h-5 w-5 text-blue-700" />
              <p className="text-sm font-semibold text-blue-700">
                Rank Higher in AI Search
              </p>
            </div>
            <h1 className="text-balance bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-center font-heading text-[40px] font-bold leading-tight tracking-[-0.02em] text-transparent drop-shadow-sm duration-300 ease-linear [word-spacing:theme(spacing.1)] md:text-7xl md:leading-[5rem]">
              SEO for the AI Era
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-balance text-center text-muted-foreground md:text-xl">
              Optimize your content to be the top-cited source in ChatGPT,
              Perplexity, and Google SGE. Stop losing traffic to AI-generated
              answers
            </p>
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <div className="container mx-auto space-y-6 px-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Run a Free AI Audit</CardTitle>
            <CardDescription>
              Enter your website URL to see how AI models understand and cite
              your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://your-website.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isAnalyzing}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Audit...
                  </>
                ) : (
                  "Run Free AI Audit"
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            {/* Website Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Website Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">
                    {result.scrapedContent.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.scrapedContent.description}
                  </p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {result.url}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {result.scrapedContent.wordCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {result.scrapedContent.readingTime}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Min Read
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge
                      variant={
                        result.analysis.sentiment === "positive"
                          ? "default"
                          : result.analysis.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {result.analysis.sentiment}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Sentiment
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">
                      {result.analysis.complexity}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Complexity
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="llm-tests" className="space-y-4">
              <TabsList>
                <TabsTrigger value="llm-tests">
                  AI Citation Analysis
                </TabsTrigger>
                <TabsTrigger value="content-analysis">
                  Content Optimization
                </TabsTrigger>
                {result.pageSpeedResult && (
                  <TabsTrigger value="performance">Technical SEO</TabsTrigger>
                )}
              </TabsList>

              {/* LLM Tests Tab */}
              <TabsContent value="llm-tests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Citation Analysis</CardTitle>
                    <CardDescription>
                      How ChatGPT and Claude interpret and respond to questions
                      about your content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {result.queries.map((query, queryIndex) => {
                        const openaiResult = result.llmResults.find(
                          (r, i) =>
                            i % 2 === 0 && Math.floor(i / 2) === queryIndex
                        );
                        const anthropicResult = result.llmResults.find(
                          (r, i) =>
                            i % 2 === 1 && Math.floor(i / 2) === queryIndex
                        );

                        return (
                          <div
                            key={queryIndex}
                            className="space-y-4 rounded-lg border p-4"
                          >
                            <div className="font-medium">
                              Query {queryIndex + 1}: {query}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              {/* OpenAI Result */}
                              {openaiResult && (
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center justify-between text-sm">
                                      <span>OpenAI (GPT-3.5)</span>
                                      <div className="flex items-center gap-2">
                                        {getAccuracyIcon(
                                          openaiResult.verification.isAccurate
                                        )}
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {openaiResult.verification.confidence}
                                          % confidence
                                        </Badge>
                                      </div>
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <p className="text-sm">
                                      {openaiResult.response}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {openaiResult.responseTime}ms
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {openaiResult.verification.notes}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Anthropic Result */}
                              {anthropicResult && (
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center justify-between text-sm">
                                      <span>Anthropic (Claude)</span>
                                      <div className="flex items-center gap-2">
                                        {getAccuracyIcon(
                                          anthropicResult.verification
                                            .isAccurate
                                        )}
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {
                                            anthropicResult.verification
                                              .confidence
                                          }
                                          % confidence
                                        </Badge>
                                      </div>
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <p className="text-sm">
                                      {anthropicResult.response}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {anthropicResult.responseTime}ms
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {anthropicResult.verification.notes}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Analysis Tab */}
              <TabsContent value="content-analysis" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Optimized Keywords</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium">Main Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis.topics.map((topic, index) => (
                            <Badge key={index} variant="secondary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 font-medium">Key Phrases</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis.keyPhrases
                            .slice(0, 8)
                            .map((phrase, index) => (
                              <Badge key={index} variant="outline">
                                {phrase}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI Search Readiness</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Title Present</span>
                          {result.analysis.seoMetrics.hasTitle ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span>Description Present</span>
                          {result.analysis.seoMetrics.hasDescription ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span>Title Length</span>
                          <span
                            className={
                              result.analysis.seoMetrics.titleLength > 60
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {result.analysis.seoMetrics.titleLength} chars
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Description Length</span>
                          <span
                            className={
                              result.analysis.seoMetrics.descriptionLength > 160
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {result.analysis.seoMetrics.descriptionLength} chars
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              {result.pageSpeedResult && (
                <TabsContent value="performance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Technical SEO Audit</CardTitle>
                      <CardDescription>
                        Core Web Vitals and technical factors that impact AI
                        crawling
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                          {
                            label: "Performance",
                            score: result.pageSpeedResult.performanceScore,
                          },
                          {
                            label: "Accessibility",
                            score: result.pageSpeedResult.accessibilityScore,
                          },
                          {
                            label: "Best Practices",
                            score: result.pageSpeedResult.bestPracticesScore,
                          },
                          {
                            label: "SEO",
                            score: result.pageSpeedResult.seoScore,
                          },
                        ].map((metric) => (
                          <div
                            key={metric.label}
                            className="space-y-2 text-center"
                          >
                            <div
                              className={`text-2xl font-bold ${getScoreColor(metric.score)}`}
                            >
                              {metric.score}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {metric.label}
                            </div>
                            <Progress value={metric.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
