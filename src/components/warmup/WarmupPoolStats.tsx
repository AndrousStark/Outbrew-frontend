"use client";

/**
 * WarmupPoolStats.tsx
 *
 * Displays warmup pool network statistics
 * Shows pool size, tier distribution, and activity metrics
 *
 * @version 2.0.0
 */

import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Users,
  MessageSquare,
  Send,
  Inbox,
  Crown,
  Star,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface WarmupPoolStatsProps {
  poolSize?: number;
  premiumPoolSize?: number;
  privatePoolSize?: number;
  conversationsActive?: number;
  emailsSent?: number;
  emailsReceived?: number;
  stats?: {
    totalMembers: number;
    activeMembers: number;
    byTier?: Record<string, number>;
    avgQualityScore?: number;
  };
  className?: string;
}

interface PoolTier {
  name: string;
  size: number;
  color: string;
  icon: React.ReactNode;
  description: string;
  benefit: string;
}

// ============================================================================
// Component
// ============================================================================

export function WarmupPoolStats({
  poolSize: propPoolSize,
  premiumPoolSize: propPremiumPoolSize,
  privatePoolSize: propPrivatePoolSize = 0,
  conversationsActive: propConversationsActive,
  emailsSent: propEmailsSent,
  emailsReceived: propEmailsReceived,
  stats,
  className,
}: WarmupPoolStatsProps) {
  // Use stats prop if available, otherwise fall back to individual props
  const poolSize = stats?.totalMembers ?? propPoolSize ?? 0;
  const premiumPoolSize = stats?.byTier?.premium ?? propPremiumPoolSize ?? 0;
  const privatePoolSize = stats?.byTier?.enterprise ?? propPrivatePoolSize ?? 0;
  const godPoolSize = stats?.byTier?.god ?? 0;
  const conversationsActive = stats?.activeMembers ?? propConversationsActive ?? 0;
  const emailsSent = propEmailsSent ?? 0;
  const emailsReceived = propEmailsReceived ?? 0;

  // Calculate tier distribution
  const standardPoolSize = stats?.byTier?.standard ?? (poolSize - premiumPoolSize - privatePoolSize - godPoolSize);

  const tiers: PoolTier[] = [
    {
      name: "Standard",
      size: standardPoolSize,
      color: "bg-orange-500",
      icon: <Users className="w-4 h-4" />,
      description: "Free tier pool members",
      benefit: "Basic warmup with diverse domains",
    },
    {
      name: "Premium",
      size: premiumPoolSize,
      color: "bg-yellow-500",
      icon: <Crown className="w-4 h-4" />,
      description: "Aged accounts with high reputation",
      benefit: "+9% better deliverability",
    },
    {
      name: "Private",
      size: privatePoolSize,
      color: "bg-purple-500",
      icon: <Star className="w-4 h-4" />,
      description: "Enterprise-dedicated pool",
      benefit: "Isolated reputation building",
    },
  ];

  // Calculate percentages for visual distribution
  const totalPool = poolSize || 1;
  const standardPct = (standardPoolSize / totalPool) * 100;
  const premiumPct = (premiumPoolSize / totalPool) * 100;
  const privatePct = (privatePoolSize / totalPool) * 100;

  // Email flow ratio (response rate indicator)
  const responseRatio = emailsSent > 0 ? ((emailsReceived / emailsSent) * 100).toFixed(1) : "0";

  console.log("[WarmupPoolStats] Rendering pool stats:", {
    poolSize,
    premiumPoolSize,
    conversationsActive,
    emailsSent,
    emailsReceived,
  });

  return (
    <Card className={cn("overflow-hidden bg-[#080808]/50 border-orange-500/15", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <Globe className="w-5 h-5 text-orange-400" />
          Pool Network
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Global warmup partner network statistics
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Pool Size */}
        <div className="text-center p-4 bg-gradient-to-br from-cyan-500/10 to-orange-500/5 rounded-lg border border-orange-500/15">
          <motion.p
            className="text-4xl font-bold text-orange-400"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {poolSize.toLocaleString()}
          </motion.p>
          <p className="text-sm text-neutral-400 mt-1">
            Active Pool Members
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-500">Growing daily</span>
          </div>
        </div>

        {/* Pool Distribution Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Pool Distribution</span>
          </div>
          <div className="h-3 bg-[#111] rounded-full overflow-hidden flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="bg-orange-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${standardPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Standard: {standardPoolSize.toLocaleString()} ({standardPct.toFixed(1)}%)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="bg-yellow-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${premiumPct}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Premium: {premiumPoolSize.toLocaleString()} ({premiumPct.toFixed(1)}%)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="bg-purple-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${privatePct}%` }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Private: {privatePoolSize.toLocaleString()} ({privatePct.toFixed(1)}%)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Tier Breakdown */}
        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                tier.color + "/10",
                tier.name === "Standard" && "text-orange-500",
                tier.name === "Premium" && "text-yellow-500",
                tier.name === "Private" && "text-purple-500"
              )}>
                {tier.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-neutral-200">{tier.name}</span>
                  <Badge variant="outline" className="text-xs border-orange-500/20 text-neutral-300">
                    {tier.size.toLocaleString()}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 truncate">
                  {tier.benefit}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Metrics */}
        <div className="border-t border-orange-500/10 pt-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-neutral-200">
            <Zap className="w-4 h-4 text-yellow-500" />
            Today&apos;s Activity
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Active Conversations */}
            <div className="p-3 bg-white/[0.04] rounded-lg">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">Conversations</span>
              </div>
              <p className="text-xl font-bold text-white">{conversationsActive}</p>
            </div>

            {/* Response Rate */}
            <div className="p-3 bg-white/[0.04] rounded-lg">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Response Rate</span>
              </div>
              <p className="text-xl font-bold text-green-500">{responseRatio}%</p>
            </div>

            {/* Emails Sent */}
            <div className="p-3 bg-white/[0.04] rounded-lg">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Send className="w-4 h-4" />
                <span className="text-xs">Sent Today</span>
              </div>
              <p className="text-xl font-bold text-orange-500">{emailsSent}</p>
            </div>

            {/* Emails Received */}
            <div className="p-3 bg-white/[0.04] rounded-lg">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Inbox className="w-4 h-4" />
                <span className="text-xs">Received Today</span>
              </div>
              <p className="text-xl font-bold text-purple-500">{emailsReceived}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WarmupPoolStats;
