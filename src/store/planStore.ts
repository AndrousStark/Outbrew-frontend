import { create } from "zustand";

export type PlanTier = "free" | "pro";

interface PlanState {
  plan: PlanTier;
  setPlan: (plan: PlanTier) => void;
  isPro: () => boolean;
  isFree: () => boolean;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: (typeof window !== "undefined"
    ? (sessionStorage.getItem("outbrew_plan") as PlanTier) || "free"
    : "free"),
  setPlan: (plan: PlanTier) => {
    sessionStorage.setItem("outbrew_plan", plan);
    set({ plan });
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
