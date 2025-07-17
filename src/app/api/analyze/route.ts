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
  console.log("🚀 [PROD DEBUG] API ROUTE STARTED");
  console.log("🚀 [PROD DEBUG] Function entered at:", new Date().toISOString());

  try {
    console.log("🚀 [PROD DEBUG] Parsing request body...");
    const { url } = await request.json();
    console.log("🚀 [PROD DEBUG] Request body parsed successfully");
    console.log("🚀 [PROD DEBUG] URL received:", url);

    if (!url) {
      console.log("🚀 [PROD DEBUG] No URL provided, returning 400");
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    console.log("🚀 [PROD DEBUG] Validating URL format...");
    try {
      new URL(url);
      console.log("🚀 [PROD DEBUG] URL validation passed");
    } catch {
      console.log("🚀 [PROD DEBUG] URL validation failed, returning 400");
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Step 1: Scrape main URL only
    console.log("🚀 [PROD DEBUG] About to start scraping...");
    console.log("=== ANALYZE API CALLED ===");
    console.log("URL:", url);
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Timestamp:", new Date().toISOString());
    console.log("========================");

    console.log("🚀 [PROD DEBUG] Calling WebScraper.scrapeWebsite...");
    console.log("Starting scrape for:", url);

    let scrapedContent;
    try {
      scrapedContent = await WebScraper.scrapeWebsite(url);
      console.log(
        "🚀 [PROD DEBUG] WebScraper.scrapeWebsite completed successfully"
      );
    } catch (scrapeError) {
      console.log("🚀 [PROD DEBUG] WebScraper.scrapeWebsite FAILED:");
      console.error("🚀 [PROD DEBUG] Scrape error:", scrapeError);
      console.error(
        "🚀 [PROD DEBUG] Scrape error message:",
        scrapeError instanceof Error ? scrapeError.message : String(scrapeError)
      );
      console.error(
        "🚀 [PROD DEBUG] Scrape error stack:",
        scrapeError instanceof Error ? scrapeError.stack : "No stack trace"
      );
      throw scrapeError;
    }

    console.log("🚀 [PROD DEBUG] Scraping completed, processing results...");
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
    console.log("🚀 [PROD DEBUG] About to create OpenAI summary...");
    console.log("=== CREATING OPENAI SUMMARY ===");
    console.log(
      "Content length being sent to OpenAI:",
      scrapedContent.content.length
    );
    console.log("OpenAI API Key available:", !!process.env.OPENAI_API_KEY);
    console.log("===============================");

    let openAISummary;
    try {
      openAISummary = await createBusinessSummary(scrapedContent.content);
      console.log("🚀 [PROD DEBUG] OpenAI summary created successfully");
    } catch (openaiError) {
      console.log("🚀 [PROD DEBUG] OpenAI summary creation FAILED:");
      console.error("🚀 [PROD DEBUG] OpenAI error:", openaiError);
      console.error(
        "🚀 [PROD DEBUG] OpenAI error message:",
        openaiError instanceof Error ? openaiError.message : String(openaiError)
      );
      // Don't throw, let it use the fallback values
      openAISummary = {
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

    console.log("=== OPENAI SUMMARY RESULT ===");
    console.log("Company Name:", openAISummary.companyName);
    console.log("Industry:", openAISummary.industry);
    console.log("What They Do:", openAISummary.whatTheyDo);
    console.log("Who They Serve:", openAISummary.whoTheyServe);
    console.log("=============================");

    // Generate favicon URL
    console.log("🚀 [PROD DEBUG] Generating favicon URL...");
    const urlObj = new URL(url);
    const faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;

    // Return results
    console.log("🚀 [PROD DEBUG] Preparing final response...");
    const response = {
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
    };

    console.log("🚀 [PROD DEBUG] Final response prepared, returning...");
    console.log(
      "🚀 [PROD DEBUG] Response size:",
      JSON.stringify(response).length
    );
    return NextResponse.json(response);
  } catch (error) {
    console.log("🚀 [PROD DEBUG] MAIN CATCH BLOCK REACHED:");
    console.error("🚀 [PROD DEBUG] Analysis error:", error);
    console.error(
      "🚀 [PROD DEBUG] Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "🚀 [PROD DEBUG] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        error: "Failed to analyze website",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
