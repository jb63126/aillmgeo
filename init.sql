-- LLM Geo Database Schema

-- Websites table to store URLs and metadata
CREATE TABLE IF NOT EXISTS websites (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title TEXT,
    description TEXT,
    scraped_content TEXT,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis table to store content analysis results
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL,
    analysis_result JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LLM Tests table to store generated queries and test results
CREATE TABLE IF NOT EXISTS llm_tests (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    model VARCHAR(50) NOT NULL,
    response TEXT,
    accuracy_score DECIMAL(3,2),
    response_time INTEGER, -- in milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reference checks table to verify LLM responses
CREATE TABLE IF NOT EXISTS reference_checks (
    id SERIAL PRIMARY KEY,
    llm_test_id INTEGER REFERENCES llm_tests(id) ON DELETE CASCADE,
    reference_source TEXT,
    is_accurate BOOLEAN,
    confidence_score DECIMAL(3,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PageSpeed insights table
CREATE TABLE IF NOT EXISTS pagespeed_insights (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    performance_score INTEGER,
    accessibility_score INTEGER,
    best_practices_score INTEGER,
    seo_score INTEGER,
    metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_websites_url ON websites(url);
CREATE INDEX IF NOT EXISTS idx_analyses_website_id ON analyses(website_id);
CREATE INDEX IF NOT EXISTS idx_llm_tests_website_id ON llm_tests(website_id);
CREATE INDEX IF NOT EXISTS idx_reference_checks_llm_test_id ON reference_checks(llm_test_id);
CREATE INDEX IF NOT EXISTS idx_pagespeed_website_id ON pagespeed_insights(website_id);