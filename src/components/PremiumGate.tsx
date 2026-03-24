"use client";

import { usePlanStore } from "@/store/planStore";
import { IconLock, IconCrown, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

interface PremiumGateProps {
  feature: string;
  description?: string;
  children: React.ReactNode;
}

export function PremiumGate({ feature, description, children }: PremiumGateProps) {
  const isPro = usePlanStore((s) => s.isPro());

  if (isPro) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
        <IconLock className="w-10 h-10 text-orange-400" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {feature} is a Pro Feature
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        {description || `Upgrade to Outbrew Pro to unlock ${feature} and all premium features.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/login?plan=pro"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brew text-white font-semibold hover:scale-105 transition-all cursor-pointer"
        >
          <IconCrown className="w-5 h-5" />
          Upgrade to Pro
          <IconArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-orange-500/30 transition-all cursor-pointer"
        >
          View Pricing
        </Link>
      </div>
      <div className="mt-10 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 max-w-sm">
        <p className="text-xs text-orange-400 font-medium mb-1">Pro includes:</p>
        <ul className="text-xs text-muted-foreground space-y-1 text-left">
          <li>- Unlimited campaigns & recipients</li>
          <li>- Email warmup system</li>
          <li>- AI Extraction Engine</li>
          <li>- ML-powered analytics</li>
          <li>- API key integrations</li>
          <li>- Follow-up sequences</li>
        </ul>
      </div>
    </div>
  );
}

// Small inline badge for premium items in sidebar/menus
export function ProBadge() {
  return (
    <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-black rounded uppercase tracking-wider">
      PRO
    </span>
  );
}
