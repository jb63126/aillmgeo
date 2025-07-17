import { NextRequest, NextResponse } from "next/server";
import { WebScraper } from "~/lib/scraper";
import OpenAI from "openai";

async function createBusinessSummary(content: string) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert business analyst with deep knowledge of industry classifications and business models. Analyze website content to extract comprehensive business intelligence.

Extract information and return ONLY a valid JSON object with this exact structure:

{
  "companyName": "Exact company name as it appears",
  "whatTheyDo": "Clear, benefit-focused description of their main value proposition",
  "whoTheyServe": "Specific target audience with demographics/psychographics when available",
  "cityAndCountry": "Primary business location in format 'City, Country'",
  "servicesOffered": "Comma-separated list of main services/products",
  "pricing": "Specific pricing info, ranges, or pricing model (subscription, one-time, custom, etc.)",
  "businessType": "local|national|international|online|hybrid",
  "industry": "Primary industry using standard classifications (e.g., 'Healthcare', 'Financial Services', 'E-commerce')",
  "businessModel": "B2B|B2C|B2B2C|marketplace|subscription|freemium|other",
  "companySize": "startup|small|medium|large|enterprise",
  "keyDifferentiators": "Unique selling propositions or competitive advantages",
  "serviceArea": "Geographic service area if applicable",
  "foundedYear": "Year founded if mentioned",
  "socialProof": "Notable clients, testimonials, awards, or credibility indicators"
}

Analysis guidelines:
- Infer business model from context clues (payment terms, customer types, etc.)
- Determine company size from team size, client base, or revenue indicators
- Look for implied pricing in case studies or service descriptions
- Extract competitive advantages from marketing copy
- Use "Not found" only when information is completely absent

Be thorough - look for subtle indicators and context clues throughout the content.`,
        },
        {
          role: "user",
          content: `Analyze this website content and extract comprehensive business intelligence:\n\n${content.substring(0, 10000)}`,
        },
      ],
      temperature: 0.3,
    });

    const result = response.choices[0]?.message?.content;
    return JSON.parse(
      result ||
        '{"companyName": "Not found", "whatTheyDo": "Not found", "whoTheyServe": "Not found", "cityAndCountry": "Not found", "servicesOffered": "Not found", "pricing": "Not found", "businessType": "Not found", "industry": "Not found", "businessModel": "Not found", "companySize": "Not found", "keyDifferentiators": "Not found", "serviceArea": "Not found", "foundedYear": "Not found", "socialProof": "Not found"}'
    );
  } catch (error) {
    console.error("OpenAI summary error:", error);
    return {
      companyName: "Not found",
      whatTheyDo: "Not found",
      whoTheyServe: "Not found",
      cityAndCountry: "Not found",
      servicesOffered: "Not found",
      pricing: "Not found",
      businessType: "Not found",
      industry: "Not found",
      businessModel: "Not found",
      companySize: "Not found",
      keyDifferentiators: "Not found",
      serviceArea: "Not found",
      foundedYear: "Not found",
      socialProof: "Not found",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Step 1: Scrape main URL only
    console.log("=== ANALYZE API CALLED ===");
    console.log("URL:", url);
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Timestamp:", new Date().toISOString());
    console.log("========================");

    console.log("Starting scrape for:", url);
    const scrapedContent = await WebScraper.scrapeWebsite(url);

    console.log("=== SCRAPE COMPLETED ===");
    console.log("Title:", scrapedContent.title);
    console.log("Description:", scrapedContent.description);
    console.log("Content length:", scrapedContent.content.length);
    console.log(
      "Content preview:",
      scrapedContent.content.substring(0, 200) + "..."
    );
    console.log("=======================");

    // Check if content was truncated
    const contentLength = scrapedContent.content.length;
    const isContentTruncated = contentLength >= 10000;

    // Step 2: Create OpenAI summary
    console.log("=== CREATING OPENAI SUMMARY ===");
    console.log(
      "Content length being sent to OpenAI:",
      scrapedContent.content.length
    );
    console.log("OpenAI API Key available:", !!process.env.OPENAI_API_KEY);
    console.log("===============================");

    const openAISummary = await createBusinessSummary(scrapedContent.content);

    console.log("=== OPENAI SUMMARY RESULT ===");
    console.log("Company Name:", openAISummary.companyName);
    console.log("Industry:", openAISummary.industry);
    console.log("What They Do:", openAISummary.whatTheyDo);
    console.log("Who They Serve:", openAISummary.whoTheyServe);
    console.log("=============================");

    // Generate favicon URL
    const urlObj = new URL(url);
    const faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;

    // Return results
    return NextResponse.json({
      success: true,
      url,
      faviconUrl,
      scrapedContent: {
        title: scrapedContent.title,
        description: scrapedContent.description,
        wordCount: scrapedContent.content.split(" ").length,
        readingTime: Math.ceil(scrapedContent.content.split(" ").length / 200),
      },
      businessSummary: openAISummary,
      rawContent: scrapedContent.content,
      isContentTruncated,
      contentAnalysisFlag: isContentTruncated
        ? "entire website not analyzed"
        : "complete analysis",
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze website",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
