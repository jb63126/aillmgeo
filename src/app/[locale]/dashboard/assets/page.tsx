"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Package,
  Search,
  Download,
  Trash2,
  Eye,
  Calendar,
  Globe,
} from "lucide-react";

interface StoredAnalysis {
  id: string;
  domain: string;
  timestamp: number;
  questionCount: number;
  url: string;
}

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [storedAnalyses, setStoredAnalyses] = useState<StoredAnalysis[]>([]);

  useEffect(() => {
    // Load stored analyses from localStorage
    const loadStoredAnalyses = () => {
      if (typeof window !== "undefined") {
        const keys = Object.keys(localStorage);
        const analysisKeys = keys.filter(
          (key) =>
            key.startsWith("flowql_analysis_") ||
            key.startsWith("flowql_search_")
        );

        const analyses: StoredAnalysis[] = [];

        analysisKeys.forEach((key) => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "");
            if (data.url || data.domain) {
              const id = key
                .replace("flowql_analysis_", "")
                .replace("flowql_search_", "");
              analyses.push({
                id: key,
                domain:
                  data.domain ||
                  (data.url ? new URL(data.url).hostname : "Unknown"),
                timestamp: data.timestamp || Date.now(),
                questionCount:
                  data.data?.length || data.llmResults?.length || 0,
                url: data.url || "",
              });
            }
          } catch (error) {
            console.error("Error parsing stored analysis:", error);
          }
        });

        // Sort by timestamp, newest first
        analyses.sort((a, b) => b.timestamp - a.timestamp);
        setStoredAnalyses(analyses);
      }
    };

    loadStoredAnalyses();
  }, []);

  const filteredAnalyses = storedAnalyses.filter(
    (analysis) =>
      analysis.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewAnalysis = (analysis: StoredAnalysis) => {
    if (analysis.id.includes("flowql_search_")) {
      const searchId = analysis.id.replace("flowql_search_", "");
      window.location.href = `/en/dashboard/analysis-lab?search=${searchId}&domain=${analysis.domain}`;
    } else {
      // For legacy analysis data, redirect to home page with the URL
      window.location.href = `/?url=${encodeURIComponent(analysis.url)}`;
    }
  };

  const handleDeleteAnalysis = (analysisId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this analysis? This action cannot be undone."
      )
    ) {
      localStorage.removeItem(analysisId);
      setStoredAnalyses((prev) => prev.filter((a) => a.id !== analysisId));
    }
  };

  const handleExportAll = () => {
    const csvContent = [
      ["Domain", "URL", "Questions", "Date"].join(","),
      ...filteredAnalyses.map((analysis) =>
        [
          `"${analysis.domain}"`,
          `"${analysis.url}"`,
          analysis.questionCount,
          new Date(analysis.timestamp).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowql-assets.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (
      confirm(
        "Are you sure you want to clear all stored analyses? This action cannot be undone."
      )
    ) {
      storedAnalyses.forEach((analysis) => {
        localStorage.removeItem(analysis.id);
      });
      setStoredAnalyses([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your stored analyses, questions, and research data
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by domain or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            disabled={filteredAnalyses.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllData}
            disabled={storedAnalyses.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storedAnalyses.length}</div>
            <p className="text-xs text-muted-foreground">Stored locally</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storedAnalyses.reduce((sum, a) => sum + a.questionCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all analyses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Domains
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(storedAnalyses.map((a) => a.domain)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different websites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(JSON.stringify(storedAnalyses).length / 1024)}KB
            </div>
            <p className="text-xs text-muted-foreground">Local storage</p>
          </CardContent>
        </Card>
      </div>

      {/* Stored Analyses List */}
      <Card>
        <CardHeader>
          <CardTitle>Stored Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAnalyses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {storedAnalyses.length === 0 ? (
                <>
                  <Package className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4 text-sm">No analyses stored yet</p>
                  <p className="text-xs">
                    Run your first analysis to see data here
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => (window.location.href = "/")}
                  >
                    Start Analysis
                  </Button>
                </>
              ) : (
                <>
                  <Search className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4 text-sm">No analyses match your search</p>
                  <p className="text-xs">Try a different search term</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{analysis.domain}</h3>
                      <Badge variant="secondary">
                        {analysis.questionCount} questions
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(analysis.timestamp).toLocaleDateString()}
                      </div>
                      {analysis.url && (
                        <div className="max-w-md truncate">{analysis.url}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAnalysis(analysis)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAnalysis(analysis.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Local Storage</h4>
              <p className="text-sm text-muted-foreground">
                Your analysis data is stored locally in your browser. This data
                will persist across sessions but may be lost if you clear your
                browser data.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Export Options</h4>
              <p className="text-sm text-muted-foreground">
                Export your data to CSV format to back up your analyses or
                import them into other tools.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Cloud Sync (Coming Soon)</h4>
              <p className="text-sm text-muted-foreground">
                Sync your data across devices and ensure it&apos;s never lost
                with our upcoming cloud storage feature.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
