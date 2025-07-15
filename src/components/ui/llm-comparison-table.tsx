"use client";

import { useState } from "react";
import { Check, X, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface LLMResult {
  llm: string;
  result: boolean;
}

interface QueryResult {
  query: string;
  results: LLMResult[];
}

interface LLMComparisonTableProps {
  data: QueryResult[];
  title?: string;
  className?: string;
}

const LLMComparisonTable = ({
  data,
  title = "LLM Performance Comparison",
  className = "",
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

  const ResultIcon = ({ result }: { result: boolean }) => (
    <div className="flex items-center justify-center">
      {result ? (
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
    <Card className={`mx-auto w-full max-w-6xl ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
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
                      <ResultIcon result={result.result} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {data.map((item, index) => (
            <div
              key={index}
              className={`space-y-3 border-b border-border/50 p-4 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"} `}
            >
              <div className="text-sm font-medium leading-relaxed">
                {item.query}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {item.results.map((result, resultIndex) => (
                  <div
                    key={resultIndex}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div className="text-xs font-medium text-muted-foreground">
                      {result.llm}
                    </div>
                    <ResultIcon result={result.result} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LLMComparisonTable;
