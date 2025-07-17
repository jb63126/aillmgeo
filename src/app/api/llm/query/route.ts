import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache
const cache = new Map<string, any>();

const LLM_ENDPOINTS = [
  { name: "ChatGPT", endpoint: "/api/llm/openai" },
  { name: "Claude", endpoint: "/api/llm/claude" },
  { name: "Gemini", endpoint: "/api/llm/gemini" },
  { name: "Perplexity", endpoint: "/api/llm/perplexity" },
];

export async function POST(request: NextRequest) {
  try {
    // TEMPORARILY CLEAR CACHE FOR TESTING
    cache.clear();

    const { questions, companyName, url } = await request.json();

    console.log("=== LLM QUERY INITIATED ===");
    console.log("URL:", url);
    console.log("Company Name:", companyName);
    console.log("Questions:", questions);
    console.log("==========================");

    if (!questions || !companyName || !url) {
      return NextResponse.json(
        { error: "Questions, company name, and URL are required" },
        { status: 400 }
      );
    }

    // Get the base URL for internal API calls
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000";

    console.log("🚀 [LLM DEBUG] Base URL for internal calls:", baseUrl);

    // Create cache key based on URL
    const cacheKey = `llm-results-${url}`;

    // TEMPORARILY DISABLED FOR TESTING - Check cache first
    // if (cache.has(cacheKey)) {
    //   console.log("Returning cached LLM results for:", url);
    //   return NextResponse.json({
    //     success: true,
    //     data: cache.get(cacheKey),
    //     cached: true,
    //   });
    // }

    const results = [];

    // Process each question
    for (const question of questions) {
      const questionResults = [];

      // Query all LLMs in parallel for this question
      const llmPromises = LLM_ENDPOINTS.map(async (llm) => {
        try {
          console.log(
            `🚀 [LLM DEBUG] Calling ${llm.name} at: ${baseUrl}${llm.endpoint}`
          );

          const response = await fetch(`${baseUrl}${llm.endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question,
              companyName,
            }),
          });

          if (!response.ok) {
            console.error(
              `🚀 [LLM DEBUG] ${llm.name} HTTP error: ${response.status} ${response.statusText}`
            );
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log(`🚀 [LLM DEBUG] ${llm.name} response:`, data);

          return {
            llm: llm.name,
            result: data.success ? data.containsCompany : false,
            status: data.success ? (data.containsCompany ? "✓" : "✗") : "Fail",
            response: data.response || "",
          };
        } catch (error) {
          console.error(`🚀 [LLM DEBUG] Error querying ${llm.name}:`, error);
          return {
            llm: llm.name,
            result: false,
            status: "Fail",
            response: "",
          };
        }
      });

      const llmResults = await Promise.all(llmPromises);

      results.push({
        query: question,
        results: llmResults,
      });
    }

    // Cache the results
    // TEMPORARILY DISABLED FOR TESTING - cache.set(cacheKey, results);

    // Set cache expiration (optional - clear after 1 hour)
    setTimeout(
      () => {
        cache.delete(cacheKey);
      },
      60 * 60 * 1000
    );

    return NextResponse.json({
      success: true,
      data: results,
      cached: false,
    });
  } catch (error) {
    console.error("LLM query error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to query LLMs",
      },
      { status: 500 }
    );
  }
}
