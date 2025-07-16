import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedContent {
  url: string;
  title: string;
  description: string;
  content: string;
  headings: string[];
  links: string[];
  images: string[];
  metadata: Record<string, string>;
}

export interface MultiPageScrapedContent {
  primaryUrl: string;
  pages: ScrapedContent[];
  combinedContent: {
    title: string;
    description: string;
    content: string;
    headings: string[];
    allLinks: string[];
    allImages: string[];
    combinedMetadata: Record<string, string>;
  };
}

export class WebScraper {
  private static readonly CACHE_TTL = 3600; // 1 hour

  static async scrapeMultiplePages(
    url: string
  ): Promise<MultiPageScrapedContent> {
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    const pagesToScrape = new Set<string>();

    // Add the original URL
    pagesToScrape.add(url);

    // Add home page if different
    if (url !== baseUrl && url !== `${baseUrl}/`) {
      pagesToScrape.add(baseUrl);
    }

    // Try to find and add about page
    const aboutUrl = await this.findAboutPage(baseUrl);
    if (aboutUrl && !pagesToScrape.has(aboutUrl)) {
      pagesToScrape.add(aboutUrl);
    }

    // Limit to 3 pages
    const urlsToScrape = Array.from(pagesToScrape).slice(0, 3);

    // Scrape all pages
    const scrapedPages: ScrapedContent[] = [];
    for (const pageUrl of urlsToScrape) {
      try {
        const pageContent = await this.scrapeWebsite(pageUrl);
        scrapedPages.push(pageContent);
      } catch (error) {
        console.error(`Failed to scrape ${pageUrl}:`, error);
        // Continue with other pages
      }
    }

    // Combine all content
    const combinedContent = this.combinePageContent(scrapedPages);

    return {
      primaryUrl: url,
      pages: scrapedPages,
      combinedContent,
    };
  }

  static async findAboutPage(baseUrl: string): Promise<string | null> {
    // Common about page patterns
    const aboutPatterns = [
      "/about",
      "/about-us",
      "/about-me",
      "/company",
      "/who-we-are",
      "/our-story",
      "/team",
      "/info",
    ];

    // Try direct URL patterns first
    for (const pattern of aboutPatterns) {
      const aboutUrl = `${baseUrl}${pattern}`;
      try {
        const response = await axios.head(aboutUrl, { timeout: 5000 });
        if (response.status === 200) {
          return aboutUrl;
        }
      } catch {
        // Continue to next pattern
      }
    }

    // If direct patterns fail, try to find links in navigation
    try {
      const homeResponse = await axios.get(baseUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(homeResponse.data);

      // Look for about links in navigation
      const navSelectors = [
        "nav",
        ".nav",
        ".navigation",
        ".menu",
        "header",
        ".header",
      ];
      for (const selector of navSelectors) {
        const aboutLink = $(selector)
          .find("a")
          .filter((_, el): boolean => {
            const text = $(el).text().toLowerCase();
            const href = $(el).attr("href");
            return Boolean(
              href &&
                (text.includes("about") ||
                  text.includes("company") ||
                  text.includes("who we are") ||
                  text.includes("our story") ||
                  text.includes("team"))
            );
          })
          .first()
          .attr("href");

        if (aboutLink) {
          const fullUrl = new URL(aboutLink, baseUrl).href;
          // Ensure it's on the same domain
          if (fullUrl.startsWith(baseUrl)) {
            return fullUrl;
          }
        }
      }
    } catch (error) {
      console.error("Error finding about page:", error);
    }

    return null;
  }

  static combinePageContent(
    pages: ScrapedContent[]
  ): MultiPageScrapedContent["combinedContent"] {
    if (pages.length === 0) {
      return {
        title: "",
        description: "",
        content: "",
        headings: [],
        allLinks: [],
        allImages: [],
        combinedMetadata: {},
      };
    }

    // Use the first page (usually home or provided URL) for primary title/description
    const primaryPage = pages[0];

    // Combine all content
    const allContent = pages.map((page) => page.content).join("\n\n");
    const allHeadings = pages.flatMap((page) => page.headings);
    const allLinks = [...new Set(pages.flatMap((page) => page.links))];
    const allImages = [...new Set(pages.flatMap((page) => page.images))];

    // Combine metadata
    const combinedMetadata: Record<string, string> = {};
    pages.forEach((page) => {
      Object.entries(page.metadata).forEach(([key, value]) => {
        if (!combinedMetadata[key]) {
          combinedMetadata[key] = value;
        }
      });
    });

    return {
      title: primaryPage.title,
      description: primaryPage.description,
      content: allContent,
      headings: allHeadings,
      allLinks,
      allImages,
      combinedMetadata,
    };
  }

  static async scrapeWebsite(url: string): Promise<ScrapedContent> {
    try {
      // Fetch the webpage with optimized settings
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 8000, // Reduced from 30000
        maxContentLength: 1000000, // Limit content size to 1MB
        maxBodyLength: 1000000,
      });

      const $ = cheerio.load(response.data);

      // Extract content
      const scrapedContent: ScrapedContent = {
        url,
        title: $("title").text().trim() || $("h1").first().text().trim() || "",
        description: $('meta[name="description"]').attr("content") || "",
        content: this.extractMainContent($),
        headings: this.extractHeadings($),
        links: this.extractLinks($, url),
        images: this.extractImages($, url),
        metadata: this.extractMetadata($),
      };

      return scrapedContent;
    } catch (error) {
      console.error("Scraping error:", error);
      throw new Error(
        `Failed to scrape ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private static extractMainContent($: cheerio.CheerioAPI): string {
    // Remove unwanted elements quickly
    $(
      "script, style, nav, header, aside, .advertisement, .ads, .cookie, .popup, .modal"
    ).remove();

    // Try to find main content area (optimized order)
    const contentSelectors = [
      "main",
      "article",
      "[role='main']",
      ".content",
      "#content",
      ".main-content",
      "#main",
    ];

    let mainContent = "";
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        if (text.length > 100) {
          mainContent = text;
          break;
        }
      }
    }

    // If no main content found, fallback to body content
    if (!mainContent) {
      mainContent = $("body").text().replace(/\s+/g, " ").trim();
    }

    // Extract footer content specifically for location information
    const footerContent = this.extractFooterContent($);

    // Combine main content with footer content
    const combinedContent =
      mainContent +
      (footerContent ? "\n\nFOOTER INFORMATION:\n" + footerContent : "");

    // Limit content length to 10000 characters
    return combinedContent.substring(0, 10000).replace(/\s+/g, " ").trim();
  }

  private static extractFooterContent($: cheerio.CheerioAPI): string {
    const footerSelectors = [
      "footer",
      ".footer",
      "#footer",
      ".site-footer",
      ".page-footer",
      "[role='contentinfo']",
    ];

    for (const selector of footerSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        if (text.length > 10) {
          return text.substring(0, 1000).replace(/\s+/g, " ").trim();
        }
      }
    }

    return "";
  }

  private static extractHeadings($: cheerio.CheerioAPI): string[] {
    const headings: string[] = [];
    $("h1, h2, h3, h4, h5, h6").each((_, element) => {
      const text = $(element).text().trim();
      if (text) {
        headings.push(text);
      }
    });
    return headings;
  }

  private static extractLinks(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): string[] {
    const links: string[] = [];
    const base = new URL(baseUrl);

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        try {
          const absoluteUrl = new URL(href, base).href;
          if (!links.includes(absoluteUrl)) {
            links.push(absoluteUrl);
          }
        } catch {
          // Skip invalid URLs
        }
      }
    });

    return links.slice(0, 50); // Limit to 50 links
  }

  private static extractImages(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): string[] {
    const images: string[] = [];
    const base = new URL(baseUrl);

    $("img[src]").each((_, element) => {
      const src = $(element).attr("src");
      if (src) {
        try {
          const absoluteUrl = new URL(src, base).href;
          if (!images.includes(absoluteUrl)) {
            images.push(absoluteUrl);
          }
        } catch {
          // Skip invalid URLs
        }
      }
    });

    return images.slice(0, 20); // Limit to 20 images
  }

  private static extractMetadata(
    $: cheerio.CheerioAPI
  ): Record<string, string> {
    const metadata: Record<string, string> = {};

    // Open Graph tags
    $('meta[property^="og:"]').each((_, element) => {
      const property = $(element).attr("property");
      const content = $(element).attr("content");
      if (property && content) {
        metadata[property] = content;
      }
    });

    // Twitter tags
    $('meta[name^="twitter:"]').each((_, element) => {
      const name = $(element).attr("name");
      const content = $(element).attr("content");
      if (name && content) {
        metadata[name] = content;
      }
    });

    // Other important meta tags
    const metaTags = ["author", "keywords", "robots", "viewport"];
    metaTags.forEach((tag) => {
      const content = $(`meta[name="${tag}"]`).attr("content");
      if (content) {
        metadata[tag] = content;
      }
    });

    return metadata;
  }
}
