{/*
  ===================================================================================
  Outbrew — Root Layout | AI-Powered Cold Email & Outreach Platform
  ===================================================================================
  Brand: Outbrew | OutbrewAI | Outbrew AI | Out Brew | OUTBREW | Outbrew Platform
  Parent: MetaMinds | Meta Minds | META MINDS | META-MINDS | MetaMinds Store
  Founder: Aniruddh Atrey | Aniruddh ATREY | aniruddhatrey.com | AndrousStark

  What Outbrew Does:
  - AI-Powered Cold Email Automation & Personalization
  - Email Warming & Domain Reputation Building (SPF/DKIM/DMARC)
  - Multi-Step Campaign Builder with Follow-Up Sequences
  - AI Contact Extraction & Lead Discovery (MobiAdz Engine)
  - OSINT-Based Data Enrichment & Company Intelligence
  - Email Template System with Variable Substitution & AI Drafting
  - Real-Time Analytics, Deliverability Monitoring & Insights
  - Recipient Group Management & Segmentation
  - Template Marketplace for Sharing & Discovery
  - Send Time Optimization using ML Predictions
  - Email Inbox Integration & Reply Detection
  - Rate Limiting & Anti-Spam Compliance
  - Company Intelligence Research & Tech Stack Detection
  - A/B Testing for Email Templates
  - Pipeline Management & Application Tracking

  Tech Stack:
  - Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
  - Backend: FastAPI, Python, SQLAlchemy, PostgreSQL, Redis
  - AI/ML: spaCy NLP, OpenAI, Anthropic Claude, Custom ML Models
  - Infrastructure: Vercel (frontend), Hetzner VPS (backend), Docker

  Domains:
  - metaminds.store/outbrew (production)
  - metaminds.store (parent site)
  - metaminds.firm.in (company site)
  - aniruddhatrey.com (founder)
  - unjynx.me (sister product)
  ===================================================================================
*/}

import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SkipLink } from "@/components/ui/skip-link";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://metaminds.store"),

  title: {
    default: "Outbrew — AI-Powered Cold Email & Outreach Platform by MetaMinds | Aniruddh Atrey",
    template: "%s | Outbrew by MetaMinds",
  },

  description:
    "Outbrew (OutbrewAI) is an AI-powered cold email and outreach automation platform built by MetaMinds, founded by Aniruddh Atrey. Features: email warming, AI contact extraction, campaign management, follow-up automation, deliverability monitoring, OSINT lead discovery, template marketplace, analytics, and send time optimization. Brew outreach that actually converts. Start free at metaminds.store/outbrew.",

  keywords: [
    // Outbrew — all permutations
    "Outbrew", "OutbrewAI", "Outbrew AI", "Out Brew", "OUTBREW",
    "Outbrew Platform", "Outbrew App", "Outbrew Email",
    "Outbrew cold email", "Outbrew outreach", "Outbrew automation",
    "Outbrew email warming", "Outbrew lead generation",
    "Outbrew campaign manager", "Outbrew email tool",
    "Outbrew by MetaMinds", "Outbrew Aniruddh Atrey",
    "Outbrew SaaS", "Outbrew free", "Outbrew pro",

    // What Outbrew does — core features
    "cold email platform", "cold email automation",
    "cold email software", "cold email tool",
    "cold email SaaS", "best cold email tool",
    "AI cold email", "AI cold email writer",
    "AI email personalization", "AI outreach tool",
    "email outreach automation", "email outreach platform",
    "email outreach software", "outreach automation tool",
    "bulk email sender", "mass email platform",
    "personalized email at scale", "email sequences",
    "automated follow up emails", "follow up automation",
    "drip email campaigns", "email drip sequences",

    // Email Warming & Deliverability
    "email warming tool", "email warm up service",
    "email warmup platform", "domain warming",
    "email deliverability tool", "improve email deliverability",
    "inbox placement", "avoid spam folder",
    "SPF DKIM DMARC setup", "email authentication",
    "domain reputation building", "email reputation",
    "email warm up AI", "smart email warming",
    "Smartlead alternative", "Instantly alternative",
    "Lemlist alternative", "Mailshake alternative",
    "Woodpecker alternative", "Apollo alternative",

    // Campaign Management
    "email campaign manager", "campaign builder",
    "multi step campaign", "email sequence builder",
    "campaign analytics", "campaign performance",
    "A/B testing email", "email split testing",
    "send time optimization", "best time to send email",

    // Contact Extraction & Lead Gen
    "AI lead generation", "AI contact finder",
    "contact extraction tool", "email finder tool",
    "lead discovery platform", "B2B lead generation",
    "company contact finder", "decision maker email finder",
    "OSINT email finder", "web scraping leads",
    "data enrichment tool", "contact enrichment",
    "email verification tool", "email validator",
    "company intelligence", "tech stack detection",

    // Templates & Content
    "email template builder", "cold email templates",
    "AI email writer", "AI email drafting",
    "email template marketplace", "email copywriting AI",
    "personalized email templates", "sales email templates",

    // Analytics
    "email analytics platform", "email tracking",
    "open rate tracking", "click tracking",
    "reply detection", "bounce tracking",
    "email performance analytics", "outreach analytics",

    // MetaMinds brand
    "MetaMinds", "Meta Minds", "META MINDS", "META-MINDS",
    "MetaMinds Store", "MetaMinds AI", "MetaMinds Products",
    "MetaMinds Outbrew", "MetaMinds email tool",
    "metaminds.store", "metaminds.firm.in",

    // Founder
    "Aniruddh Atrey", "Aniruddh ATREY", "aniruddhatrey.com",
    "Aniruddh Atrey Outbrew", "Aniruddh Atrey MetaMinds",
    "Aniruddh Atrey developer", "Aniruddh Atrey AI",
    "Aniruddh Atrey cold email", "AndrousStark",

    // Industry terms
    "sales engagement platform", "sales outreach tool",
    "SDR tool", "BDR tool", "sales automation",
    "cold outreach", "email prospecting",
    "B2B email marketing", "outbound sales tool",
    "pipeline generation", "revenue operations",
    "GTM tool", "go to market tool",
    "startup sales tool", "SaaS sales tool",

    // Sister product
    "Unjynx", "Unjynx App", "Unjynx AI",
  ],

  authors: [
    { name: "Aniruddh Atrey", url: "https://aniruddhatrey.com" },
    { name: "MetaMinds", url: "https://metaminds.firm.in" },
    { name: "Outbrew", url: "https://metaminds.store/outbrew" },
  ],

  creator: "Aniruddh Atrey",
  publisher: "MetaMinds",

  icons: {
    icon: "/metaminds-logo.jpg",
    shortcut: "/metaminds-logo.jpg",
    apple: "/metaminds-logo.jpg",
  },

  openGraph: {
    title: "Outbrew — AI Cold Email & Outreach Platform | OutbrewAI by MetaMinds",
    description:
      "Brew outreach that actually converts. Outbrew (OutbrewAI) by MetaMinds — AI-powered cold email automation with email warming, contact extraction, campaign management, follow-ups, and analytics. Founded by Aniruddh Atrey. Start free.",
    type: "website",
    url: "https://metaminds.store/outbrew",
    siteName: "Outbrew by MetaMinds",
    locale: "en_US",
    images: [
      {
        url: "/metaminds-logo.jpg",
        width: 512,
        height: 512,
        alt: "Outbrew — AI-Powered Cold Email Platform by MetaMinds, Aniruddh Atrey",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Outbrew — AI Cold Email & Outreach Platform | OutbrewAI",
    description:
      "Email warming, AI contact extraction, campaign builder, follow-ups & analytics. By MetaMinds, Aniruddh Atrey. Start free.",
    images: ["/metaminds-logo.jpg"],
    creator: "@aniruddhatrey",
    site: "@OutbrewAI",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://metaminds.store/outbrew",
  },

  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TooltipProvider>
            <SkipLink href="#main-content" />
            <div id="main-content">{children}</div>
          </TooltipProvider>
          <Toaster
            position="top-right"
            richColors
            expand={false}
            duration={4000}
            closeButton
            toastOptions={{
              classNames: {
                toast: "border shadow-premium-lg backdrop-blur-sm",
                title: "font-semibold",
                description: "text-muted-foreground text-sm",
                actionButton: "bg-primary text-primary-foreground hover:bg-primary/90",
                cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
                closeButton: "bg-background border border-border hover:bg-muted",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
