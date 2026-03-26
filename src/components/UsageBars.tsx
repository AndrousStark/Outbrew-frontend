"use client";

import { useEffect, useState } from "react";
import { usageAPI } from "@/lib/api";
import { usePlanStore } from "@/store/planStore";
import { Mail, Megaphone, Crown } from "lucide-react";
import Link from "next/link";

interface UsageItem {
  used: number;
  limit: number;
  remaining: number;
  percent: number;
}

interface UsageData {
  plan_tier: string;
  emails: UsageItem;
  campaigns: UsageItem;
}

export function UsageBars() {
  const [data, setData] = useState<UsageData | null>(null);
  const plan = usePlanStore((s) => s.plan);

  useEffect(() => {
    usageAPI.getCurrent().then(({ data }) => setData(data)).catch(() => {});
  }, []);

  if (!data) return null;
  if (plan === "pro" || data.plan_tier === "pro") return null; // Pro users don't need usage bars

  return (
    <div className="px-3 py-3 space-y-2.5 border-t border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Usage</span>
        <Link href="/settings" className="text-[10px] text-orange-400 hover:text-orange-300">
          Upgrade
        </Link>
      </div>

      {/* Email usage */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-neutral-400 flex items-center gap-1">
            <Mail className="w-3 h-3" /> Emails
          </span>
          <span className={`font-mono ${data.emails.percent > 80 ? "text-red-400" : data.emails.percent > 50 ? "text-amber-400" : "text-neutral-500"}`}>
            {data.emails.used}/{data.emails.limit}
          </span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              data.emails.percent > 90 ? "bg-red-500" :
              data.emails.percent > 70 ? "bg-amber-500" :
              "bg-orange-500"
            }`}
            style={{ width: `${Math.min(100, data.emails.percent)}%` }}
          />
        </div>
      </div>

      {/* Campaign usage */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-neutral-400 flex items-center gap-1">
            <Megaphone className="w-3 h-3" /> Campaigns
          </span>
          <span className={`font-mono ${data.campaigns.percent > 80 ? "text-red-400" : data.campaigns.percent > 50 ? "text-amber-400" : "text-neutral-500"}`}>
            {data.campaigns.used}/{data.campaigns.limit}
          </span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              data.campaigns.percent > 90 ? "bg-red-500" :
              data.campaigns.percent > 70 ? "bg-amber-500" :
              "bg-orange-500"
            }`}
            style={{ width: `${Math.min(100, data.campaigns.percent)}%` }}
          />
        </div>
      </div>

      {/* Upgrade prompt */}
      <Link
        href="/settings"
        className="flex items-center gap-1.5 text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors pt-1"
      >
        <Crown className="w-3 h-3" />
        <span>Upgrade to Pro for unlimited</span>
      </Link>
    </div>
  );
}
