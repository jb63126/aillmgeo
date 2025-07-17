import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Test endpoint to verify function accessibility and environment variables
export async function GET() {
  return NextResponse.json({
    endpoint: "OpenAI/ChatGPT",
    accessible: true,
    environment: process.env.NODE_ENV,
    apiKeyAvailable: !!process.env.OPENAI_API_KEY,
    apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) || "none",
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
      "🔑 [OPENAI DEBUG] API Key available:",
      !!process.env.OPENAI_API_KEY
    );
    console.log(
      "🔑 [OPENAI DEBUG] API Key length:",
      process.env.OPENAI_API_KEY?.length || 0
    );
    console.log(
      "🔑 [OPENAI DEBUG] API Key starts with:",
      process.env.OPENAI_API_KEY?.substring(0, 10) + "..."
    );

    if (!question || !companyName) {
      return NextResponse.json(
        { error: "Question and company name are required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error(
        "🔑 [OPENAI DEBUG] OPENAI_API_KEY environment variable is missing!"
      );
      return NextResponse.json({
        success: false,
        error: "OpenAI API key not configured",
        containsCompany: false,
        llm: "ChatGPT",
        status: "Fail",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("🔑 [OPENAI DEBUG] About to call OpenAI API...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    console.log("🔑 [OPENAI DEBUG] OpenAI API call successful");

    const llmResponse = response.choices[0]?.message?.content || "";

    // Check if company name appears in the response (case sensitive)
    const containsCompany = llmResponse.includes(companyName);

    // Log only responses that contain the company name
    if (containsCompany) {
      console.log("=== LLM RESPONSE ANALYSIS ===");
      console.log("LLM: ChatGPT");
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
      llm: "ChatGPT",
    });
  } catch (error) {
    console.error("🔑 [OPENAI DEBUG] OpenAI API error:", error);
    console.error(
      "🔑 [OPENAI DEBUG] Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("🔑 [OPENAI DEBUG] Error details:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to query OpenAI",
      containsCompany: false,
      llm: "ChatGPT",
      status: "Fail",
    });
  }
}
