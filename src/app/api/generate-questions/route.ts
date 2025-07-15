import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSearchQuestions(businessSummary: any) {
  try {
    const summaryText = `
      What they do: ${businessSummary.whatTheyDo}
      Who they serve: ${businessSummary.whoTheyServe}
      Location: ${businessSummary.cityAndCountry}
      Services: ${businessSummary.servicesOffered}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Based on this business summary ${summaryText}, generate five specific google search phrases that a potential customer might use to find similar businesses in the same industry. Focus on the type of service/business rather than this specific company. Return ONLY a JSON array of strings, no other text.

Example format:
["search phrase 1", "search phrase 2", "search phrase 3", "search phrase 4", "search phrase 5"]`,
        },
        {
          role: "user",
          content: `Generate 5 search phrases for similar businesses in this industry: ${summaryText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Parse the JSON response
    const questions = JSON.parse(content);
    return questions;
  } catch (error) {
    console.error("Error generating search questions:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { businessSummary } = await request.json();

    if (!businessSummary) {
      return NextResponse.json(
        { error: "Business summary is required" },
        { status: 400 }
      );
    }

    const questions = await generateSearchQuestions(businessSummary);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
