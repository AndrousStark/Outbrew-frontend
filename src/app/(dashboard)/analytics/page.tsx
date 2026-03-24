"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Target, Award, Loader2, RefreshCw, AlertCircle, Brain, BarChart3, Mail, Eye, MessageSquare } from "lucide-react";
import { applicationsAPI } from "@/lib/api";
import { MLInsightsDrawer } from "@/components/ml-analytics";
import { useAuthStore } from "@/store/authStore";
import { usePageTitle } from "@/hooks/usePageTitle";

// Debug logging helper
const debugLog = (action: string, data?: unknown) => {
  console.log(`[Analytics] ${action}`, data ?? '');
};

export default function AnalyticsPage() {
  usePageTitle("Analytics");

  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mlDrawerOpen, setMlDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      debugLog("fetchData - No user ID, skipping");
      setLoading(false);
      return;
    }

    debugLog("fetchData called", { userId: user.id });
    setLoading(true);
    setError(null);

    try {
      debugLog("fetchData - Calling API");
      const { data } = await applicationsAPI.getStats(user.id);
      debugLog("fetchData - API response", data);
      setStats(data);
    } catch (err: any) {
      debugLog("fetchData - Error", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load analytics data";
      setError(errorMessage);
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
      debugLog("fetchData - Complete");
    }
  }, [user?.id]);

  useEffect(() => {
    debugLog("useEffect - Initial load");
    fetchData();
  }, [fetchData]);

  // Compute real metrics from API data
  const total = stats?.total || 0;
  const sent = stats?.sent || 0;
  const opened = stats?.opened || 0;
  const replied = stats?.replied || 0;
  const responseRate = stats?.response_rate || 0;
  const openRate = stats?.open_rate || 0;
  const interviewCount = stats?.by_status?.interview || 0;
  const interviewRate = stats?.interview_rate ?? "0.0";
  const hasData = total > 0;

  // Status data for pie chart — from real API
  const statusData = [
    { name: 'Sent', value: stats?.by_status?.sent || 0, color: '#3b82f6' },
    { name: 'Responded', value: stats?.by_status?.responded || 0, color: '#10b981' },
    { name: 'Interview', value: interviewCount, color: '#f59e0b' },
    { name: 'Rejected', value: stats?.by_status?.rejected || 0, color: '#ef4444' },
    { name: 'Offer', value: stats?.by_status?.offer || 0, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  // Status breakdown for bar chart
  const statusBarData = Object.entries(stats?.by_status || {})
    .filter(([_, count]) => (count as number) > 0)
    .map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
      count: count as number,
    }));

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Analytics & Insights
            </h1>
            <p className="text-neutral-400 mt-1">Track your application performance and trends</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
          <p className="text-neutral-400 text-lg">Loading analytics data...</p>
          <p className="text-neutral-500 text-sm mt-2">Crunching the numbers for you</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Analytics & Insights
            </h1>
            <p className="text-neutral-400 mt-1">Track your application performance and trends</p>
          </div>
        </div>
        <Card className="glass backdrop-blur-xl bg-red-500/10 border-red-500/30">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Analytics</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <Button
              onClick={fetchData}
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative p-6 space-y-6">
      {/* Metaminds Translucent Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.018]"
          animate={{
            rotate: [0, -360],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Image
            src="/metaminds-logo.jpg"
            alt=""
            fill
            className="object-contain blur-[2px]"
          />
        </motion.div>

        <motion.div
          className="absolute -bottom-24 -right-24 w-80 h-80 opacity-[0.025]"
          animate={{
            rotate: [0, 180, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/metaminds-logo.jpg"
            alt=""
            fill
            className="object-contain blur-sm"
          />
        </motion.div>
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Analytics & Insights
          </h1>
          <p className="text-neutral-400 mt-1">Track your application performance and trends</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setMlDrawerOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/25"
          >
            <Brain className="w-4 h-4 mr-2" />
            ML Insights
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={loading}
            className="border-orange-500/15 text-neutral-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics — all computed from real API data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass backdrop-blur-xl bg-gradient-to-br from-amber-900/20 to-amber-700/20 border-orange-500/15">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Sent</p>
                <p className="text-2xl font-bold text-white">{sent}</p>
              </div>
              <Mail className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-gradient-to-br from-green-900/20 to-green-700/20 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Open Rate</p>
                <p className="text-2xl font-bold text-white">{openRate.toFixed ? openRate.toFixed(1) : openRate}%</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-gradient-to-br from-orange-900/20 to-orange-700/20 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Response Rate</p>
                <p className="text-2xl font-bold text-white">{responseRate}%</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-purple-700/20 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Interview Rate</p>
                <p className="text-2xl font-bold text-white">{interviewRate}%</p>
              </div>
              <Target className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status - Pie Chart */}
        <Card className="glass backdrop-blur-xl bg-[#080808]/50 border-orange-500/15">
          <CardHeader>
            <CardTitle className="text-white">Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-neutral-500">
                <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
                <p>No application data yet</p>
                <p className="text-sm mt-1">Start sending applications to see status breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown - Bar Chart */}
        <Card className="glass backdrop-blur-xl bg-[#080808]/50 border-orange-500/15">
          <CardHeader>
            <CardTitle className="text-white">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statusBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="status" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-neutral-500">
                <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
                <p>No data available</p>
                <p className="text-sm mt-1">Status breakdown will appear as you track applications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="glass backdrop-blur-xl bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-orange-500/15">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-400" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-white/[0.04] border border-orange-500/15">
                <p className="text-3xl font-bold text-white">{total}</p>
                <p className="text-sm text-neutral-400 mt-1">Total Applications</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/[0.04] border border-orange-500/15">
                <p className="text-3xl font-bold text-green-400">{opened}</p>
                <p className="text-sm text-neutral-400 mt-1">Opened</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/[0.04] border border-orange-500/15">
                <p className="text-3xl font-bold text-orange-400">{replied}</p>
                <p className="text-sm text-neutral-400 mt-1">Replied</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/[0.04] border border-orange-500/15">
                <p className="text-3xl font-bold text-amber-400">{interviewCount}</p>
                <p className="text-sm text-neutral-400 mt-1">Interviews</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No analytics data yet</p>
              <p className="text-sm mt-1">Performance summary will appear once you have application activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ML Insights Drawer */}
      <MLInsightsDrawer
        open={mlDrawerOpen}
        onClose={() => setMlDrawerOpen(false)}
        defaultTab="accuracy"
      />
    </div>
  );
}
