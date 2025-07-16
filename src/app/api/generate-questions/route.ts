import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

async function classifyBusinessType(businessSummary: any) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const summaryText = `
      Company: ${businessSummary.companyName}
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
          content: `Analyze this business and classify it as one of three types:
          
1. "local" - Small local businesses that serve a specific geographic area (restaurants, plumbers, local retail, medical practices, etc.)
2. "national" - Large companies that operate across multiple regions/states (major brands, franchises, big corporations)
3. "online" - Digital-first businesses that primarily operate online (SaaS, fintech apps, e-commerce platforms, digital services)

Return ONLY a JSON object with this exact format:
{
  "type": "local|national|online",
  "reasoning": "brief explanation"
}`,
        },
        {
          role: "user",
          content: `Classify this business: ${summaryText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI classification");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error classifying business type:", error);
    throw error;
  }
}

async function generateContextualQuestions(
  businessSummary: any,
  businessType: any
) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const summaryText = `
      Company: ${businessSummary.companyName}
      What they do: ${businessSummary.whatTheyDo}
      Who they serve: ${businessSummary.whoTheyServe}
      Location: ${businessSummary.cityAndCountry}
      Services: ${businessSummary.servicesOffered}
      Business Type: ${businessType.type}
    `;

    let promptGuidance = "";
    if (businessType.type === "local") {
      promptGuidance = `Generate questions like "Who is the top [service] company in [city]?" or "What are the best [service] providers near [location]?" Include the city/location when available.`;
    } else if (businessType.type === "online") {
      promptGuidance = `Generate questions like "Who is the top online [service] provider?" or "What are the best digital [service] platforms?" Focus on online/digital aspects.`;
    } else {
      // national
      promptGuidance = `Generate questions like "Who are the top [service] companies?" or "What are the leading [industry] providers?" Focus on national/major players.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Based on this business information, generate exactly 3 human-like questions that someone might ask when looking for similar services. 

${promptGuidance}

Make the questions natural and conversational. Focus on the type of service/industry rather than the specific company.

Return ONLY a JSON array of 3 strings, no other text.
Example format: ["question 1", "question 2", "question 3"]`,
        },
        {
          role: "user",
          content: `Generate 3 contextual questions for this ${businessType.type} business: ${summaryText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI question generation");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating contextual questions:", error);
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

    // Step 1: Classify business type
    const businessType = await classifyBusinessType(businessSummary);

    // Step 2: Generate contextual questions
    const questions = await generateContextualQuestions(
      businessSummary,
      businessType
    );

    return NextResponse.json({ questions, businessType });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
