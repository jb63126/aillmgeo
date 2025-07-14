# LLM Geo Analyzer

A local development version of the LLM Geo project built with Next.js 14, featuring comprehensive website analysis and LLM response testing.

## Features

- **Website Scraping**: Extract content, metadata, and structure from any URL
- **Content Analysis**: Analyze sentiment, topics, complexity, and SEO metrics
- **LLM Testing**: Test OpenAI and Anthropic models with generated queries
- **Reference Checking**: Verify LLM response accuracy against source content
- **Performance Insights**: PageSpeed metrics and optimization recommendations
- **Interactive Dashboard**: Real-time results with detailed visualizations

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL (local via Docker)
- **Cache**: Redis (local via Docker)
- **AI APIs**: OpenAI, Anthropic, Google PageSpeed Insights
- **Scraping**: Cheerio, Axios
- **UI Components**: shadcn/ui, Radix UI

## Core Flow Architecture

```
URL Input → Website Scraper → Content Analyzer → Query Generator → LLM Testing → Reference Checker → Results Dashboard
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker (for PostgreSQL and Redis)
- API keys for OpenAI, Anthropic, and Google PageSpeed Insights

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install --force
   ```

2. **Set up environment variables**:
   Copy `.env.local` and add your API keys:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   PAGESPEED_API_KEY=your_pagespeed_api_key_here
   DATABASE_URL=postgresql://postgres:password@localhost:5432/aillmgeo
   REDIS_URL=redis://localhost:6379
   ```

3. **Start database services**:
   ```bash
   docker compose up -d
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter a URL** in the dashboard input field
2. **Click "Analyze"** to start the full analysis pipeline
3. **View Results** across multiple tabs:
   - **LLM Tests**: Compare OpenAI vs Anthropic responses
   - **Content Analysis**: Topics, keywords, and SEO metrics
   - **Performance**: PageSpeed insights and optimization tips

## Database Schema

The application uses PostgreSQL with the following main tables:

- `websites`: Store URL metadata and scraped content
- `analyses`: Content analysis results
- `llm_tests`: LLM responses and performance metrics
- `reference_checks`: Accuracy verification results
- `pagespeed_insights`: Performance metrics

## Development

### Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   └── page.tsx              # Main dashboard page
│   └── api/
│       └── analyze/
│           └── route.ts          # Analysis API endpoint
├── components/
│   ├── llm-geo-dashboard.tsx     # Main dashboard component
│   └── ui/                       # shadcn/ui components
└── lib/
    ├── database.ts               # Database connections and queries
    ├── scraper.ts                # Website scraping logic
    ├── analyzer.ts               # Content analysis functions
    └── llm-integrations.ts       # AI API integrations
```

### Key Components

- **WebScraper**: Extracts content, metadata, and structure from websites
- **ContentAnalyzer**: Performs sentiment analysis, topic extraction, and SEO evaluation
- **LLMIntegrations**: Handles OpenAI and Anthropic API calls with response verification
- **Dashboard**: Interactive UI for analysis results and comparisons

### API Endpoints

- `POST /api/analyze`: Main analysis endpoint that orchestrates the entire pipeline

## Docker Services

The `docker-compose.yml` file provides:

- **PostgreSQL**: Database with automatic schema initialization
- **Redis**: Caching layer for scraped content and API responses

## Performance Considerations

- **Caching**: Redis caches scraped content to avoid re-scraping
- **Rate Limiting**: Built-in delays for API calls to respect rate limits
- **Database Optimization**: Indexes on frequently queried fields
- **Concurrent Processing**: Parallel LLM testing for faster results

## Contributing

This is a local development version. For production deployment, consider:

- Environment-specific configurations
- Production database setup (Supabase)
- Hosted Redis (Upstash)
- Error monitoring and logging
- Rate limiting and authentication
- CORS and security headers

## License

MIT License - see LICENSE file for details.
