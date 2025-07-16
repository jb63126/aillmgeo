export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.flowql.com";

export const siteConfig = (locale: string = "en") => ({
  name: "FlowQL",
  url: siteUrl + "/" + locale,
  ogImage: `${siteUrl}/${locale}/opengraph-image`,
  description:
    "Understand what AI is saying about your brand. Optimize your content to be the top-cited source in ChatGPT, Perplexity, and Google SGE.",
  links: {
    twitter: "https://twitter.com/flowql",
    github: "https://github.com/flowql",
  },
});

export type SiteConfig = typeof siteConfig;
