"use client";

import { useState } from "react";
import { Check, X, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface LLMResult {
  llm: string;
  result: boolean;
  status?: string;
}

interface QueryResult {
  query: string;
  results: LLMResult[];
}

interface LLMComparisonTableProps {
  data: QueryResult[];
  title?: string;
  className?: string;
  domain?: string;
}

const LLMComparisonTable = ({
  data,
  title = "LLM Performance Comparison",
  className = "",
  domain,
}: LLMComparisonTableProps) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Extract unique LLMs from data
  const llms = data.length > 0 ? data[0].results.map((r) => r.llm) : [];

  const handleExport = () => {
    const csvContent = [
      ["Query", ...llms].join(","),
      ...data.map((item) =>
        [
          `"${item.query}"`,
          ...item.results.map((r) => (r.result ? "✓" : "✗")),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "llm-comparison.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLoginForResults = () => {
    if (typeof window !== "undefined") {
      // Generate unique search ID
      const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store search data in session storage
      sessionStorage.setItem(
        `flowql_search_${searchId}`,
        JSON.stringify({
          data,
          domain,
          timestamp: Date.now(),
        })
      );

      // Navigate to dashboard with search parameters
      const params = new URLSearchParams({
        search: searchId,
        ...(domain && { domain }),
      });

      // Redirect to login page first
      window.location.href = `/en/login?redirect=${encodeURIComponent(`/en/dashboard?${params.toString()}`)}`;
    }
  };

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
        <Check
          className="h-5 w-5 font-bold text-green-500 transition-transform duration-200 hover:scale-110"
          strokeWidth={3}
        />
      ) : (
        <X
          className="h-5 w-5 font-bold text-red-500 transition-transform duration-200 hover:scale-110"
          strokeWidth={3}
        />
      )}
    </div>
  );

  return (
    <Card className={`relative mx-auto w-full max-w-6xl ${className}`}>
      <CardHeader className="flex flex-col space-y-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:pb-6">
        <CardTitle className="text-lg font-semibold sm:text-xl">
          {title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="sticky top-0 z-10 border-b border-border bg-muted/50">
                <th className="w-2/5 min-w-[300px] p-4 text-left text-sm font-semibold tracking-tight">
                  Query
                </th>
                {llms.map((llm) => (
                  <th
                    key={llm}
                    className="w-1/5 p-4 text-center text-sm font-semibold tracking-tight"
                  >
                    {llm}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-border/50 transition-colors duration-200 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"} ${hoveredRow === index ? "bg-muted/40" : ""} hover:bg-muted/40`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="p-4 text-sm font-medium leading-relaxed">
                    {item.query}
                  </td>
                  {item.results.map((result, resultIndex) => (
                    <td key={resultIndex} className="p-4 text-center">
                      <ResultIcon
                        result={result.result}
                        status={result.status}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Desktop Freemium Paywall Overlay */}
        {data.length > 1 && (
          <div className="absolute inset-0 top-[90px] z-20 hidden items-center justify-center md:flex">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
            <div className="relative z-30 rounded-lg border border-border bg-card p-6 shadow-lg">
              <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold">See Full Results</h3>
                <p className="text-sm text-muted-foreground">
                  Login to view all comparison data
                </p>
                <Button onClick={handleLoginForResults}>
                  Login to see full results
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile View */}
        <div className="md:hidden">
          {data.map((item, index) => (
            <div
              key={index}
              className={`space-y-3 border-b border-border/50 p-3 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"} `}
            >
              <div className="text-xs font-medium leading-relaxed text-foreground">
                {item.query}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {item.results.map((result, resultIndex) => (
                  <div
                    key={resultIndex}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div className="text-xs font-medium text-muted-foreground">
                      {result.llm}
                    </div>
                    <ResultIcon result={result.result} status={result.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Mobile Freemium Paywall */}
          {data.length > 1 && (
            <div className="absolute inset-0 top-[50px] z-20 flex items-center justify-center md:hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
              <div className="relative z-30 mx-4 rounded-lg border border-border bg-card p-4 shadow-lg">
                <div className="space-y-3 text-center">
                  <h3 className="text-base font-semibold">See Full Results</h3>
                  <p className="text-xs text-muted-foreground">
                    Login to view all comparison data
                  </p>
                  <Button
                    className="w-full text-sm"
                    onClick={handleLoginForResults}
                  >
                    Login to see full results
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LLMComparisonTable;
