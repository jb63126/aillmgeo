import { createClient } from "@supabase/supabase-js";
import Redis from "ioredis";

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Redis connection (Upstash) - temporarily disabled
// const redis = new Redis(process.env.REDIS_URL!, {
//   retryDelayOnFailover: 100,
//   maxRetriesPerRequest: 3,
// });

// Mock Redis for now
const redis = {
  get: async () => null,
  set: async () => "OK",
  setex: async () => "OK",
  del: async () => 1,
  exists: async () => 0,
};

export { supabase as db, redis };

// Database helper functions
export async function query(text: string, params?: any[]) {
  // For now, we'll create the tables directly with Supabase
  // This is a temporary implementation - we'll use proper Supabase methods
  console.warn(
    "Using legacy query function - consider migrating to Supabase methods"
  );
  throw new Error(
    "Legacy query function not supported with Supabase. Use Supabase client methods instead."
  );
}

export async function getWebsiteById(id: number) {
  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createWebsite(
  url: string,
  title?: string,
  description?: string
) {
  // First try to get existing website
  const { data: existing } = await supabase
    .from("websites")
    .select("*")
    .eq("url", url)
    .single();

  if (existing) {
    // Update existing website
    const { data, error } = await supabase
      .from("websites")
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new website
    const { data, error } = await supabase
      .from("websites")
      .insert([
        {
          url,
          title,
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function updateWebsiteContent(id: number, content: string) {
  const { data, error } = await supabase
    .from("websites")
    .update({
      scraped_content: content,
      scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function for analysis inserts
export async function insertAnalysis(
  websiteId: number,
  analysisType: string,
  analysisResult: any
) {
  const { data, error } = await supabase
    .from("analyses")
    .insert([
      {
        website_id: websiteId,
        analysis_type: analysisType,
        analysis_result: analysisResult,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function for LLM test inserts
export async function insertLLMTest(
  websiteId: number,
  query: string,
  model: string,
  response: string,
  responseTime: number
) {
  const { data, error } = await supabase
    .from("llm_tests")
    .insert([
      {
        website_id: websiteId,
        query,
        model,
        response,
        response_time: responseTime,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function for reference check inserts
export async function insertReferenceCheck(
  llmTestId: number,
  referenceSource: string,
  isAccurate: boolean,
  confidenceScore: number,
  notes: string
) {
  const { data, error } = await supabase
    .from("reference_checks")
    .insert([
      {
        llm_test_id: llmTestId,
        reference_source: referenceSource,
        is_accurate: isAccurate,
        confidence_score: confidenceScore,
        notes,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function for PageSpeed insights
export async function insertPageSpeedInsights(
  websiteId: number,
  performanceScore: number,
  accessibilityScore: number,
  bestPracticesScore: number,
  seoScore: number,
  metrics: any
) {
  const { data, error } = await supabase
    .from("pagespeed_insights")
    .insert([
      {
        website_id: websiteId,
        performance_score: performanceScore,
        accessibility_score: accessibilityScore,
        best_practices_score: bestPracticesScore,
        seo_score: seoScore,
        metrics,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
