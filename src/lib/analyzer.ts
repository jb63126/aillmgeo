import { ScrapedContent } from "./scraper";

export interface ContentAnalysis {
  wordCount: number;
  readingTime: number; // in minutes
  sentiment: "positive" | "negative" | "neutral";
  topics: string[];
  keyPhrases: string[];
  complexity: "low" | "medium" | "high";
  structure: {
    hasHeaders: boolean;
    headerCount: number;
    paragraphCount: number;
    linkCount: number;
    imageCount: number;
  };
  seoMetrics: {
    hasTitle: boolean;
    hasDescription: boolean;
    titleLength: number;
    descriptionLength: number;
    hasHeadings: boolean;
  };
}

export class ContentAnalyzer {
  static analyzeContent(content: ScrapedContent): ContentAnalysis {
    const wordCount = this.countWords(content.content);
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 WPM

    return {
      wordCount,
      readingTime,
      sentiment: this.analyzeSentiment(content.content),
      topics: this.extractTopics(content),
      keyPhrases: this.extractKeyPhrases(content.content),
      complexity: this.assessComplexity(content.content),
      structure: {
        hasHeaders: content.headings.length > 0,
        headerCount: content.headings.length,
        paragraphCount: this.countParagraphs(content.content),
        linkCount: content.links.length,
        imageCount: content.images.length,
      },
      seoMetrics: {
        hasTitle: !!content.title,
        hasDescription: !!content.description,
        titleLength: content.title.length,
        descriptionLength: content.description.length,
        hasHeadings: content.headings.length > 0,
      },
    };
  }

  private static countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  private static countParagraphs(text: string): number {
    return text
      .split(/\n\s*\n/)
      .filter((paragraph) => paragraph.trim().length > 0).length;
  }

  private static analyzeSentiment(
    text: string
  ): "positive" | "negative" | "neutral" {
    // Simple sentiment analysis based on keywords
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "awesome",
      "love",
      "like",
      "enjoy",
      "happy",
      "pleased",
      "satisfied",
      "success",
      "win",
      "best",
      "better",
      "improve",
      "benefit",
      "advantage",
      "solution",
      "help",
    ];

    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "hate",
      "dislike",
      "sad",
      "angry",
      "disappointed",
      "frustrated",
      "problem",
      "issue",
      "error",
      "fail",
      "failure",
      "worst",
      "worse",
      "difficult",
      "hard",
      "challenge",
      "struggle",
      "trouble",
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach((word) => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });

    if (positiveScore > negativeScore) return "positive";
    if (negativeScore > positiveScore) return "negative";
    return "neutral";
  }

  private static extractTopics(content: ScrapedContent): string[] {
    const topics = new Set<string>();

    // Extract topics from headings
    content.headings.forEach((heading) => {
      const words = heading.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (word.length > 4 && !this.isCommonWord(word)) {
          topics.add(word);
        }
      });
    });

    // Extract topics from title
    if (content.title) {
      const titleWords = content.title.toLowerCase().split(/\s+/);
      titleWords.forEach((word) => {
        if (word.length > 4 && !this.isCommonWord(word)) {
          topics.add(word);
        }
      });
    }

    return Array.from(topics).slice(0, 10);
  }

  private static extractKeyPhrases(text: string): string[] {
    // Simple n-gram extraction for key phrases
    const sentences = text.split(/[.!?]+/);
    const phrases = new Set<string>();

    sentences.forEach((sentence) => {
      const words = sentence.trim().toLowerCase().split(/\s+/);

      // Extract 2-3 word phrases
      for (let i = 0; i < words.length - 1; i++) {
        if (words[i].length > 3 && words[i + 1].length > 3) {
          const phrase = `${words[i]} ${words[i + 1]}`;
          if (!this.containsCommonWords(phrase)) {
            phrases.add(phrase);
          }
        }

        if (i < words.length - 2 && words[i + 2].length > 3) {
          const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
          if (!this.containsCommonWords(phrase)) {
            phrases.add(phrase);
          }
        }
      }
    });

    return Array.from(phrases).slice(0, 15);
  }

  private static assessComplexity(text: string): "low" | "medium" | "high" {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength =
      words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Simple complexity scoring
    let complexityScore = 0;

    if (avgWordsPerSentence > 20) complexityScore += 2;
    else if (avgWordsPerSentence > 15) complexityScore += 1;

    if (avgWordLength > 6) complexityScore += 2;
    else if (avgWordLength > 5) complexityScore += 1;

    if (complexityScore >= 3) return "high";
    if (complexityScore >= 1) return "medium";
    return "low";
  }

  private static isCommonWord(word: string): boolean {
    const commonWords = [
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "his",
      "how",
      "its",
      "new",
      "now",
      "old",
      "see",
      "two",
      "who",
      "boy",
      "did",
      "may",
      "she",
      "use",
      "your",
      "come",
      "each",
      "from",
      "have",
      "here",
      "just",
      "like",
      "long",
      "make",
      "many",
      "over",
      "such",
      "take",
      "than",
      "them",
      "well",
      "were",
      "what",
      "will",
      "with",
      "would",
      "this",
      "that",
      "there",
      "they",
      "their",
    ];
    return commonWords.includes(word.toLowerCase());
  }

  private static containsCommonWords(phrase: string): boolean {
    const words = phrase.split(" ");
    return words.some((word) => this.isCommonWord(word));
  }
}
