import { NextRequest, NextResponse } from "next/server";
import { WebScraper } from "~/lib/scraper";
import { ContentAnalyzer } from "~/lib/analyzer";
import { LLMIntegrations } from "~/lib/llm-integrations";
import {
  createWebsite,
  updateWebsiteContent,
  insertAnalysis,
  insertLLMTest,
  insertReferenceCheck,
  insertPageSpeedInsights,
} from "~/lib/database";

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

    // Step 1: Scrape multiple pages (home, about, provided URL)
    console.log("Scraping website (multiple pages):", url);
    const multiPageContent = await WebScraper.scrapeMultiplePages(url);
    const { combinedContent } = multiPageContent;

    // Step 2: Save to database (using combined content)
    const website = await createWebsite(
      url,
      combinedContent.title,
      combinedContent.description
    );
    await updateWebsiteContent(website.id, combinedContent.content);

    // Step 3: Analyze combined content
    console.log(
      "Analyzing combined content from",
      multiPageContent.pages.length,
      "pages..."
    );
    // Create a ScrapedContent object for analysis compatibility
    const scrapedForAnalysis = {
      url,
      title: combinedContent.title,
      description: combinedContent.description,
      content: combinedContent.content,
      headings: combinedContent.headings,
      links: combinedContent.allLinks,
      images: combinedContent.allImages,
      metadata: combinedContent.combinedMetadata,
    };
    const analysis = ContentAnalyzer.analyzeContent(scrapedForAnalysis);

    // Save analysis to database
    await insertAnalysis(website.id, "content_analysis", analysis);

    // Step 4: Generate queries for LLM testing
    console.log("Generating test queries...");
    const queries = await LLMIntegrations.generateQueries(
      scrapedForAnalysis,
      analysis
    );

    // Step 5: Test with both OpenAI and Anthropic
    console.log("Testing with LLMs...");
    const llmResults = [];

    for (const testQuery of queries) {
      // Test with OpenAI
      const openaiResult = await LLMIntegrations.testWithOpenAI(
        testQuery,
        scrapedForAnalysis
      );
      const openaiVerification = await LLMIntegrations.verifyResponse(
        testQuery,
        openaiResult.response,
        scrapedForAnalysis.content
      );

      // Save OpenAI result
      const openaiDbResult = await insertLLMTest(
        website.id,
        testQuery,
        openaiResult.model,
        openaiResult.response,
        openaiResult.responseTime
      );

      // Save OpenAI verification
      await insertReferenceCheck(
        openaiDbResult.id,
        "content_analysis",
        openaiVerification.isAccurate,
        openaiVerification.confidence / 100,
        openaiVerification.notes
      );

      llmResults.push({
        ...openaiResult,
        verification: openaiVerification,
      });

      // Test with Anthropic
      const anthropicResult = await LLMIntegrations.testWithAnthropic(
        testQuery,
        scrapedForAnalysis
      );
      const anthropicVerification = await LLMIntegrations.verifyResponse(
        testQuery,
        anthropicResult.response,
        scrapedForAnalysis.content
      );

      // Save Anthropic result
      const anthropicDbResult = await insertLLMTest(
        website.id,
        testQuery,
        anthropicResult.model,
        anthropicResult.response,
        anthropicResult.responseTime
      );

      // Save Anthropic verification
      await insertReferenceCheck(
        anthropicDbResult.id,
        "content_analysis",
        anthropicVerification.isAccurate,
        anthropicVerification.confidence / 100,
        anthropicVerification.notes
      );

      llmResults.push({
        ...anthropicResult,
        verification: anthropicVerification,
      });
    }

    // Step 6: Get PageSpeed insights
    console.log("Getting PageSpeed insights...");
    const pageSpeedResult = await LLMIntegrations.getPageSpeedInsights(url);

    if (pageSpeedResult) {
      await insertPageSpeedInsights(
        website.id,
        pageSpeedResult.performanceScore,
        pageSpeedResult.accessibilityScore,
        pageSpeedResult.bestPracticesScore,
        pageSpeedResult.seoScore,
        pageSpeedResult.metrics
      );
    }

    // Return comprehensive results
    return NextResponse.json({
      success: true,
      websiteId: website.id,
      url,
      scrapedContent: {
        title: combinedContent.title,
        description: combinedContent.description,
        wordCount: analysis.wordCount,
        readingTime: analysis.readingTime,
      },
      multiPageInfo: {
        pagesScraped: multiPageContent.pages.length,
        scrapedUrls: multiPageContent.pages.map((page) => page.url),
      },
      analysis,
      llmResults,
      pageSpeedResult,
      queries,
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
