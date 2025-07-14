-- LLM Geo Database Schema for Supabase
-- Create tables for the website analysis application

-- Websites table - stores basic website information
CREATE TABLE IF NOT EXISTS websites (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  scraped_content TEXT,
  scraped_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analyses table - stores content analysis results
CREATE TABLE IF NOT EXISTS analyses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  website_id BIGINT REFERENCES websites(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- LLM Tests table - stores test queries and responses from LLMs
CREATE TABLE IF NOT EXISTS llm_tests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  website_id BIGINT REFERENCES websites(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  model TEXT NOT NULL,
  response TEXT NOT NULL,
  response_time INTEGER, -- milliseconds
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reference Checks table - stores verification results for LLM responses
CREATE TABLE IF NOT EXISTS reference_checks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  llm_test_id BIGINT REFERENCES llm_tests(id) ON DELETE CASCADE,
  reference_source TEXT NOT NULL,
  is_accurate BOOLEAN NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PageSpeed Insights table - stores Google PageSpeed results
CREATE TABLE IF NOT EXISTS pagespeed_insights (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  website_id BIGINT REFERENCES websites(id) ON DELETE CASCADE,
  performance_score INTEGER,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  seo_score INTEGER,
  metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_websites_url ON websites(url);
CREATE INDEX IF NOT EXISTS idx_analyses_website_id ON analyses(website_id);
CREATE INDEX IF NOT EXISTS idx_llm_tests_website_id ON llm_tests(website_id);
CREATE INDEX IF NOT EXISTS idx_reference_checks_llm_test_id ON reference_checks(llm_test_id);
CREATE INDEX IF NOT EXISTS idx_pagespeed_insights_website_id ON pagespeed_insights(website_id);

-- Enable Row Level Security (RLS) for security
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagespeed_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
CREATE POLICY "Allow public read access on websites" ON websites FOR ALL USING (true);
CREATE POLICY "Allow public read access on analyses" ON analyses FOR ALL USING (true);
CREATE POLICY "Allow public read access on llm_tests" ON llm_tests FOR ALL USING (true);
CREATE POLICY "Allow public read access on reference_checks" ON reference_checks FOR ALL USING (true);
CREATE POLICY "Allow public read access on pagespeed_insights" ON pagespeed_insights FOR ALL USING (true);