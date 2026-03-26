import { create } from "zustand";

export type PlanTier = "free" | "pro";

export interface UsageStats {
  monthly_email_sent: number;
  monthly_email_limit: number;
  monthly_campaigns_created: number;
  monthly_campaign_limit: number;
  monthly_recipient_limit: number;
}

interface PlanState {
  plan: PlanTier;
  usage: UsageStats;
  emailVerified: boolean;
  setPlan: (plan: PlanTier) => void;
  setUsage: (usage: UsageStats) => void;
  setEmailVerified: (verified: boolean) => void;
  syncFromUser: (user: { plan_tier?: string; usage?: UsageStats | null; email_verified?: boolean }) => void;
  isPro: () => boolean;
  isFree: () => boolean;
}

const DEFAULT_USAGE: UsageStats = {
  monthly_email_sent: 0,
  monthly_email_limit: 100,
  monthly_campaigns_created: 0,
  monthly_campaign_limit: 3,
  monthly_recipient_limit: 100,
};

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: "free",
  usage: DEFAULT_USAGE,
  emailVerified: false,

  setPlan: (plan: PlanTier) => set({ plan }),

  setUsage: (usage: UsageStats) => set({ usage }),

  setEmailVerified: (verified: boolean) => set({ emailVerified: verified }),

  // Called after login or /auth/me — syncs plan from backend response
  syncFromUser: (user) => {
    const plan = (user.plan_tier === "pro" ? "pro" : "free") as PlanTier;
    set({
      plan,
      usage: user.usage || DEFAULT_USAGE,
      emailVerified: user.email_verified || false,
    });
  },

  isPro: () => get().plan === "pro",
  isFree: () => get().plan === "free",
}));

// Features gated behind pro plan
export const PRO_FEATURES = {
  warmup: { name: "Email Warmup", description: "Advanced sender reputation building" },
  extraction: { name: "Extraction Engine", description: "AI-powered lead extraction" },
  insights: { name: "Insights & Analytics", description: "ML-powered analytics dashboard" },
  marketplace: { name: "Marketplace", description: "Template & intelligence marketplace" },
  outreach: { name: "AI Outreach", description: "AI-powered outreach tools" },
  settings_api: { name: "API Keys & Integrations", description: "Third-party API configuration" },
  campaigns_advanced: { name: "Advanced Campaigns", description: "Follow-up sequences & A/B testing" },
} as const;

// Sidebar items that require pro
export const PRO_SIDEBAR_ITEMS = [
  "/warmup",
  "/insights",
  "/marketplace-consolidated",
  "/mobiadz-extraction",
  "/outreach",
];

// Settings sections that require pro
export const PRO_SETTINGS_SECTIONS = [
  "api_keys",
  "integrations",
  "advanced_warmup",
];
