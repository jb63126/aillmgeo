import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import { ScrapedContent } from "./scraper";
import { ContentAnalysis } from "./analyzer";

export interface LLMTestResult {
  model: string;
  query: string;
  response: string;
  responseTime: number;
  accuracy?: number;
  confidence?: number;
}

export interface PageSpeedResult {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
}

export class LLMIntegrations {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  private static anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });

  static async generateQueries(
    content: ScrapedContent,
    analysis: ContentAnalysis
  ): Promise<string[]> {
    const prompt = `Based on the following website content, generate 5 specific, factual questions that can be answered using the content. The questions should test comprehension and factual accuracy.

Website: ${content.url}
Title: ${content.title}
Description: ${content.description}
Topics: ${analysis.topics.join(", ")}
Key Phrases: ${analysis.keyPhrases.join(", ")}

Content preview: ${content.content.substring(0, 1000)}...

Generate 5 questions that:
1. Are specific and factual
2. Can be answered from the content
3. Test different aspects of the content
4. Are clear and unambiguous

Format: Return only the questions, one per line.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const queries =
        response.choices[0]?.message?.content
          ?.split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => line.replace(/^\d+\.\s*/, "").trim()) || [];

      return queries.slice(0, 5);
    } catch (error) {
      console.error("Error generating queries:", error);
      return [
        `What is the main topic of ${content.url}?`,
        `What is the title of this webpage?`,
        `What are the key points discussed in this content?`,
        `Who is the target audience for this content?`,
        `What is the main purpose of this website?`,
      ];
    }
  }

  static async testWithOpenAI(
    query: string,
    content: ScrapedContent
  ): Promise<LLMTestResult> {
    const startTime = Date.now();

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that answers questions based strictly on the provided content. Only use information from the given content. If the answer is not in the content, say "The information is not available in the provided content."`,
          },
          {
            role: "user",
            content: `Content: ${content.content}\n\nQuestion: ${query}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
      });

      const responseTime = Date.now() - startTime;
      const responseText =
        response.choices[0]?.message?.content || "No response generated";

      return {
        model: "gpt-3.5-turbo",
        query,
        response: responseText,
        responseTime,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return {
        model: "gpt-3.5-turbo",
        query,
        response: "Error: Failed to get response from OpenAI",
        responseTime: Date.now() - startTime,
      };
    }
  }

  static async testWithAnthropic(
    query: string,
    content: ScrapedContent
  ): Promise<LLMTestResult> {
    const startTime = Date.now();

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `You are an AI assistant that answers questions based strictly on the provided content. Only use information from the given content. If the answer is not in the content, say "The information is not available in the provided content."

Content: ${content.content}

Question: ${query}`,
          },
        ],
      });

      const responseTime = Date.now() - startTime;
      const responseText =
        response.content[0]?.type === "text"
          ? response.content[0].text
          : "No response generated";

      return {
        model: "claude-3-haiku",
        query,
        response: responseText,
        responseTime,
      };
    } catch (error) {
      console.error("Anthropic API error:", error);
      return {
        model: "claude-3-haiku",
        query,
        response: "Error: Failed to get response from Anthropic",
        responseTime: Date.now() - startTime,
      };
    }
  }

  static async getPageSpeedInsights(
    url: string
  ): Promise<PageSpeedResult | null> {
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      console.warn("PageSpeed API key not configured");
      return null;
    }

    try {
      const response = await axios.get(
        "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
        {
          params: {
            url,
            key: apiKey,
            category: ["performance", "accessibility", "best-practices", "seo"],
            strategy: "desktop",
          },
        }
      );

      const lighthouse = response.data.lighthouseResult;
      const categories = lighthouse.categories;
      const audits = lighthouse.audits;

      return {
        performanceScore: Math.round(categories.performance.score * 100),
        accessibilityScore: Math.round(categories.accessibility.score * 100),
        bestPracticesScore: Math.round(
          categories["best-practices"].score * 100
        ),
        seoScore: Math.round(categories.seo.score * 100),
        metrics: {
          firstContentfulPaint:
            audits["first-contentful-paint"]?.numericValue || 0,
          largestContentfulPaint:
            audits["largest-contentful-paint"]?.numericValue || 0,
          cumulativeLayoutShift:
            audits["cumulative-layout-shift"]?.numericValue || 0,
          speedIndex: audits["speed-index"]?.numericValue || 0,
        },
      };
    } catch (error) {
      console.error("PageSpeed API error:", error);
      return null;
    }
  }

  static calculateAccuracy(response: string, expectedContent: string): number {
    // Simple accuracy calculation based on keyword matching
    const responseWords = response.toLowerCase().split(/\s+/);
    const contentWords = expectedContent.toLowerCase().split(/\s+/);

    let matches = 0;
    responseWords.forEach((word) => {
      if (word.length > 3 && contentWords.includes(word)) {
        matches++;
      }
    });

    return Math.min(100, (matches / Math.max(responseWords.length, 1)) * 100);
  }

  static async verifyResponse(
    query: string,
    response: string,
    originalContent: string
  ): Promise<{
    isAccurate: boolean;
    confidence: number;
    notes: string;
  }> {
    // Simple verification using keyword matching and content relevance
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3);
    const responseWords = response
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3);
    const contentWords = originalContent
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3);

    let relevanceScore = 0;
    queryWords.forEach((word) => {
      if (responseWords.includes(word)) relevanceScore += 2;
      if (contentWords.includes(word)) relevanceScore += 1;
    });

    let accuracyScore = 0;
    responseWords.forEach((word) => {
      if (contentWords.includes(word)) accuracyScore += 1;
    });

    const totalPossibleScore = queryWords.length * 3;
    const confidence = Math.min(
      100,
      (relevanceScore / Math.max(totalPossibleScore, 1)) * 100
    );
    const accuracy = Math.min(
      100,
      (accuracyScore / Math.max(responseWords.length, 1)) * 100
    );

    const isAccurate = confidence > 50 && accuracy > 30;

    let notes = "";
    if (response.includes("not available in the provided content")) {
      notes = "Model correctly identified insufficient information";
    } else if (confidence < 30) {
      notes = "Low relevance to query";
    } else if (accuracy < 20) {
      notes = "Response may contain information not in source";
    } else {
      notes = "Response appears relevant and accurate";
    }

    return {
      isAccurate,
      confidence: Math.round(confidence),
      notes,
    };
  }
}
