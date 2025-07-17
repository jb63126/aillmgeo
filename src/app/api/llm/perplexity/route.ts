import { NextRequest, NextResponse } from "next/server";

// Test endpoint to verify function accessibility and environment variables
export async function GET() {
  return NextResponse.json({
    endpoint: "Perplexity",
    accessible: true,
    environment: process.env.NODE_ENV,
    apiKeyAvailable: !!process.env.PERPLEXITY_API_KEY,
    apiKeyLength: process.env.PERPLEXITY_API_KEY?.length || 0,
    apiKeyPrefix: process.env.PERPLEXITY_API_KEY?.substring(0, 10) || "none",
    allEnvVars: Object.keys(process.env).filter((key) =>
      key.includes("API_KEY")
    ),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { question, companyName } = await request.json();

    console.log(
      "🔑 [PERPLEXITY DEBUG] API Key available:",
      !!process.env.PERPLEXITY_API_KEY
    );
    console.log(
      "🔑 [PERPLEXITY DEBUG] API Key length:",
      process.env.PERPLEXITY_API_KEY?.length || 0
    );
    console.log(
      "🔑 [PERPLEXITY DEBUG] API Key starts with:",
      process.env.PERPLEXITY_API_KEY?.substring(0, 10) + "..."
    );

    if (!question || !companyName) {
      return NextResponse.json(
        { error: "Question and company name are required" },
        { status: 400 }
      );
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      console.error(
        "🔑 [PERPLEXITY DEBUG] PERPLEXITY_API_KEY environment variable is missing!"
      );
      return NextResponse.json({
        success: false,
        error: "Perplexity API key not configured",
        containsCompany: false,
        llm: "Perplexity",
        status: "Fail",
      });
    }

    console.log("🔑 [PERPLEXITY DEBUG] About to call Perplexity API...");
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error(
        "🔑 [PERPLEXITY DEBUG] Perplexity API HTTP error:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.error(
        "🔑 [PERPLEXITY DEBUG] Perplexity API error response:",
        errorText
      );
      throw new Error(
        `Perplexity API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("🔑 [PERPLEXITY DEBUG] Perplexity API call successful");
    console.log(
      "🔑 [PERPLEXITY DEBUG] Perplexity API response keys:",
      Object.keys(data)
    );
    const llmResponse = data.choices?.[0]?.message?.content || "";

    // Check if company name appears in the response (case sensitive)
    const containsCompany = llmResponse.includes(companyName);

    // Log only responses that contain the company name
    if (containsCompany) {
      console.log("=== LLM RESPONSE ANALYSIS ===");
      console.log("LLM: Perplexity");
      console.log(`Question: "${question}"`);
      console.log(`Company Name: "${companyName}"`);
      console.log(`Response: "${llmResponse}"`);
      console.log(`Contains Company: ${containsCompany}`);
      console.log("============================");
    }

    return NextResponse.json({
      success: true,
      response: llmResponse,
      containsCompany,
      llm: "Perplexity",
    });
  } catch (error) {
    console.error("🔑 [PERPLEXITY DEBUG] Perplexity API error:", error);
    console.error(
      "🔑 [PERPLEXITY DEBUG] Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("🔑 [PERPLEXITY DEBUG] Error details:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to query Perplexity",
      containsCompany: false,
      llm: "Perplexity",
      status: "Fail",
    });
  }
}
