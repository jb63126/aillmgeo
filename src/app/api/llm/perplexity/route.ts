import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question, companyName } = await request.json();

    if (!question || !companyName) {
      return NextResponse.json(
        { error: "Question and company name are required" },
        { status: 400 }
      );
    }

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
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
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
    console.error("Perplexity API error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to query Perplexity",
      containsCompany: false,
      llm: "Perplexity",
      status: "Fail",
    });
  }
}
