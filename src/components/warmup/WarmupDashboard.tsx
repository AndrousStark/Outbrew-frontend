"use client";

/**
 * WarmupDashboard.tsx
 *
 * Email warmup dashboard with:
 * - Real-time data streaming
 * - AI-powered insights and predictions
 * - Health score monitoring
 * - Peer network visualization
 *
 * @version 3.0.0
 * @author Metaminds AI Engineering
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Send,
  Inbox,
  RefreshCw,
  Settings,
  Play,
  Pause,
  BarChart3,
  Zap,
  Clock,
  Target,
  Globe,
  Server,
  Eye,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Crown,
  Star,
  Cpu,
  Brain,
  Network,
  Layers,
  Flame,
  Rocket,
  Diamond,
  Award,
  Radio,
  Wifi,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  PieChart,
  LineChart,
  AreaChart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { warmupAPI } from "@/lib/warmup-api";
import { warmupHealthAPI, type HealthBreakdownItem } from "@/lib/api";

// Import sub-components
import { HealthScoreCard } from "./HealthScoreCard";
import { WarmupPoolStats } from "./WarmupPoolStats";
import { ConversationFeed } from "./ConversationFeed";
import { InboxPlacementChart } from "./InboxPlacementChart";
import { BlacklistAlerts } from "./BlacklistAlerts";
import { WarmupScheduleConfig } from "./WarmupScheduleConfig";
import { NeuralNetworkViz } from "./NeuralNetworkViz";
import { RealtimeMetrics } from "./RealtimeMetrics";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { AccountEnrollmentWizard } from "./AccountEnrollmentWizard";

// ============================================================================
// Advanced Types & Interfaces
// ============================================================================

interface WarmupAccount {
  id: string;
  email: string;
  domain: string;
  tier: "standard" | "premium" | "enterprise" | "god";
  status: "active" | "paused" | "warming" | "cooldown" | "optimizing";
  healthScore: number;
  reputationScore: number;
  dailySent: number;
  dailyReceived: number;
  inboxRate: number;
  spamRate: number;
  bounceRate: number;
  conversationsActive: number;
  lastActivity: string;
  enrolledAt: string;
  warmupProgress: number;
  targetDailyVolume: number;
  currentDailyVolume: number;
  aiOptimizationEnabled: boolean;
  predictedHealthIn7Days: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  domainAge: number;
  dkimStatus: boolean;
  spfStatus: boolean;
  dmarcStatus: boolean;
}

interface DashboardStats {
  totalAccounts: number;
  activeAccounts: number;
  averageHealthScore: number;
  totalConversations: number;
  emailsSentToday: number;
  emailsReceivedToday: number;
  averageInboxRate: number;
  blacklistAlerts: number;
  poolSize: number;
  premiumPoolSize: number;
  enterprisePoolSize: number;
  globalRank: number;
  aiOptimizations: number;
  predictedGrowth: number;
  networkStrength: number;
  reputationTrend: "rising" | "stable" | "declining";
}

interface RealtimeEvent {
  id: string;
  type: "email_sent" | "email_received" | "conversation_started" | "placement_test" | "blacklist_alert" | "ai_optimization";
  timestamp: string;
  data: Record<string, unknown>;
  severity: "info" | "success" | "warning" | "error";
}

interface AIInsight {
  id: string;
  type: "recommendation" | "warning" | "prediction" | "achievement";
  title: string;
  description: string;
  impact: "low" | "medium" | "high" | "critical";
  actionRequired: boolean;
  suggestedAction?: string;
  confidence: number;
  generatedAt: string;
}

// ============================================================================
// Advanced Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const glowVariants = {
  glow: {
    boxShadow: [
      "0 0 20px rgba(59, 130, 246, 0.3)",
      "0 0 40px rgba(59, 130, 246, 0.6)",
      "0 0 20px rgba(59, 130, 246, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// Dashboard Data Helpers (uses shared warmup-api.ts)
// ============================================================================

function enrichStats(stats: Partial<DashboardStats>): DashboardStats {
  return {
    totalAccounts: stats.totalAccounts ?? 0,
    activeAccounts: stats.activeAccounts ?? 0,
    averageHealthScore: stats.averageHealthScore ?? 0,
    totalConversations: stats.totalConversations ?? 0,
    emailsSentToday: stats.emailsSentToday ?? 0,
    emailsReceivedToday: stats.emailsReceivedToday ?? 0,
    averageInboxRate: stats.averageInboxRate ?? 0,
    blacklistAlerts: stats.blacklistAlerts ?? 0,
    poolSize: stats.poolSize ?? 0,
    premiumPoolSize: stats.premiumPoolSize ?? 0,
    enterprisePoolSize: stats.enterprisePoolSize ?? 0,
    globalRank: stats.globalRank ?? 0,
    aiOptimizations: stats.aiOptimizations ?? 0,
    predictedGrowth: stats.predictedGrowth ?? 0,
    networkStrength: stats.networkStrength ?? 0,
    reputationTrend: stats.reputationTrend ?? "stable",
  };
}

function enrichAccounts(accounts: Partial<WarmupAccount>[]): WarmupAccount[] {
  if (accounts.length === 0) return [];
  return accounts.map((acc) => ({
    id: acc.id || crypto.randomUUID(),
    email: acc.email || "unknown@domain.com",
    domain: acc.domain || "domain.com",
    tier: acc.tier || "standard",
    status: acc.status || "active",
    healthScore: acc.healthScore ?? 0,
    reputationScore: acc.reputationScore ?? 0,
    dailySent: acc.dailySent ?? 0,
    dailyReceived: acc.dailyReceived ?? 0,
    inboxRate: acc.inboxRate ?? 0,
    spamRate: acc.spamRate ?? 0,
    bounceRate: acc.bounceRate ?? 0,
    conversationsActive: acc.conversationsActive ?? 0,
    lastActivity: acc.lastActivity || new Date().toISOString(),
    enrolledAt: acc.enrolledAt || new Date().toISOString(),
    warmupProgress: acc.warmupProgress ?? 0,
    targetDailyVolume: acc.targetDailyVolume ?? 0,
    currentDailyVolume: acc.currentDailyVolume ?? 0,
    aiOptimizationEnabled: acc.aiOptimizationEnabled ?? false,
    predictedHealthIn7Days: acc.predictedHealthIn7Days ?? 0,
    riskLevel: acc.riskLevel || "low",
    domainAge: acc.domainAge ?? 0,
    dkimStatus: acc.dkimStatus ?? false,
    spfStatus: acc.spfStatus ?? false,
    dmarcStatus: acc.dmarcStatus ?? false,
  }));
}

async function fetchDashboardData(): Promise<{
  stats: DashboardStats;
  accounts: WarmupAccount[];
  insights: AIInsight[];
  scoreBreakdown: HealthBreakdownItem[];
}> {
  try {
    const [statsData, statusData, insightsData, healthData] = await Promise.all([
      warmupAPI.getPoolStatistics().catch(() => ({})),
      warmupAPI.getStatus().catch(() => ({ accounts: [] } as any)),
      warmupAPI.getAIInsights().catch(() => ({ insights: [] })),
      warmupHealthAPI.getLatestScore().then((res) => res.data).catch(() => ({ has_score: false })),
    ]);

    return {
      stats: enrichStats(statsData as Partial<DashboardStats>),
      accounts: enrichAccounts((statusData as any).accounts || []),
      insights: (insightsData as any).insights || [],
      scoreBreakdown: (healthData as any).breakdown || [],
    };
  } catch (error) {
    console.error("[WarmupDashboard] Error fetching data:", error);
    return { stats: enrichStats({}), accounts: [], insights: [], scoreBreakdown: [] };
  }
}

// ============================================================================
// Glassmorphism Card Component
// ============================================================================

function GlassCard({
  children,
  className,
  glow = false,
  gradient = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  gradient?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-neutral-900/90 via-neutral-800/80 to-neutral-900/90",
        "backdrop-blur-xl border border-orange-500/15",
        "shadow-2xl shadow-black/20",
        glow && "ring-2 ring-primary/30",
        className
      )}
      variants={itemVariants}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      )}

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 opacity-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%", opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {children}
    </motion.div>
  );
}

// ============================================================================
// Animated Stat Card
// ============================================================================

function AnimatedStatCard({
  title,
  value,
  suffix = "",
  prefix = "",
  trend,
  trendValue,
  icon: Icon,
  color = "blue",
  description,
  sparklineData,
}: {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon: React.ElementType;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
  description?: string;
  sparklineData?: number[];
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const springValue = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    springValue.set(value);
    const unsubscribe = springValue.on("change", (v) => setDisplayValue(Math.round(v * 10) / 10));
    return unsubscribe;
  }, [value, springValue]);

  const colorClasses = {
    blue: "from-orange-500 to-orange-500 text-orange-400",
    green: "from-green-500 to-emerald-500 text-green-400",
    purple: "from-purple-500 to-pink-500 text-amber-400",
    orange: "from-orange-500 to-amber-500 text-orange-400",
    red: "from-red-500 to-rose-500 text-red-400",
    cyan: "from-cyan-500 to-teal-500 text-orange-400",
  };

  return (
    <GlassCard className="p-4" gradient>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1">
            <motion.span
              className={cn("text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent", colorClasses[color])}
            >
              {prefix}{displayValue.toLocaleString()}{suffix}
            </motion.span>
            {trend && (
              <span className={cn(
                "flex items-center text-xs font-medium",
                trend === "up" && "text-green-400",
                trend === "down" && "text-red-400",
                trend === "stable" && "text-neutral-400"
              )}>
                {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                {trendValue}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-neutral-500">{description}</p>
          )}
        </div>
        <motion.div
          className={cn("p-2 rounded-xl bg-gradient-to-br", colorClasses[color].split(" ")[0], colorClasses[color].split(" ")[1], "bg-opacity-20")}
          whileHover={{ rotate: 15, scale: 1.1 }}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
      </div>

      {/* Mini Sparkline */}
      {sparklineData && (
        <div className="mt-3 h-8 flex items-end gap-0.5">
          {sparklineData.map((val, i) => (
            <motion.div
              key={i}
              className={cn("flex-1 rounded-t bg-gradient-to-t", colorClasses[color].split(" ")[0], colorClasses[color].split(" ")[1])}
              initial={{ height: 0 }}
              animate={{ height: `${(val / Math.max(...sparklineData)) * 100}%` }}
              transition={{ delay: i * 0.05, type: "spring" }}
              style={{ opacity: 0.3 + (i / sparklineData.length) * 0.7 }}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ============================================================================
// Circular Progress Ring
// ============================================================================

function CircularProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  color = "blue",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSpring(0, { stiffness: 50, damping: 20 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    progress.set(value);
    const unsubscribe = progress.on("change", (v) => setDisplayValue(Math.round(v)));
    return unsubscribe;
  }, [value, progress]);

  const strokeDashoffset = useTransform(progress, [0, 100], [circumference, 0]);

  const gradientId = `gradient-${color}`;
  const gradients = {
    blue: ["#3B82F6", "#06B6D4"],
    green: ["#10B981", "#34D399"],
    purple: ["#8B5CF6", "#EC4899"],
    orange: ["#F59E0B", "#EF4444"],
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradients[color][0]} />
            <stop offset="100%" stopColor={gradients[color][1]} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-800"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          filter="url(#glow)"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-white"
          key={displayValue}
        >
          {displayValue}%
        </motion.span>
        {label && <span className="text-xs text-neutral-400 mt-1">{label}</span>}
        {sublabel && <span className="text-xs text-neutral-500">{sublabel}</span>}
      </div>
    </div>
  );
}

// ============================================================================
// Live Activity Feed
// ============================================================================

function LiveActivityFeed({ events }: { events: RealtimeEvent[] }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm font-medium text-white">Live Activity</span>
        </div>
        <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
          <Radio className="w-3 h-3 mr-1" />
          Real-time
        </Badge>
      </div>

      <ScrollArea className="h-[200px]">
        <AnimatePresence mode="popLayout">
          {events.slice(0, 10).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex items-center gap-3 py-2 border-b border-orange-500/10/50 last:border-0"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                event.type === "email_sent" && "bg-orange-500/20 text-orange-400",
                event.type === "email_received" && "bg-green-500/20 text-green-400",
                event.type === "conversation_started" && "bg-purple-500/20 text-amber-400",
                event.type === "placement_test" && "bg-orange-500/20 text-orange-400",
                event.type === "blacklist_alert" && "bg-red-500/20 text-red-400",
                event.type === "ai_optimization" && "bg-cyan-500/20 text-orange-400"
              )}>
                {event.type === "email_sent" && <Send className="w-4 h-4" />}
                {event.type === "email_received" && <Inbox className="w-4 h-4" />}
                {event.type === "conversation_started" && <MessageSquare className="w-4 h-4" />}
                {event.type === "placement_test" && <Target className="w-4 h-4" />}
                {event.type === "blacklist_alert" && <AlertTriangle className="w-4 h-4" />}
                {event.type === "ai_optimization" && <Brain className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {event.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
                <p className="text-xs text-neutral-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
    </GlassCard>
  );
}

// ============================================================================
// Main Dashboard Component
// ============================================================================

export function WarmupDashboard() {
  const userEmail = useAuthStore((s) => s.user?.email);
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEnrollmentWizard, setShowEnrollmentWizard] = useState(false);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    accounts: WarmupAccount[];
    insights: AIInsight[];
    scoreBreakdown: HealthBreakdownItem[];
  } | null>(null);

  // Auto-refresh interval
  const REFRESH_INTERVAL = 30000;

  // Fetch data and setup realtime
  useEffect(() => {
    console.log("[WarmupDashboard] Initializing dashboard...");

    const loadData = async () => {
      const data = await fetchDashboardData();
      setDashboardData(data);
      setIsLoading(false);
    };

    loadData();

    // Setup realtime connection
    let eventSource: EventSource | null = null;
    warmupAPI.connectToRealtimeEvents((event) => {
      setRealtimeEvents((prev) => [event as unknown as RealtimeEvent, ...prev].slice(0, 50));
    }).then((es) => { eventSource = es; });

    // Setup auto-refresh
    const refreshInterval = setInterval(loadData, REFRESH_INTERVAL);

    return () => {
      eventSource?.close();
      clearInterval(refreshInterval);
    };
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
      toast.success("Dashboard refreshed with latest AI insights");
    } catch (error) {
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-0.5">
            <div className="w-full h-full rounded-2xl bg-[#080808] flex items-center justify-center">
              <Shield className="w-7 h-7 text-white animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">Loading Warmup Dashboard</h3>
            <p className="text-neutral-400 text-sm mt-1">Fetching your warmup data...</p>
          </div>
          <div className="w-48 h-1 bg-[#111] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  const { stats, accounts, insights, scoreBreakdown } = dashboardData!;

  return (
    <TooltipProvider>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Ultra Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-2xl bg-[#080808] flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                Email Warmup Pool
              </h1>
              <p className="text-neutral-400 mt-1">
                Build sender reputation with AI-powered peer-to-peer warming
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 border-orange-500/15 hover:border-orange-500/50"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setShowEnrollmentWizard(true)}
              className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-500"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </Button>
          </div>
        </motion.div>

        {/* Ultra Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatedStatCard
            title="Health Score"
            value={stats.averageHealthScore}
            suffix="%"
            trend={stats.reputationTrend === "rising" ? "up" : stats.reputationTrend === "declining" ? "down" : "stable"}
            icon={Activity}
            color="green"
            description="7-day average"
          />
          <AnimatedStatCard
            title="Inbox Rate"
            value={stats.averageInboxRate}
            suffix="%"
            icon={Inbox}
            color="blue"
            description="Primary inbox delivery"
          />
          <AnimatedStatCard
            title="Pool Network"
            value={stats.poolSize}
            icon={Network}
            color="purple"
            description="Global partners"
          />
          <AnimatedStatCard
            title="Active Convos"
            value={stats.totalConversations}
            icon={MessageSquare}
            color="cyan"
            description="AI-managed threads"
          />
          <AnimatedStatCard
            title="Sent Today"
            value={stats.emailsSentToday}
            icon={Send}
            color="orange"
            description="Warmup emails"
          />
          <AnimatedStatCard
            title="AI Optimizations"
            value={stats.aiOptimizations}
            icon={Brain}
            color="purple"
            description="Auto-adjustments today"
          />
        </motion.div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <motion.div variants={itemVariants}>
            <TabsList className="bg-[#080808]/50 border border-orange-500/10 p-1 rounded-xl">
              {[
                { id: "overview", label: "Overview", icon: BarChart3, tip: "Health scores, pool stats, and inbox placement at a glance" },
                { id: "accounts", label: "Accounts", icon: Mail, tip: "Manage enrolled email accounts and their warmup status" },
                { id: "network", label: "Peer Network", icon: Network, tip: "Visualize connections between warmup pool members" },
                { id: "ai-insights", label: "AI Insights", icon: Brain, tip: "AI-generated recommendations to improve deliverability" },
                { id: "conversations", label: "Conversations", icon: MessageSquare, tip: "Peer-to-peer email threads that build sender reputation" },
                { id: "security", label: "Security", icon: Shield, tip: "Blacklist monitoring and schedule configuration" },
              ].map((tab) => (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={tab.id}
                      className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-purple-500/20"
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                    {tab.tip}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Health Score Card */}
              <motion.div variants={itemVariants}>
                <HealthScoreCard
                  score={stats.averageHealthScore}
                  inboxRate={stats.averageInboxRate}
                  accounts={accounts}
                  scoreBreakdown={scoreBreakdown}
                />
              </motion.div>

              {/* Pool Statistics */}
              <motion.div variants={itemVariants}>
                <WarmupPoolStats
                  poolSize={stats.poolSize}
                  premiumPoolSize={stats.premiumPoolSize}
                  conversationsActive={stats.totalConversations}
                  emailsSent={stats.emailsSentToday}
                  emailsReceived={stats.emailsReceivedToday}
                />
              </motion.div>

              {/* Live Activity Feed */}
              <motion.div variants={itemVariants}>
                <LiveActivityFeed events={realtimeEvents} />
              </motion.div>
            </div>

            {/* AI Insights Preview */}
            <motion.div variants={itemVariants}>
              <AIInsightsPanel insights={insights} compact />
            </motion.div>

            {/* Inbox Placement Chart */}
            <motion.div variants={itemVariants}>
              <InboxPlacementChart placements={[]} />
            </motion.div>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  isSelected={selectedAccountId === account.id}
                  onSelect={() => setSelectedAccountId(account.id)}
                />
              ))}

              {accounts.length === 0 && (
                <GlassCard className="p-12">
                  <div className="text-center">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Mail className="w-10 h-10 text-orange-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">No Accounts Enrolled</h3>
                    <p className="text-neutral-400 mb-6">
                      Add your first email account to start building sender reputation
                    </p>
                    <Button
                      onClick={() => setShowEnrollmentWizard(true)}
                      className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500"
                    >
                      <Rocket className="w-4 h-4" />
                      Enroll First Account
                    </Button>
                  </div>
                </GlassCard>
              )}
            </div>
          </TabsContent>

          {/* Neural Network Tab */}
          <TabsContent value="network" className="space-y-4 mt-4">
            <NeuralNetworkViz
              accounts={accounts}
              poolSize={stats.poolSize}
              networkStrength={stats.networkStrength}
            />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-4 mt-4">
            <AIInsightsPanel insights={insights} />
            <RealtimeMetrics stats={stats} />
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-4 mt-4">
            <ConversationFeed
              conversations={[]}
              selectedAccountId={selectedAccountId}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <BlacklistAlerts alerts={[]} showAll />
              <WarmupScheduleConfig
                selectedAccountId={selectedAccountId}
                onSave={handleRefresh}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Enrollment Wizard Modal */}
        {showEnrollmentWizard && (
          <AccountEnrollmentWizard
            onClose={() => setShowEnrollmentWizard(false)}
            onComplete={() => {
              setShowEnrollmentWizard(false);
              handleRefresh();
            }}
            defaultEmail={userEmail}
          />
        )}
      </motion.div>
    </TooltipProvider>
  );
}

// ============================================================================
// Account Card Component
// ============================================================================

function AccountCard({
  account,
  isSelected,
  onSelect,
}: {
  account: WarmupAccount;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const tierConfig = {
    standard: { color: "blue", icon: Users, label: "Standard", bgColor: "bg-blue-500/20", textColor: "text-blue-400", borderColor: "border-blue-500/30" },
    premium: { color: "yellow", icon: Crown, label: "Premium", bgColor: "bg-yellow-500/20", textColor: "text-yellow-400", borderColor: "border-yellow-500/30" },
    enterprise: { color: "purple", icon: Diamond, label: "Enterprise", bgColor: "bg-purple-500/20", textColor: "text-purple-400", borderColor: "border-purple-500/30" },
    god: { color: "pink", icon: Sparkles, label: "Enterprise", bgColor: "bg-pink-500/20", textColor: "text-pink-400", borderColor: "border-pink-500/30" },
  };

  const config = tierConfig[account.tier];
  const TierIcon = config.icon;

  return (
    <GlassCard
      className={cn(
        "p-5 cursor-pointer transition-all",
        isSelected && "ring-2 ring-orange-500/50"
      )}
      glow={isSelected}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center",
              config.bgColor
            )}
            whileHover={{ rotate: 15 }}
          >
            <TierIcon className={cn("w-7 h-7", config.textColor)} />
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{account.email}</span>
              <Badge className={cn(
                "text-xs",
                account.status === "active" && "bg-green-500/20 text-green-400",
                account.status === "warming" && "bg-yellow-500/20 text-yellow-400",
                account.status === "paused" && "bg-neutral-500/20 text-neutral-400"
              )}>
                {account.status}
              </Badge>
              <Badge variant="outline" className={cn(config.textColor, config.borderColor)}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-neutral-400 mt-1">{account.domain}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* DNS Status */}
          <div className="flex items-center gap-1">
            {account.spfStatus && <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">SPF</Badge>}
            {account.dkimStatus && <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">DKIM</Badge>}
            {account.dmarcStatus && <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">DMARC</Badge>}
          </div>

          {/* AI Badge */}
          {account.aiOptimizationEnabled && (
            <Tooltip>
              <TooltipTrigger>
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  <Brain className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </TooltipTrigger>
              <TooltipContent>AI Optimization Enabled</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <Separator className="my-4 bg-[#111]" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="text-center">
          <CircularProgressRing value={account.healthScore} size={60} strokeWidth={4} color="green" />
          <p className="text-xs text-neutral-400 mt-1">Health</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-400">{account.inboxRate.toFixed(1)}%</p>
          <p className="text-xs text-neutral-400">Inbox Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{account.dailySent}/{account.targetDailyVolume}</p>
          <p className="text-xs text-neutral-400">Daily Sent</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-400">{account.conversationsActive}</p>
          <p className="text-xs text-neutral-400">Active Convos</p>
        </div>
        <div className="text-center">
          <p className={cn(
            "text-2xl font-bold",
            account.riskLevel === "low" && "text-green-400",
            account.riskLevel === "medium" && "text-yellow-400",
            account.riskLevel === "high" && "text-orange-400",
            account.riskLevel === "critical" && "text-red-400"
          )}>
            {account.riskLevel.toUpperCase()}
          </p>
          <p className="text-xs text-neutral-400">Risk Level</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Warmup Progress</span>
          <span className="text-white font-medium">{account.warmupProgress}%</span>
        </div>
        <div className="h-2 bg-[#111] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${account.warmupProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-neutral-500">
          Predicted health in 7 days: <span className="text-green-400">{account.predictedHealthIn7Days}%</span>
        </p>
      </div>
    </GlassCard>
  );
}

export default WarmupDashboard;
