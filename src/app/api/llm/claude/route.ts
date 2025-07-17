import { NextRequest, NextResponse } from "next/server";

// Test endpoint to verify function accessibility and environment variables
export async function GET() {
  return NextResponse.json({
    endpoint: "Claude",
    accessible: true,
    environment: process.env.NODE_ENV,
    apiKeyAvailable: !!process.env.ANTHROPIC_API_KEY,
    apiKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    apiKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) || "none",
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
      "🔑 [CLAUDE DEBUG] API Key available:",
      !!process.env.ANTHROPIC_API_KEY
    );
    console.log(
      "🔑 [CLAUDE DEBUG] API Key length:",
      process.env.ANTHROPIC_API_KEY?.length || 0
    );
    console.log(
      "🔑 [CLAUDE DEBUG] API Key starts with:",
      process.env.ANTHROPIC_API_KEY?.substring(0, 10) + "..."
    );

    if (!question || !companyName) {
      return NextResponse.json(
        { error: "Question and company name are required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(
        "🔑 [CLAUDE DEBUG] ANTHROPIC_API_KEY environment variable is missing!"
      );
      return NextResponse.json({
        success: false,
        error: "Claude API key not configured",
        containsCompany: false,
        llm: "Claude",
        status: "Fail",
      });
    }

    console.log("🔑 [CLAUDE DEBUG] About to call Claude API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(
        "🔑 [CLAUDE DEBUG] Claude API HTTP error:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.error("🔑 [CLAUDE DEBUG] Claude API error response:", errorText);
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("🔑 [CLAUDE DEBUG] Claude API call successful");
    console.log(
      "🔑 [CLAUDE DEBUG] Claude API response keys:",
      Object.keys(data)
    );
    const llmResponse = data.content?.[0]?.text || "";

    // Check if company name appears in the response (case sensitive)
    const containsCompany = llmResponse.includes(companyName);

    // Log only responses that contain the company name
    if (containsCompany) {
      console.log("=== LLM RESPONSE ANALYSIS ===");
      console.log("LLM: Claude");
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
      llm: "Claude",
    });
  } catch (error) {
    console.error("🔑 [CLAUDE DEBUG] Claude API error:", error);
    console.error(
      "🔑 [CLAUDE DEBUG] Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("🔑 [CLAUDE DEBUG] Error details:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to query Claude",
      containsCompany: false,
      llm: "Claude",
      status: "Fail",
    });
  }
}
