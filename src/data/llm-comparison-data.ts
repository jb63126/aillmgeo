export const sampleLLMData = [
  {
    query: "What is the company's primary business model?",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "Who are their target customers?",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: false },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "What are their main products or services?",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "What is their pricing structure?",
    results: [
      { llm: "ChatGPT", result: false },
      { llm: "Perplexity", result: false },
      { llm: "Claude", result: false },
    ],
  },
  {
    query: "Where is the company located?",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "What industry sector do they operate in?",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "How large is their team or workforce?",
    results: [
      { llm: "ChatGPT", result: false },
      { llm: "Perplexity", result: false },
      { llm: "Claude", result: false },
    ],
  },
  {
    query: "What is their company culture or values?",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: false },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "What are their recent achievements or milestones?",
    results: [
      { llm: "ChatGPT", result: false },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: false },
    ],
  },
  {
    query: "Do they have any partnerships or collaborations?",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: false },
    ],
  },
];

export const websiteAnalysisQueries = [
  {
    query: "Extract company name and tagline",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "Identify key value propositions",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "Find contact information",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: false },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "Determine target market segments",
    results: [
      { llm: "ChatGPT", result: false },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: true },
    ],
  },
  {
    query: "Extract social media links",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: true },
      { llm: "Claude", result: false },
    ],
  },
  {
    query: "Identify competitive advantages",
    results: [
      { llm: "ChatGPT", result: true },
      { llm: "Perplexity", result: false },
      { llm: "Claude", result: true },
    ],
  },
];

export type LLMResult = {
  llm: string;
  result: boolean;
};

export type QueryResult = {
  query: string;
  results: LLMResult[];
};
