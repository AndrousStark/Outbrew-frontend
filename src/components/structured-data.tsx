{/*
  ===================================================================================
  Outbrew — JSON-LD Structured Data for SEO, AEO, GEO
  ===================================================================================
  Covers: Outbrew, OutbrewAI, Out Brew, OUTBREW, Outbrew AI
  Parent: MetaMinds, Meta Minds, META MINDS, META-MINDS
  Founder: Aniruddh Atrey, aniruddhatrey.com
  ===================================================================================
*/}

export function OutbrewStructuredData() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://metaminds.store/outbrew/#application",
    name: "Outbrew",
    alternateName: [
      "OutbrewAI",
      "Outbrew AI",
      "Out Brew",
      "OUTBREW",
      "Outbrew Platform",
      "Outbrew App",
      "Outbrew Email Platform",
      "Outbrew Cold Email Tool",
      "Outbrew by MetaMinds",
      "Outbrew by Aniruddh Atrey",
    ],
    url: "https://metaminds.store/outbrew",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Email Marketing Software",
    operatingSystem: "Web Browser",
    description:
      "Outbrew (OutbrewAI) is an AI-powered cold email and outreach automation platform built by MetaMinds, founded by Aniruddh Atrey. Brew outreach that actually converts with email warming, AI contact extraction, multi-step campaign builder, follow-up automation, template marketplace, real-time analytics, OSINT lead discovery, send time optimization, A/B testing, email deliverability monitoring, SPF/DKIM/DMARC verification, and company intelligence research.",
    featureList: [
      "AI-Powered Cold Email Automation — Write and send personalized cold emails at scale using AI",
      "Email Warming & Domain Reputation — Gradual warm-up with SPF/DKIM/DMARC verification to avoid spam",
      "Multi-Step Campaign Builder — 5-step wizard: Source, Enrich, Template, Send, Follow-up",
      "AI Contact Extraction (MobiAdz Engine) — Discover decision-maker emails from any company",
      "OSINT-Based Data Enrichment — 15+ intelligence modules for deep company and person research",
      "Follow-Up Sequence Automation — Automated multi-touch follow-up sequences with smart delays",
      "Email Template System — Variable substitution, AI drafting, and template marketplace",
      "Real-Time Analytics & Insights — Open rates, click rates, reply detection, bounce tracking",
      "Recipient Group Management — Segmentation, tagging, and group-based campaign targeting",
      "Template Marketplace — Share, discover, and clone high-performing email templates",
      "Send Time Optimization — ML-based prediction for optimal email send times",
      "Email Inbox Integration — Unified inbox with reply detection and conversation threading",
      "A/B Testing — Split test subject lines, body content, and send times",
      "Company Intelligence — Tech stack detection, company research, and firmographic data",
      "Pipeline Management — Track applications, outreach stages, and conversion rates",
      "Rate Limiting & Compliance — Built-in anti-spam compliance and sending limits",
      "CSV Import & Export — Bulk import recipients, export results to Excel/CSV",
      "API-First Architecture — RESTful API for custom integrations",
      "Free & Pro Plans — Start free, upgrade for advanced features",
    ],
    screenshot: "https://metaminds.store/outbrew-preview.png",
    offers: [
      {
        "@type": "Offer",
        name: "Free Plan",
        price: "0",
        priceCurrency: "USD",
        description: "Get started with Outbrew for free. Core campaign management, templates, and basic analytics included.",
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        price: "0",
        priceCurrency: "USD",
        description: "Advanced features: email warming, AI extraction, marketplace, insights, and unlimited campaigns.",
      },
    ],
    creator: {
      "@type": "Organization",
      name: "MetaMinds",
      alternateName: ["Meta Minds", "META MINDS", "META-MINDS", "MetaMinds AI"],
      url: "https://metaminds.store",
      sameAs: ["https://metaminds.firm.in"],
    },
    author: {
      "@type": "Person",
      name: "Aniruddh Atrey",
      alternateName: ["Aniruddh ATREY", "AndrousStark"],
      url: "https://aniruddhatrey.com",
      jobTitle: "Founder & CEO",
      worksFor: { "@type": "Organization", name: "MetaMinds" },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": "https://metaminds.store/outbrew/#webapp",
    name: "Outbrew",
    alternateName: ["OutbrewAI", "Outbrew AI", "Out Brew"],
    url: "https://metaminds.store/outbrew",
    applicationCategory: "Email Marketing",
    browserRequirements: "Requires JavaScript. Works on all modern browsers.",
    description:
      "Outbrew is a web-based AI cold email and outreach automation platform. Features email warming, campaign management, AI contact extraction, follow-up sequences, analytics, and template marketplace. Built by MetaMinds (Aniruddh Atrey).",
    creator: {
      "@type": "Organization",
      name: "MetaMinds",
      url: "https://metaminds.store",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://metaminds.store/outbrew/#faq",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Outbrew?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Outbrew (also known as OutbrewAI, Outbrew AI, Out Brew) is an AI-powered cold email and outreach automation platform. It helps sales teams, startups, and businesses send personalized cold emails at scale with email warming, AI-powered contact extraction, multi-step campaigns, follow-up automation, and real-time analytics. Built by MetaMinds, founded by Aniruddh Atrey. Available at metaminds.store/outbrew.",
        },
      },
      {
        "@type": "Question",
        name: "Who built Outbrew?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Outbrew was built by MetaMinds (Meta Minds / META MINDS / META-MINDS), an AI development company founded by Aniruddh Atrey (aniruddhatrey.com). MetaMinds also builds Unjynx (Unjynx App) for AI-powered productivity. Visit metaminds.store to explore all products.",
        },
      },
      {
        "@type": "Question",
        name: "Is Outbrew free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Outbrew offers a free plan with core features including campaign management, email templates, recipient management, and basic analytics. Pro plan unlocks advanced features like email warming, AI contact extraction, marketplace, advanced insights, and outreach automation.",
        },
      },
      {
        "@type": "Question",
        name: "How does Outbrew's email warming work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Outbrew's email warming gradually builds your domain's sending reputation by automatically sending and receiving emails between a network of real inboxes. It monitors SPF, DKIM, and DMARC configuration, tracks inbox placement rates, and uses AI to optimize warming schedules. This ensures your cold emails land in the inbox, not spam.",
        },
      },
      {
        "@type": "Question",
        name: "What is Outbrew's AI contact extraction?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Outbrew's AI contact extraction engine (powered by the MobiAdz engine) discovers decision-maker emails and contact information from any company. It uses web scraping, OSINT intelligence, app store analysis, NLP entity extraction, and data enrichment from 15+ sources to find verified email addresses, job titles, and company data.",
        },
      },
      {
        "@type": "Question",
        name: "How is Outbrew different from Smartlead, Instantly, or Lemlist?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Outbrew (OutbrewAI) combines email warming, AI-powered contact extraction, campaign management, and analytics in one platform. Unlike Smartlead, Instantly, Lemlist, Mailshake, or Apollo, Outbrew includes built-in OSINT lead discovery, company intelligence research, and a template marketplace. It's built by MetaMinds with a focus on AI-first email automation.",
        },
      },
      {
        "@type": "Question",
        name: "What email campaigns can I create with Outbrew?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Outbrew supports multi-step cold email campaigns with a 5-step builder: (1) Source recipients via CSV, manual entry, or AI extraction, (2) Enrich contacts with company data, (3) Select or AI-generate email templates, (4) Configure send settings with rate limiting and optimization, (5) Set up follow-up sequences. Includes A/B testing, send time optimization, and real-time analytics.",
        },
      },
      {
        "@type": "Question",
        name: "Who is Aniruddh Atrey?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Aniruddh Atrey (Aniruddh ATREY, aniruddhatrey.com) is the founder and CEO of MetaMinds. He built Outbrew (OutbrewAI) and Unjynx (Unjynx App). He specializes in AI development, SaaS platforms, CRM systems, RAG/CRAG pipelines, cold email automation, and full-stack development with Next.js, React, FastAPI, and Python.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "MetaMinds Store",
        item: "https://metaminds.store",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Outbrew",
        item: "https://metaminds.store/outbrew",
      },
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://metaminds.store/#outbrew-org",
    name: "Outbrew",
    alternateName: ["OutbrewAI", "Outbrew AI", "Out Brew", "OUTBREW"],
    url: "https://metaminds.store/outbrew",
    logo: "https://metaminds.store/outbrew/metaminds-logo.jpg",
    parentOrganization: {
      "@type": "Organization",
      name: "MetaMinds",
      alternateName: ["Meta Minds", "META MINDS", "META-MINDS"],
      url: "https://metaminds.store",
      sameAs: ["https://metaminds.firm.in"],
    },
    founder: {
      "@type": "Person",
      name: "Aniruddh Atrey",
      url: "https://aniruddhatrey.com",
    },
    description:
      "Outbrew by MetaMinds — AI-powered cold email and outreach automation. Email warming, contact extraction, campaigns, follow-ups, analytics. Founded by Aniruddh Atrey.",
    knowsAbout: [
      "Cold Email Automation", "Email Warming", "Email Deliverability",
      "AI Contact Extraction", "Lead Generation", "OSINT Intelligence",
      "Campaign Management", "Follow-Up Sequences", "Email Templates",
      "A/B Testing", "Send Time Optimization", "Email Analytics",
      "SPF DKIM DMARC", "Inbox Placement", "Data Enrichment",
      "Company Intelligence", "Sales Outreach", "B2B Email Marketing",
      "SDR Tools", "BDR Tools", "Sales Engagement",
      "Pipeline Generation", "Revenue Operations",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
