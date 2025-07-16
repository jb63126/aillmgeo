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
          content: `You are a business analyst. Analyze the provided website content and extract key business information. Return ONLY a JSON object with these exact fields:
{
  "companyName": "The exact name of the company",
  "whatTheyDo": "Brief description of what the company/entity does",
  "whoTheyServe": "Description of their target audience/customers",
  "cityAndCountry": "City and country where they are based",
  "servicesOffered": "Any services they offer",
  "pricing": "How much they charge for their services/products"
}

If you cannot determine any field, use "Not found" as the value.`,
        },
        {
          role: "user",
          content: `Analyze this website content and extract business information:\n\n${content.substring(0, 10000)}`,
        },
      ],
      temperature: 0.3,
    });

    const result = response.choices[0]?.message?.content;
    return JSON.parse(
      result ||
        '{"companyName": "Not found", "whatTheyDo": "Not found", "whoTheyServe": "Not found", "cityAndCountry": "Not found", "servicesOffered": "Not found", "pricing": "Not found"}'
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
    console.log("Scraping website:", url);
    const scrapedContent = await WebScraper.scrapeWebsite(url);

    // Check if content was truncated
    const contentLength = scrapedContent.content.length;
    const isContentTruncated = contentLength >= 10000;

    // Step 2: Create OpenAI summary
    console.log("Creating OpenAI summary for business information...");
    const openAISummary = await createBusinessSummary(scrapedContent.content);

    console.log("OpenAI Summary:", openAISummary);

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
