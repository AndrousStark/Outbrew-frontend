"use client";

/**
 * Email Warmup System - Full Dashboard Page
 *
 * Complete warmup management interface with:
 * - Real-time metrics and health monitoring
 * - AI-powered insights and predictions
 * - Account enrollment wizard
 * - Pool statistics and peer-to-peer conversation scheduling
 */

import React, { useState, useEffect, useRef } from "react";
import { PremiumGate } from "@/components/PremiumGate";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Sparkles,
  Flame,
  Activity,
  Users,
  Brain,
  Zap,
  AlertTriangle,
  Inbox,
  CheckCircle,
  Settings,
  Plus,
  RefreshCw,
  BarChart3,
  Target,
  Network,
  Clock,
  Mail,
  MessageSquare,
  ChevronRight,
  Play,
  Pause,
  ExternalLink,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Import warmup components
import {
  WarmupDashboard,
  HealthScoreCard,
  WarmupPoolStats,
  ConversationFeed,
  InboxPlacementChart,
  BlacklistAlerts,
  WarmupScheduleConfig,
  NeuralNetworkViz,
  AIInsightsPanel,
  RealtimeMetrics,
  AccountEnrollmentWizard,
  MLIntelligenceDashboard,
  ContentOptimizer,
} from "@/components/warmup";

import { warmupAPI, type DashboardData, type AIInsight, type RealtimeStats } from "@/lib/warmup-api";
import { useAuthStore } from "@/store/authStore";
import { emailWarmingAPI } from "@/lib/api";
import { WarmupHealthBadge } from "@/components/warmup/WarmupHealthBadge";
import { EmailWarmingSettings } from "@/components/EmailWarmingSettings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ============================================================================
// Types
// ============================================================================

interface WarmupState {
  isLoading: boolean;
  isEnrolled: boolean;
  dashboardData: DashboardData | null;
  aiInsights: AIInsight[];
  realtimeStats: RealtimeStats | null;
  error: string | null;
}

// ============================================================================
// Quick Stats Component
// ============================================================================

function QuickStats({ data }: { data: DashboardData }) {
  const stats = [
    {
      label: "Health Score",
      value: `${data.member?.quality_score || 0}%`,
      icon: Shield,
      color: "text-green-400",
      bgColor: "from-green-500/20 to-emerald-500/20",
    },
    {
      label: "Emails Today",
      value: data.daily_usage?.sends_today || 0,
      icon: Mail,
      color: "text-orange-400",
      bgColor: "from-orange-500/20 to-orange-500/20",
    },
    {
      label: "Inbox Rate",
      value: `${data.placement_test?.inbox_rate || 0}%`,
      icon: Inbox,
      color: "text-amber-400",
      bgColor: "from-purple-500/20 to-pink-500/20",
    },
    {
      label: "Pool Size",
      value: data.pool_stats?.total_members || 0,
      icon: Users,
      color: "text-orange-400",
      bgColor: "from-orange-500/20 to-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          className={cn(
            "p-4 rounded-xl bg-gradient-to-br border border-orange-500/15",
            stat.bgColor
          )}
          whileHover={{ scale: 1.02, y: -2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={cn("w-4 h-4", stat.color)} />
            <span className="text-xs text-neutral-400">{stat.label}</span>
          </div>
          <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// Enrollment CTA Component
// ============================================================================

function EnrollmentCTA({ onEnroll }: { onEnroll: () => void }) {
  return (
    <motion.div
      className="min-h-[60vh] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="max-w-2xl w-full bg-gradient-to-br from-neutral-900/90 via-neutral-800/80 to-neutral-900/90 backdrop-blur-xl border-orange-500/15">
        <CardContent className="p-8 text-center">
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 30px rgba(16, 185, 129, 0.3)",
                "0 0 60px rgba(16, 185, 129, 0.5)",
                "0 0 30px rgba(16, 185, 129, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Email Warmup
          </h2>

          <p className="text-neutral-400 mb-4 max-w-lg mx-auto">
            Email warmup gradually increases your sending volume so email providers
            trust your account. Without it, your cold emails may land in spam.
          </p>

          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            Our AI-powered peer-to-peer network builds your sender reputation
            automatically — just enroll and we handle the rest.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Brain, label: "AI Optimization" },
              { icon: Network, label: "Peer Network" },
              { icon: Shield, label: "Spam Protection" },
              { icon: BarChart3, label: "Analytics" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="p-4 rounded-lg bg-white/[0.04] border border-orange-500/15"
              >
                <feature.icon className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <p className="text-xs text-neutral-400">{feature.label}</p>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            onClick={onEnroll}
          >
            <Plus className="w-5 h-5" />
            Enroll Now - Free
            <ChevronRight className="w-5 h-5" />
          </Button>

          <p className="text-xs text-neutral-500 mt-4">
            No credit card required. Start warming up your email today.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Control Bar Component
// ============================================================================

function ControlBar({
  data,
  onRefresh,
  onToggleStatus,
  onSettings,
  isRefreshing,
}: {
  data: DashboardData;
  onRefresh: () => void;
  onToggleStatus: () => void;
  onSettings?: () => void;
  isRefreshing: boolean;
}) {
  const isActive = data.member?.is_active;
  const tier = data.member?.tier || "standard";

  const tierLabels: Record<string, string> = {
    standard: "Starter",
    premium: "Pro",
    enterprise: "Enterprise",
    god: "Enterprise",
  };

  const tierColors: Record<string, string> = {
    standard: "from-neutral-500 to-neutral-600",
    premium: "from-purple-500 to-pink-500",
    enterprise: "from-amber-500 to-orange-500",
    god: "from-amber-500 to-orange-500",
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-white/[0.04] border border-orange-500/15">
      <div className="flex items-center gap-4">
        <Badge
          className={cn(
            "text-white px-4 py-1 bg-gradient-to-r",
            tierColors[tier] || tierColors.standard
          )}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {tierLabels[tier] || "Starter"}
        </Badge>

        <Badge
          variant="outline"
          className={cn(
            "px-4 py-1",
            isActive
              ? "border-green-500/50 text-green-400"
              : "border-yellow-500/50 text-yellow-400"
          )}
        >
          <motion.div
            className={cn(
              "w-2 h-2 rounded-full mr-2",
              isActive ? "bg-green-500" : "bg-yellow-500"
            )}
            animate={{ scale: isActive ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
          />
          {isActive ? "ACTIVE" : "PAUSED"}
        </Badge>

        {data.alert_count && data.alert_count > 0 && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {data.alert_count} Alert{data.alert_count > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-neutral-300 border-orange-500/20 hover:text-white hover:bg-[#1a1a1a]"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("w-4 h-4", isRefreshing && "animate-spin")}
          />
          Refresh
        </Button>

        <Button
          variant={isActive ? "outline" : "default"}
          size="sm"
          className={cn(
            "gap-2",
            isActive
              ? "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              : "bg-green-500 hover:bg-green-600"
          )}
          onClick={onToggleStatus}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4" />
              Pause Warmup
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Resume Warmup
            </>
          )}
        </Button>

        <Button variant="ghost" size="sm" className="gap-2 text-neutral-300 hover:text-white hover:bg-[#1a1a1a]" onClick={onSettings}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function WarmupPage() {
  const { toast } = useToast();
  const userEmail = useAuthStore((s) => s.user?.email);
  const [state, setState] = useState<WarmupState>({
    isLoading: true,
    isEnrolled: false,
    dashboardData: null,
    aiInsights: [],
    realtimeStats: null,
    error: null,
  });
  const [showEnrollmentWizard, setShowEnrollmentWizard] = useState(false);
  const [showWarmupSettings, setShowWarmupSettings] = useState(false);
  const [hasWarmupConfig, setHasWarmupConfig] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboard = async () => {
    console.log("[WarmupPage] Loading dashboard data...");
    const startTime = Date.now();

    try {
      setIsRefreshing(true);
      console.log("[WarmupPage] Fetching dashboard, insights, and stats in parallel");

      const [dashboard, insights, stats] = await Promise.all([
        warmupAPI.getDashboard(),
        warmupAPI.getAIInsights(10, true).catch((err) => {
          console.warn("[WarmupPage] Failed to load AI insights:", err);
          return { insights: [] };
        }),
        warmupAPI.getRealtimeStats().catch((err) => {
          console.warn("[WarmupPage] Failed to load realtime stats:", err);
          return null;
        }),
      ]);

      const elapsed = Date.now() - startTime;
      console.log("[WarmupPage] Dashboard loaded successfully:", {
        enrolled: dashboard.enrolled,
        memberId: dashboard.member?.id,
        healthScore: dashboard.member?.quality_score,
        insightsCount: insights.insights?.length || 0,
        hasRealtimeStats: !!stats,
        loadTimeMs: elapsed,
      });

      setState({
        isLoading: false,
        isEnrolled: dashboard.enrolled,
        dashboardData: dashboard,
        aiInsights: insights.insights || [],
        realtimeStats: stats,
        error: null,
      });

      // Check if warmup config exists (needed for actual sending)
      if (dashboard.enrolled) {
        emailWarmingAPI.getConfig()
          .then((res) => setHasWarmupConfig(!!res?.data))
          .catch((err: any) => {
            // 404 = no config yet (expected). Other errors = real problem.
            if (err?.response?.status === 404) {
              setHasWarmupConfig(false);
            }
            // For other errors, leave as undefined (don't show misleading banner)
          });
      }
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error("[WarmupPage] Failed to load dashboard:", {
        error,
        loadTimeMs: elapsed,
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load dashboard",
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect for polling — uses ref to avoid stale closure
  const isEnrolledRef = useRef(state.isEnrolled);
  useEffect(() => {
    isEnrolledRef.current = state.isEnrolled;
  }, [state.isEnrolled]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (isEnrolledRef.current) {
        warmupAPI.getRealtimeStats().then((stats) => {
          setState((prev) => ({ ...prev, realtimeStats: stats }));
        }).catch(() => {});
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  // Handle warmup status toggle
  const handleToggleStatus = async () => {
    if (!state.dashboardData?.member) {
      console.warn("[WarmupPage] Cannot toggle status - no member data");
      return;
    }

    const isActive = state.dashboardData.member.is_active;
    const action = isActive ? "pause" : "resume";

    console.log("[WarmupPage] Toggling warmup status:", {
      currentStatus: isActive ? "active" : "paused",
      action,
      memberId: state.dashboardData.member.id,
    });

    try {
      const result = await warmupAPI.updateStatus(action);
      console.log("[WarmupPage] Status update successful:", result);

      toast({
        title: isActive ? "Warmup Paused" : "Warmup Resumed",
        description: isActive
          ? "Email warmup has been paused."
          : "Email warmup is now active.",
      });
      loadDashboard();
    } catch (error) {
      console.error("[WarmupPage] Failed to toggle warmup status:", error);
      toast({
        title: "Error",
        description: `Failed to ${action} warmup`,
        variant: "destructive",
      });
    }
  };

  // Handle enrollment completion
  const handleEnrollmentComplete = () => {
    setShowEnrollmentWizard(false);
    toast({
      title: "Welcome to the Warmup Pool!",
      description: "Your account is now warming up. Check back for insights.",
    });
    loadDashboard();
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Warmup</h3>
            <p className="text-red-400 mb-4">{state.error}</p>
            <Button onClick={loadDashboard}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enrollment wizard
  if (showEnrollmentWizard) {
    return (
      <div className="container mx-auto p-6">
        <AccountEnrollmentWizard
          onComplete={handleEnrollmentComplete}
          onClose={() => setShowEnrollmentWizard(false)}
          defaultEmail={userEmail}
        />
      </div>
    );
  }

  // Not enrolled - show CTA
  if (!state.isEnrolled) {
    return (
      <div className="container mx-auto p-6">
        <EnrollmentCTA onEnroll={() => setShowEnrollmentWizard(true)} />
      </div>
    );
  }

  // Main dashboard
  const dashboardData = state.dashboardData!;

  return (
    <PremiumGate feature="Email Warmup">
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Flame className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Email Warmup
            </h1>
            <p className="text-neutral-400">
              Build sender reputation so your emails land in the inbox, not spam
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <WarmupHealthBadge score={dashboardData.member?.quality_score || 0} />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-neutral-300 border-orange-500/20 hover:text-white hover:bg-[#1a1a1a]"
            onClick={() => toast({ title: "Documentation", description: "Warmup documentation is coming soon." })}
          >
            <ExternalLink className="w-4 h-4" />
            Help
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <ControlBar
        data={dashboardData}
        onRefresh={loadDashboard}
        onToggleStatus={handleToggleStatus}
        onSettings={() => setShowWarmupSettings(true)}
        isRefreshing={isRefreshing}
      />

      {/* Quick Stats */}
      <QuickStats data={dashboardData} />

      {/* Campaign CTA — show when warmup health is good */}
      {(dashboardData.member?.quality_score || 0) >= 75 && (
        <motion.div
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium text-white">Your email is warmed up and ready!</p>
                <p className="text-sm text-neutral-400">
                  Health score is {dashboardData.member?.quality_score}% — a great time to start sending campaigns.
                </p>
              </div>
            </div>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.location.href = "/campaigns/create/step1-source"}
            >
              <Rocket className="w-4 h-4" />
              Create Campaign
            </Button>
          </div>
        </motion.div>
      )}

      {/* Warmup Config Setup Banner */}
      {hasWarmupConfig === false && (
        <motion.div
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-medium text-white">Warmup not configured</p>
                <p className="text-sm text-neutral-400">
                  Configure your SMTP settings and warmup schedule to start sending warmup emails.
                </p>
              </div>
            </div>
            <Button
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => setShowWarmupSettings(true)}
            >
              <Settings className="w-4 h-4" />
              Configure Warmup
            </Button>
          </div>
        </motion.div>
      )}

      {/* Warmup Settings Dialog */}
      <Dialog open={showWarmupSettings} onOpenChange={setShowWarmupSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#080808] border-orange-500/15 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Warmup Configuration</DialogTitle>
          </DialogHeader>
          <EmailWarmingSettings />
        </DialogContent>
      </Dialog>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-white/[0.04] border border-orange-500/15 overflow-x-auto">
          <TabsTrigger value="overview" className="gap-2 text-neutral-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="gap-2 text-neutral-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]">
            <Brain className="w-4 h-4" />
            AI & ML
          </TabsTrigger>
          <TabsTrigger value="conversations" className="gap-2 text-neutral-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]">
            <MessageSquare className="w-4 h-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2 text-neutral-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]">
            <Network className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-neutral-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]">
            <Shield className="w-4 h-4" />
            Security & Schedule
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <HealthScoreCard
              score={dashboardData.member?.quality_score || 0}
            />
            <div className="lg:col-span-2">
              <RealtimeMetrics
                stats={{
                  totalAccounts: 1,
                  activeAccounts: dashboardData.member?.is_active ? 1 : 0,
                  averageHealthScore: dashboardData.member?.quality_score || 0,
                  totalConversations: dashboardData.pool_stats?.active_members || 0,
                  emailsSentToday: dashboardData.daily_usage?.sends_today || 0,
                  emailsReceivedToday: dashboardData.daily_usage?.receives_today || 0,
                  averageInboxRate: dashboardData.placement_test?.inbox_rate || 0,
                  blacklistAlerts: dashboardData.blacklist_status?.total_listings || 0,
                  poolSize: dashboardData.pool_stats?.total_members || 0,
                  premiumPoolSize: 0,
                  networkStrength: 0,
                  reputationTrend: "stable",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WarmupPoolStats
              stats={{
                totalMembers: dashboardData.pool_stats?.total_members || 0,
                activeMembers: dashboardData.pool_stats?.active_members || 0,
                byTier: { standard: 0, premium: 0, enterprise: 0, god: 0 },
                avgQualityScore: dashboardData.pool_stats?.avg_quality_score || 0,
              }}
            />
            <InboxPlacementChart
              data={{
                gmail: {
                  inbox: dashboardData.placement_test?.inbox_rate || 0,
                  spam: 0,
                  missing: 0,
                },
              }}
              lastTestDate={dashboardData.placement_test?.test_date}
            />
          </div>
        </TabsContent>

        {/* AI & ML Tab — combines AI Insights, ML Engine, and Content Optimizer */}
        <TabsContent value="ai-insights" className="space-y-6">
          <AIInsightsPanel
            insights={state.aiInsights.map((insight) => ({
              id: insight.id,
              type: insight.type,
              title: insight.title,
              description: insight.description,
              impact: insight.impact,
              actionRequired: insight.action_required,
              suggestedAction: insight.suggested_action,
              confidence: insight.confidence,
              generatedAt: insight.generated_at,
            }))}
          />

          <Card className="bg-gradient-to-br from-purple-500/10 to-amber-500/10 border-purple-500/20 !bg-[#0f172a]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-400" />
                ML Intelligence Engine
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Deep learning models for warmup optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MLIntelligenceDashboard refreshInterval={30000} />
            </CardContent>
          </Card>

          <Card className="!bg-[#080808] border-orange-500/15">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Content Optimizer
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Optimize email content for deliverability and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentOptimizer
                onSelectSubject={(subject) => {
                  toast({
                    title: "Subject Selected",
                    description: `"${subject.slice(0, 50)}${subject.length > 50 ? '...' : ''}" copied to clipboard`,
                  });
                }}
                onApplySuggestion={(suggestion) => {
                  toast({
                    title: "Suggestion Applied",
                    description: suggestion.slice(0, 100),
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-6">
          <ConversationFeed
            conversations={[]}
            onLoadMore={() => {}}
          />
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6">
          <NeuralNetworkViz memberScore={dashboardData.member?.quality_score || 0} />
        </TabsContent>

        {/* Security & Schedule Tab — combines Blacklist, Schedule, and Testing */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlacklistAlerts
              alerts={(dashboardData.alerts || [])
                .filter((a) => a.type === "blacklist")
                .map((a, idx) => ({
                  id: `alert-${idx}`,
                  blacklistName: a.title || "Unknown",
                  severity: (a.severity === "critical" ? "critical" : a.severity === "high" ? "warning" : "info") as "critical" | "warning" | "info",
                  domain: dashboardData.member?.tier || "domain.com",
                  detectedAt: new Date().toISOString(),
                  status: "active" as const,
                  description: a.message,
                }))}
              showAll
            />
            <WarmupScheduleConfig
              onUpdate={() => {
                toast({ title: "Schedule Updated", description: "Your warmup schedule has been saved." });
              }}
            />
          </div>

          {/* Inbox Placement Testing */}
          <Card className="bg-[#080808]/50 border-orange-500/15">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                Inbox Placement Testing
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Run tests to verify deliverability across major providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {["Standard Test", "Deep Analysis", "Provider Specific"].map((test) => (
                  <Button
                    key={test}
                    variant="outline"
                    className="h-20 flex flex-col gap-2 border-orange-500/20 text-neutral-300 hover:text-white hover:bg-[#111]"
                    onClick={() => toast({ title: "Test Started", description: `Running ${test}...` })}
                  >
                    <Target className="w-5 h-5" />
                    {test}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </PremiumGate>
  );
}
