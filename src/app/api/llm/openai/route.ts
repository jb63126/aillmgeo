import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { question, companyName } = await request.json();

    if (!question || !companyName) {
      return NextResponse.json(
        { error: "Question and company name are required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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
    console.error("OpenAI API error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to query OpenAI",
      containsCompany: false,
      llm: "ChatGPT",
      status: "Fail",
    });
  }
}
