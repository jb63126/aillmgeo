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
      // Fetch the webpage with optimized settings and retry logic
      let response;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          console.log(`=== SCRAPE ATTEMPT ${retryCount + 1}/${maxRetries} ===`);
          console.log("URL:", url);
          console.log("Timeout:", 15000);
          console.log("Max content length:", 2000000);
          console.log("========================================");

          response = await axios.get(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              "Accept-Encoding": "gzip, deflate, br",
              Connection: "keep-alive",
              "Upgrade-Insecure-Requests": "1",
            },
            timeout: 15000, // Increased timeout
            maxContentLength: 2000000, // Increased to 2MB
            maxBodyLength: 2000000,
            validateStatus: (status) => status >= 200 && status < 400, // Accept redirects
          });

          console.log("=== HTTP RESPONSE SUCCESS ===");
          console.log("Status:", response.status);
          console.log("Status text:", response.statusText);
          console.log("Response size:", response.data?.length || 0);
          console.log("Content-Type:", response.headers["content-type"]);
          console.log("Response headers:", Object.keys(response.headers));
          console.log(
            "HTML preview:",
            response.data?.substring(0, 500) + "..."
          );
          console.log(
            "HTML contains <body>:",
            response.data?.includes("<body>")
          );
          console.log(
            "HTML contains <html>:",
            response.data?.includes("<html>")
          );
          console.log(
            "HTML contains <title>:",
            response.data?.includes("<title>")
          );
          console.log("HTML contains <p>:", response.data?.includes("<p>"));
          console.log("HTML contains <div>:", response.data?.includes("<div>"));
          console.log("=============================");
          break;
        } catch (error) {
          console.log(`=== SCRAPE ATTEMPT ${retryCount + 1} FAILED ===`);
          console.log(
            "Error:",
            error instanceof Error ? error.message : String(error)
          );
          console.log("Error code:", (error as any)?.code);
          console.log(
            "Error response status:",
            (error as any)?.response?.status
          );
          console.log(
            "Error response data:",
            (error as any)?.response?.data?.substring(0, 200)
          );
          console.log("========================================");

          retryCount++;
          if (retryCount >= maxRetries) {
            throw error;
          }
          // Wait before retry
          console.log(`Waiting ${1000 * retryCount}ms before retry...`);
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      if (!response) {
        throw new Error("Failed to get response after retries");
      }

      const $ = cheerio.load(response.data);

      console.log("=== CHEERIO LOADED HTML ===");
      console.log("HTML size:", response.data.length);
      console.log("Total elements:", $("*").length);
      console.log("Body elements:", $("body *").length);
      console.log(
        "Text nodes:",
        $("body")
          .contents()
          .filter(function () {
            return this.nodeType === 3;
          }).length
      );
      console.log("========================");

      // Extract content with better error handling
      console.log("Starting main content extraction...");
      const content = this.extractMainContent($);
      console.log(
        `Main content extraction completed: ${content.length} characters`
      );

      // If content is too short, try alternative extraction methods
      let finalContent = content;
      if (content.length < 100) {
        console.warn(
          `Short content detected (${content.length} chars), trying alternative extraction`
        );
        finalContent = this.extractAlternativeContent($);
        console.log(
          `Alternative extraction completed: ${finalContent.length} characters`
        );
      } else {
        console.log(
          "Main content extraction sufficient, skipping alternative extraction"
        );
      }

      console.log("=== EXTRACTING METADATA ===");
      const title =
        $("title").text().trim() || $("h1").first().text().trim() || "";
      const description =
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "";
      const headings = this.extractHeadings($);
      const links = this.extractLinks($, url);
      const images = this.extractImages($, url);
      const metadata = this.extractMetadata($);

      console.log("Title:", title);
      console.log("Description:", description);
      console.log("Headings count:", headings.length);
      console.log("Links count:", links.length);
      console.log("Images count:", images.length);
      console.log("Metadata keys:", Object.keys(metadata));
      console.log("========================");

      const scrapedContent: ScrapedContent = {
        url,
        title,
        description,
        content: finalContent,
        headings,
        links,
        images,
        metadata,
      };

      console.log(
        `Scraped ${url}: ${scrapedContent.content.length} characters`
      );
      return scrapedContent;
    } catch (error) {
      console.error("Scraping error for", url, ":", error);
      throw new Error(
        `Failed to scrape ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private static extractMainContent($: cheerio.CheerioAPI): string {
    console.log("=== EXTRACT MAIN CONTENT START ===");

    // Count initial elements before removal
    const initialScripts = $("script").length;
    const initialStyles = $("style").length;
    const initialNavs = $("nav").length;
    const initialHeaders = $("header").length;
    const initialAsides = $("aside").length;
    console.log("Elements before removal:", {
      initialScripts,
      initialStyles,
      initialNavs,
      initialHeaders,
      initialAsides,
    });

    // Remove unwanted elements quickly
    $(
      "script, style, nav, header, aside, .advertisement, .ads, .cookie, .popup, .modal"
    ).remove();

    console.log("Unwanted elements removed successfully");

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
    console.log("Trying content selectors...");
    for (const selector of contentSelectors) {
      const element = $(selector);
      console.log(`Selector '${selector}': found ${element.length} elements`);
      if (element.length > 0) {
        const text = element.text().trim();
        console.log(
          `Selector '${selector}': text length ${text.length} characters`
        );
        if (text.length > 100) {
          mainContent = text;
          console.log(
            `Selected content from '${selector}': ${text.substring(0, 100)}...`
          );
          break;
        }
      }
    }

    // If no main content found, fallback to body content
    if (!mainContent) {
      console.log("No main content found, falling back to body content");
      const bodyText = $("body").text().replace(/\s+/g, " ").trim();
      console.log(`Body text length: ${bodyText.length} characters`);
      console.log(`Body text preview: ${bodyText.substring(0, 200)}...`);
      mainContent = bodyText;
    }

    // Extract footer content specifically for location information
    console.log("Extracting footer content...");
    const footerContent = this.extractFooterContent($);
    console.log(`Footer content length: ${footerContent.length} characters`);

    // Combine main content with footer content
    const combinedContent =
      mainContent +
      (footerContent ? "\n\nFOOTER INFORMATION:\n" + footerContent : "");

    console.log(
      `Combined content length before limit: ${combinedContent.length} characters`
    );

    // Limit content length to 10000 characters
    const finalContent = combinedContent
      .substring(0, 10000)
      .replace(/\s+/g, " ")
      .trim();
    console.log(`Final content length: ${finalContent.length} characters`);
    console.log(`Final content preview: ${finalContent.substring(0, 200)}...`);
    console.log("=== EXTRACT MAIN CONTENT END ===");

    return finalContent;
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

  private static extractAlternativeContent($: cheerio.CheerioAPI): string {
    console.log("=== EXTRACT ALTERNATIVE CONTENT START ===");

    // Remove unwanted elements
    $(
      "script, style, nav, header, aside, .advertisement, .ads, .cookie, .popup, .modal"
    ).remove();

    console.log("Unwanted elements removed for alternative extraction");

    // Try multiple extraction strategies
    const strategies = [
      // Strategy 1: Try to find any content containers
      () => {
        console.log(
          "Trying Strategy 1: Content containers (div, section, article, p)"
        );
        const containers = $("div, section, article, p").filter((_, el) => {
          const text = $(el).text().trim();
          return text.length > 50 && text.length < 2000;
        });
        console.log(`Found ${containers.length} suitable containers`);
        const content = containers
          .map((_, el) => $(el).text().trim())
          .get()
          .join(" ");
        console.log(`Strategy 1 result: ${content.length} characters`);
        return content;
      },

      // Strategy 2: Extract all paragraph text
      () => {
        console.log("Trying Strategy 2: All paragraph text");
        const paragraphs = $("p");
        console.log(`Found ${paragraphs.length} paragraphs`);
        const content = paragraphs
          .map((_, el) => $(el).text().trim())
          .get()
          .join(" ");
        console.log(`Strategy 2 result: ${content.length} characters`);
        return content;
      },

      // Strategy 3: Extract all text content from divs
      () => {
        console.log("Trying Strategy 3: Text from divs");
        const divs = $("div");
        console.log(`Found ${divs.length} divs`);
        const content = divs
          .map((_, el) => {
            const text = $(el).text().trim();
            return text.length > 10 && text.length < 500 ? text : "";
          })
          .get()
          .filter(Boolean)
          .join(" ");
        console.log(`Strategy 3 result: ${content.length} characters`);
        return content;
      },

      // Strategy 4: Last resort - get all body text
      () => {
        console.log("Trying Strategy 4: All body text (last resort)");
        const content = $("body").text().replace(/\s+/g, " ").trim();
        console.log(`Strategy 4 result: ${content.length} characters`);
        return content;
      },
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`=== Executing Strategy ${i + 1} ===`);
        const content = strategies[i]();
        if (content && content.length > 100) {
          console.log(
            `Alternative extraction successful with Strategy ${i + 1}: ${content.length} characters`
          );
          console.log(`Content preview: ${content.substring(0, 200)}...`);
          const finalContent = content.substring(0, 10000);
          console.log(
            `Final alternative content length: ${finalContent.length} characters`
          );
          console.log("=== EXTRACT ALTERNATIVE CONTENT END ===");
          return finalContent;
        } else {
          console.log(
            `Strategy ${i + 1} failed: content too short (${content?.length || 0} chars)`
          );
        }
      } catch (error) {
        console.warn(`Alternative extraction strategy ${i + 1} failed:`, error);
      }
    }

    // If all strategies fail, return whatever we can get
    console.log("All strategies failed, returning body text as fallback");
    const fallbackContent = $("body")
      .text()
      .substring(0, 10000)
      .replace(/\s+/g, " ")
      .trim();
    console.log(
      `Fallback content length: ${fallbackContent.length} characters`
    );
    console.log(
      `Fallback content preview: ${fallbackContent.substring(0, 200)}...`
    );
    console.log("=== EXTRACT ALTERNATIVE CONTENT END ===");
    return fallbackContent;
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
