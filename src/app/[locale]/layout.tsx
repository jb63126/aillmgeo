import { type Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Header from "~/components/layout/header";
import ThemeProvider from "~/components/shared/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { siteConfig, siteUrl } from "~/config/site";
import { cn } from "~/lib/utils";
import { I18nProviderClient } from "~/locales/client";
import HashAuthHandler from "~/components/auth/hash-auth-handler";
import "../globals.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const locale = p.locale;
  const site = siteConfig(locale);

  const siteOgImage = `${siteUrl}/api/og?locale=${locale}`;

  return {
    title: {
      default: site.name,
      template: `%s - ${site.name}`,
    },
    description: site.description,
    keywords: [
      "AI Search",
      "ChatGPT",
      "Perplexity",
      "Google SGE",
      "Brand Monitoring",
      "AI Content Optimization",
      "LLM Analysis",
      "Search Engine Optimization",
      "AI Citations",
      "Content Strategy",
    ],
    authors: [
      {
        name: "FlowQL",
        url: "https://www.flowql.com",
      },
    ],
    creator: "FlowQL",
    openGraph: {
      type: "website",
      locale: locale,
      url: site.url,
      title: site.name,
      description: site.description,
      siteName: site.name,
      images: [
        {
          url: siteOgImage,
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
      images: [siteOgImage],
      creator: "@flowql",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: `${siteUrl}/manifest.json`,
    metadataBase: new URL(site.url),
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        fr: "/fr",
      },
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: site.name,
    },
  };
}

export const viewport = {
  width: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export default async function RootLayout({
  children,
  loginDialog,
  params,
}: {
  children: React.ReactNode;
  loginDialog: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <HashAuthHandler />
          <Header />
          <main>
            {children}
            {loginDialog}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
