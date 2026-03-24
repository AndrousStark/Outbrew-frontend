"use client";

/**
 * RealtimeMetrics.tsx
 *
 * Real-time metrics visualization with animated charts
 * Features live data streaming and performance tracking
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Gauge,
  Zap,
  Target,
  Timer,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

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
  enterprisePoolSize?: number;
  globalRank?: number;
  aiOptimizations?: number;
  predictedGrowth?: number;
  networkStrength?: number;
  reputationTrend?: "rising" | "stable" | "declining";
}

interface RealtimeMetricsProps {
  stats: DashboardStats;
}

interface MetricData {
  timestamp: number;
  value: number;
}

// ============================================================================
// Live Sparkline Component
// ============================================================================

function LiveSparkline({
  data,
  color,
  height = 40,
}: {
  data: number[];
  color: string;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  if (data.length < 2) {
    return null;
  }

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} 100,${height}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <motion.polygon
        points={areaPoints}
        fill={`url(#gradient-${color})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Line */}
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Current value dot */}
      {data.length > 0 && (
        <motion.circle
          cx="100"
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r="3"
          fill={color}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </svg>
  );
}

// ============================================================================
// Gauge Meter Component
// ============================================================================

function getScoreColor(value: number): string {
  if (value >= 80) return "#10B981"; // green
  if (value >= 60) return "#3B82F6"; // blue
  if (value >= 40) return "#F59E0B"; // yellow
  return "#EF4444"; // red
}

function getScoreLabel(value: number): { text: string; color: string } {
  if (value >= 80) return { text: "Excellent", color: "text-green-400" };
  if (value >= 60) return { text: "Good", color: "text-orange-400" };
  if (value >= 40) return { text: "Needs Work", color: "text-yellow-400" };
  return { text: "Critical", color: "text-red-400" };
}

function GaugeMeter({
  value,
  maxValue = 100,
  label,
  color,
  size = 120,
}: {
  value: number;
  maxValue?: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const resolvedColor = color || getScoreColor(value);
  const benchmark = getScoreLabel(value);
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 10} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value arc */}
          <motion.path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <motion.span
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {value.toFixed(1)}%
          </motion.span>
        </div>
      </div>
      <span className="text-xs text-neutral-400 mt-1">{label}</span>
      <span className={cn("text-[10px] font-semibold mt-0.5", benchmark.color)}>
        {benchmark.text}
      </span>
    </div>
  );
}

// ============================================================================
// Metric Card Component
// ============================================================================

function MetricCard({
  title,
  value,
  previousValue,
  suffix = "",
  icon: Icon,
  color,
  sparklineData,
}: {
  title: string;
  value: number;
  previousValue?: number;
  suffix?: string;
  icon: React.ElementType;
  color: string;
  sparklineData?: number[];
}) {
  const trend = previousValue !== undefined
    ? value > previousValue ? "up" : value < previousValue ? "down" : "stable"
    : undefined;

  const change = previousValue !== undefined
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : undefined;

  return (
    <motion.div
      className="p-4 rounded-xl bg-white/[0.04] border border-orange-500/15"
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs text-neutral-400">{title}</span>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs",
            trend === "up" && "text-green-400",
            trend === "down" && "text-red-400",
            trend === "stable" && "text-neutral-400"
          )}>
            {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
            {trend === "stable" && <Minus className="w-3 h-3" />}
            {change}%
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}{suffix}
      </p>

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3">
          <LiveSparkline data={sparklineData} color={color} height={30} />
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function RealtimeMetrics({ stats }: RealtimeMetricsProps) {
  // Historical data for sparklines -- starts empty, builds over time from real stats
  const [historicalData, setHistoricalData] = useState<{
    healthScore: number[];
    inboxRate: number[];
    sent: number[];
    received: number[];
  }>({
    healthScore: [],
    inboxRate: [],
    sent: [],
    received: [],
  });

  // Append real stats as they come in (no random jitter)
  useEffect(() => {
    setHistoricalData((prev) => ({
      healthScore: [...prev.healthScore.slice(-7), stats.averageHealthScore],
      inboxRate: [...prev.inboxRate.slice(-7), stats.averageInboxRate],
      sent: [...prev.sent.slice(-7), stats.emailsSentToday],
      received: [...prev.received.slice(-7), stats.emailsReceivedToday],
    }));
  }, [stats.averageHealthScore, stats.averageInboxRate, stats.emailsSentToday, stats.emailsReceivedToday]);

  return (
    <Card className="bg-gradient-to-br from-neutral-900/90 via-neutral-800/80 to-neutral-900/90 backdrop-blur-xl border-orange-500/15">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Activity className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                Real-time Metrics
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-500 mr-1"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  LIVE
                </Badge>
              </CardTitle>
              <p className="text-sm text-neutral-400 mt-1">
                Performance metrics updated in real-time
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Gauge Meters Row */}
        <div className="flex justify-around items-center py-6 border-b border-orange-500/10 mb-6">
          <GaugeMeter
            value={stats.averageHealthScore}
            label="Health Score"
          />
          <GaugeMeter
            value={stats.averageInboxRate}
            label="Inbox Rate"
          />
          <GaugeMeter
            value={stats.networkStrength || 0}
            label="Network Strength"
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Emails Sent"
            value={stats.emailsSentToday}
            icon={TrendingUp}
            color="#3B82F6"
            sparklineData={historicalData.sent}
          />
          <MetricCard
            title="Emails Received"
            value={stats.emailsReceivedToday}
            icon={Activity}
            color="#10B981"
            sparklineData={historicalData.received}
          />
          <MetricCard
            title="Active Conversations"
            value={stats.totalConversations}
            icon={BarChart3}
            color="#8B5CF6"
          />
          <MetricCard
            title="AI Optimizations"
            value={stats.aiOptimizations || 0}
            icon={Zap}
            color="#F59E0B"
          />
        </div>

        {/* Prediction Bar */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">7-Day Prediction</span>
            </div>
            <Badge className="bg-purple-500/20 text-amber-400">
              AI Forecast
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-400">
                {stats.predictedGrowth
                  ? (stats.averageHealthScore + stats.predictedGrowth).toFixed(1) + "%"
                  : "—"}
              </p>
              <p className="text-xs text-neutral-400">Predicted Health</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-400">
                {stats.averageInboxRate > 0
                  ? stats.averageInboxRate.toFixed(1) + "%"
                  : "—"}
              </p>
              <p className="text-xs text-neutral-400">Current Inbox Rate</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-400">
                {stats.predictedGrowth
                  ? `+${stats.predictedGrowth}%`
                  : "—"}
              </p>
              <p className="text-xs text-neutral-400">Expected Growth</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RealtimeMetrics;
