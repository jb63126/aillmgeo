import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Test endpoint to verify function accessibility and environment variables
export async function GET() {
  return NextResponse.json({
    endpoint: "Gemini",
    accessible: true,
    environment: process.env.NODE_ENV,
    apiKeyAvailable: !!process.env.GOOGLE_API_KEY,
    apiKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
    apiKeyPrefix: process.env.GOOGLE_API_KEY?.substring(0, 10) || "none",
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
      "🔑 [GEMINI DEBUG] API Key available:",
      !!process.env.GOOGLE_API_KEY
    );
    console.log(
      "🔑 [GEMINI DEBUG] API Key length:",
      process.env.GOOGLE_API_KEY?.length || 0
    );
    console.log(
      "🔑 [GEMINI DEBUG] API Key starts with:",
      process.env.GOOGLE_API_KEY?.substring(0, 10) + "..."
    );

    if (!question || !companyName) {
      return NextResponse.json(
        { error: "Question and company name are required" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error(
        "🔑 [GEMINI DEBUG] GOOGLE_API_KEY environment variable is missing!"
      );
      return NextResponse.json({
        success: false,
        error: "Gemini API key not configured",
        containsCompany: false,
        llm: "Gemini",
        status: "Fail",
      });
    }

    console.log("🔑 [GEMINI DEBUG] About to call Gemini API...");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(question);
    const response = await result.response;
    console.log("🔑 [GEMINI DEBUG] Gemini API call successful");
    const llmResponse = response.text();

    // Check if company name appears in the response (case sensitive)
    const containsCompany = llmResponse.includes(companyName);

    // Log only responses that contain the company name
    if (containsCompany) {
      console.log("=== LLM RESPONSE ANALYSIS ===");
      console.log("LLM: Gemini");
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
      llm: "Gemini",
    });
  } catch (error) {
    console.error("🔑 [GEMINI DEBUG] Gemini API error:", error);
    console.error(
      "🔑 [GEMINI DEBUG] Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("🔑 [GEMINI DEBUG] Error details:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to query Gemini",
      containsCompany: false,
      llm: "Gemini",
      status: "Fail",
    });
  }
}
