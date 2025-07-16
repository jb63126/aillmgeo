import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function sanitizeBusinessContext(businessSummary: any) {
  // Extract company name and common variations to remove from context
  const companyName = businessSummary.companyName || "";
  const companyVariations: string[] = [];

  if (companyName && companyName !== "Not found") {
    // Add the full company name
    companyVariations.push(companyName);

    // Add shortened versions (remove common suffixes)
    const cleanName = companyName
      .replace(
        /\s+(Inc\.?|LLC\.?|Corp\.?|Corporation|Technologies|Tech|Ltd\.?|Limited|Co\.?)$/i,
        ""
      )
      .trim();
    if (cleanName !== companyName) {
      companyVariations.push(cleanName);
    }

    // Add first word if multi-word
    const firstWord = cleanName.split(" ")[0];
    if (firstWord.length > 2) {
      companyVariations.push(firstWord);
    }
  }

  // Function to remove company references from text
  const removeCompanyRefs = (text: string) => {
    if (!text || text === "Not found") return text;

    let cleaned = text;
    companyVariations.forEach((variation) => {
      if (variation && variation.length > 2) {
        // Remove company name with various patterns
        const patterns = [
          new RegExp(`\\b${variation}\\b`, "gi"),
          new RegExp(`\\b${variation}'s\\b`, "gi"),
          new RegExp(`\\bfrom ${variation}\\b`, "gi"),
          new RegExp(`\\bwith ${variation}\\b`, "gi"),
          new RegExp(`\\blike ${variation}\\b`, "gi"),
          new RegExp(`\\bat ${variation}\\b`, "gi"),
        ];

        patterns.forEach((pattern) => {
          cleaned = cleaned.replace(pattern, "").trim();
        });
      }
    });

    // Clean up extra spaces and punctuation
    cleaned = cleaned
      .replace(/\s+/g, " ")
      .replace(/^[,\s]+|[,\s]+$/g, "")
      .trim();

    return cleaned || "Not found";
  };

  return {
    industry: businessSummary.industry || "Not found",
    servicesOffered: removeCompanyRefs(
      businessSummary.servicesOffered || "Not found"
    ),
    whoTheyServe: removeCompanyRefs(
      businessSummary.whoTheyServe || "Not found"
    ),
    businessModel: businessSummary.businessModel || "Not found",
    businessType: businessSummary.businessType || "Not found",
    serviceArea:
      businessSummary.serviceArea ||
      businessSummary.cityAndCountry ||
      "Not found",
    keyDifferentiators: removeCompanyRefs(
      businessSummary.keyDifferentiators || "Not found"
    ),
    pricing: removeCompanyRefs(businessSummary.pricing || "Not found"),
  };
}

async function generateCustomerIntentQuestions(businessSummary: any) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Sanitize business context to remove company names
    const sanitizedContext = sanitizeBusinessContext(businessSummary);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a search behavior expert who understands how people actually search for services online. Generate natural, intent-driven questions that reflect real customer search patterns.

Based on the business context provided, create exactly 3 questions using these criteria:

Question Types to Include:
1. **Problem-focused**: "I need help with..." or "How do I..."
2. **Solution-seeking**: "What's the best way to..." or "Who can help me..."
3. **Comparison/evaluation**: "How much does..." or "What should I look for..."

Intent Matching:
- **Local businesses**: Include location-specific questions
- **B2B services**: Focus on business outcomes and ROI
- **B2C services**: Emphasize personal benefits and convenience
- **Technical services**: Include skill/expertise validation questions

Quality Standards:
- Use natural, conversational language
- Reflect actual search query patterns
- Include pain points and desired outcomes
- Vary question length and structure
- Avoid industry jargon unless commonly searched
- DO NOT include specific company names in questions

Return ONLY a JSON array of 3 strings with no additional text.
Format: ["question 1", "question 2", "question 3"]`,
        },
        {
          role: "user",
          content: `Generate 3 customer-intent questions for this business context:

Business Details:
- Industry: ${sanitizedContext.industry}
- Services: ${sanitizedContext.servicesOffered}
- Target audience: ${sanitizedContext.whoTheyServe}
- Business model: ${sanitizedContext.businessModel}
- Business type: ${sanitizedContext.businessType}
- Service area: ${sanitizedContext.serviceArea}
- Key differentiators: ${sanitizedContext.keyDifferentiators}
- Pricing model: ${sanitizedContext.pricing}

Focus on ${sanitizedContext.businessModel || "general"} search patterns and include location context only if businessType is "local".`,
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
    console.error("Error generating customer intent questions:", error);
    throw error;
  }
}

function generateFallbackQuestions(businessSummary: any): string[] {
  const service = businessSummary.whatTheyDo || "service";
  const location = businessSummary.cityAndCountry || "your area";

  return [
    `Who are the top ${service} providers?`,
    `What are the best ${service} companies near me?`,
    `Which ${service} company should I choose?`,
  ];
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

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured, using fallback questions");
      return NextResponse.json({
        questions: generateFallbackQuestions(businessSummary),
        businessType: { type: "unknown", reasoning: "API unavailable" },
      });
    }

    try {
      // Generate customer intent questions using new approach
      const questions = await generateCustomerIntentQuestions(businessSummary);

      return NextResponse.json({
        questions,
        businessType: {
          type: businessSummary.businessType || "unknown",
          reasoning: "Generated using customer intent patterns",
        },
      });
    } catch (apiError) {
      console.error("OpenAI API Error:", apiError);
      console.log("Falling back to generated questions");

      return NextResponse.json({
        questions: generateFallbackQuestions(businessSummary),
        businessType: { type: "unknown", reasoning: "API error" },
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
