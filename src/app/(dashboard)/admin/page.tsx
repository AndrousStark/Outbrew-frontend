"use client";

/**
 * SUPER ADMIN PANEL — Dashboard, Users, Audit Logs, Settings, Email Controls
 */

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Settings,
  Zap,
  Shield,
  BarChart3,
  ScrollText,
  Crown,
  UserCheck,
  Mail,
  TrendingUp,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const SettingsPage = dynamic(
  () => import("@/app/(dashboard)/settings/page"),
  { loading: () => <div className="p-8 text-center text-neutral-400">Loading settings...</div> }
);

const EmailControlsPage = dynamic(
  () => import("@/app/(dashboard)/email-controls/page"),
  { loading: () => <div className="p-8 text-center text-neutral-400">Loading email controls...</div> }
);

export default function AdminPanel() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard state
  const [dashData, setDashData] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(true);

  // Users state
  const [usersData, setUsersData] = useState<any>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersPlanFilter, setUsersPlanFilter] = useState("all");

  // Audit state
  const [auditData, setAuditData] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditEventFilter, setAuditEventFilter] = useState("all");
  const [auditStats, setAuditStats] = useState<any>(null);

  // Guard
  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch dashboard
  const fetchDashboard = useCallback(async () => {
    setDashLoading(true);
    try {
      const { data } = await adminAPI.getDashboard();
      setDashData(data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setDashLoading(false);
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params: any = { page: usersPage, page_size: 20 };
      if (usersSearch) params.search = usersSearch;
      if (usersPlanFilter !== "all") params.plan_tier = usersPlanFilter;
      const { data } = await adminAPI.listUsers(params);
      setUsersData(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [usersPage, usersSearch, usersPlanFilter]);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const params: any = { page: auditPage, page_size: 30 };
      if (auditEventFilter !== "all") params.event_type = auditEventFilter;
      const { data } = await adminAPI.getAuditLogs(params);
      setAuditData(data);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setAuditLoading(false);
    }
  }, [auditPage, auditEventFilter]);

  // Fetch audit stats
  const fetchAuditStats = useCallback(async () => {
    try {
      const { data } = await adminAPI.getAuditStats();
      setAuditStats(data);
    } catch {}
  }, []);

  // Load on tab change
  useEffect(() => {
    if (activeTab === "dashboard") fetchDashboard();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "audit") { fetchAuditLogs(); fetchAuditStats(); }
  }, [activeTab, fetchDashboard, fetchUsers, fetchAuditLogs, fetchAuditStats]);

  // Reload users when filters change
  useEffect(() => { if (activeTab === "users") fetchUsers(); }, [usersPage, usersSearch, usersPlanFilter]);
  useEffect(() => { if (activeTab === "audit") fetchAuditLogs(); }, [auditPage, auditEventFilter]);

  const handleSetPlan = async (userId: number, plan: "free" | "pro") => {
    try {
      await adminAPI.setUserPlan(userId, plan);
      toast.success(`Plan updated to ${plan}`);
      fetchUsers();
    } catch {
      toast.error("Failed to update plan");
    }
  };

  if (!user || user.role !== "super_admin") return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-neutral-400">Platform administration</p>
          </div>
          <Badge variant="outline" className="ml-auto bg-red-500/10 text-red-400 border-red-500/30 text-xs">
            Super Admin
          </Badge>
        </div>
      </motion.div>

      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#080808] border border-orange-500/10">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-1.5 text-xs">
              <ScrollText className="w-3.5 h-3.5" /> Audit Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" /> Settings
            </TabsTrigger>
            <TabsTrigger value="email-controls" className="flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5" /> Email
            </TabsTrigger>
          </TabsList>

          {/* ═══ DASHBOARD TAB ═══ */}
          <TabsContent value="dashboard" className="mt-4">
            {dashLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
            ) : dashData ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total Users", value: dashData.users?.total, icon: Users, color: "orange" },
                    { label: "Verified", value: dashData.users?.verified, icon: UserCheck, color: "green" },
                    { label: "Pro Users", value: dashData.users?.plans?.pro || dashData.users?.plans?.PRO || 0, icon: Crown, color: "amber" },
                    { label: "New (7d)", value: dashData.users?.new_7d, icon: TrendingUp, color: "blue" },
                    { label: "Emails Sent", value: dashData.emails?.total, icon: Mail, color: "purple" },
                    { label: "Today", value: dashData.emails?.today, icon: Mail, color: "cyan" },
                    { label: "Applications", value: dashData.applications?.total, icon: BarChart3, color: "indigo" },
                    { label: "Recipients", value: dashData.recipients?.total, icon: Users, color: "rose" },
                  ].map((s, i) => (
                    <Card key={i} className="bg-[#0a0a0a] border-white/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-neutral-500">{s.label}</p>
                          <s.icon className={`w-4 h-4 text-${s.color}-400 opacity-50`} />
                        </div>
                        <p className="text-2xl font-bold mt-1">{s.value ?? 0}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Registrations + Login Failures */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-[#0a0a0a] border-white/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-neutral-300">Recent Registrations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {dashData.recent_registrations?.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                          <div>
                            <span className="text-white font-medium">{r.full_name}</span>
                            <span className="text-neutral-500 ml-2">{r.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${r.email_verified ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"}`}>
                              {r.email_verified ? "Verified" : "Unverified"}
                            </Badge>
                            <span className="text-neutral-600">{r.plan_tier}</span>
                          </div>
                        </div>
                      ))}
                      {(!dashData.recent_registrations || dashData.recent_registrations.length === 0) && (
                        <p className="text-xs text-neutral-600 text-center py-4">No recent registrations</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a0a0a] border-white/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Login Failures (7d)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {dashData.recent_login_failures?.map((f: any) => (
                        <div key={f.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                          <div>
                            <span className="text-red-400 font-mono">{f.username || "unknown"}</span>
                            <span className="text-neutral-600 ml-2">{f.ip_address}</span>
                          </div>
                          <span className="text-neutral-600">{f.timestamp ? new Date(f.timestamp).toLocaleString() : ""}</span>
                        </div>
                      ))}
                      {(!dashData.recent_login_failures || dashData.recent_login_failures.length === 0) && (
                        <p className="text-xs text-neutral-600 text-center py-4">No login failures</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </TabsContent>

          {/* ═══ USERS TAB ═══ */}
          <TabsContent value="users" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    placeholder="Search users..."
                    value={usersSearch}
                    onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                    className="pl-9 h-9 bg-[#0a0a0a] border-white/10 text-sm"
                  />
                </div>
                <Select value={usersPlanFilter} onValueChange={(v) => { setUsersPlanFilter(v); setUsersPage(1); }}>
                  <SelectTrigger className="w-32 h-9 bg-[#0a0a0a] border-white/10 text-sm">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={fetchUsers} className="h-9 border-white/10">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-white/5">
                    <table className="w-full text-xs">
                      <thead className="bg-[#080808]">
                        <tr className="text-neutral-500 text-left">
                          <th className="p-3">User</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Verified</th>
                          <th className="p-3">Emails</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData?.users?.map((u: any) => (
                          <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                            <td className="p-3">
                              <div className="font-medium text-white">{u.full_name}</div>
                              <div className="text-neutral-500">@{u.username}</div>
                            </td>
                            <td className="p-3 text-neutral-400">{u.email}</td>
                            <td className="p-3">
                              <Badge variant="outline" className={`text-[10px] ${u.role === "super_admin" ? "border-red-500/30 text-red-400" : "border-neutral-500/30 text-neutral-400"}`}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={`text-[10px] ${u.plan_tier === "pro" || u.plan_tier === "PRO" ? "border-amber-500/30 text-amber-400" : "border-neutral-500/30 text-neutral-400"}`}>
                                {u.plan_tier}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {u.email_verified ? (
                                <span className="text-green-400">Yes</span>
                              ) : (
                                <span className="text-yellow-400">No</span>
                              )}
                            </td>
                            <td className="p-3 text-neutral-400">
                              {u.monthly_email_sent}/{u.monthly_email_limit}
                            </td>
                            <td className="p-3">
                              {(u.plan_tier === "free" || u.plan_tier === "FREE") ? (
                                <Button size="sm" variant="outline" className="h-6 text-[10px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                  onClick={() => handleSetPlan(u.id, "pro")}>
                                  Upgrade
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="h-6 text-[10px] border-neutral-500/30 text-neutral-400 hover:bg-white/5"
                                  onClick={() => handleSetPlan(u.id, "free")}>
                                  Downgrade
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {usersData && usersData.total_pages > 1 && (
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Page {usersData.page} of {usersData.total_pages} ({usersData.total} users)</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7" disabled={usersPage <= 1}
                          onClick={() => setUsersPage(p => p - 1)}>
                          <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7" disabled={usersPage >= usersData.total_pages}
                          onClick={() => setUsersPage(p => p + 1)}>
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* ═══ AUDIT LOGS TAB ═══ */}
          <TabsContent value="audit" className="mt-4">
            <div className="space-y-4">
              {/* Audit Stats */}
              {auditStats && (
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-[#0a0a0a] border-white/5">
                    <CardContent className="p-3">
                      <p className="text-[10px] text-neutral-500">Events (30d)</p>
                      <p className="text-xl font-bold">{auditStats.total_events}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0a0a0a] border-white/5">
                    <CardContent className="p-3">
                      <p className="text-[10px] text-neutral-500">Failed</p>
                      <p className="text-xl font-bold text-red-400">{auditStats.failed_events}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0a0a0a] border-white/5">
                    <CardContent className="p-3">
                      <p className="text-[10px] text-neutral-500">Success Rate</p>
                      <p className="text-xl font-bold text-green-400">{auditStats.success_rate}%</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Filters */}
              <div className="flex gap-3 items-center">
                <Select value={auditEventFilter} onValueChange={(v) => { setAuditEventFilter(v); setAuditPage(1); }}>
                  <SelectTrigger className="w-48 h-9 bg-[#0a0a0a] border-white/10 text-sm">
                    <SelectValue placeholder="Event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {auditData?.event_types?.map((t: string) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => { fetchAuditLogs(); fetchAuditStats(); }} className="h-9 border-white/10">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Log Table */}
              {auditLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-white/5">
                    <table className="w-full text-xs">
                      <thead className="bg-[#080808]">
                        <tr className="text-neutral-500 text-left">
                          <th className="p-3">Time</th>
                          <th className="p-3">Event</th>
                          <th className="p-3">User</th>
                          <th className="p-3">IP</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditData?.logs?.map((l: any) => (
                          <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                            <td className="p-3 text-neutral-500 whitespace-nowrap">
                              {l.timestamp ? new Date(l.timestamp).toLocaleString() : "—"}
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={`text-[10px] font-mono ${
                                l.event_type.includes("failed") ? "border-red-500/30 text-red-400" :
                                l.event_type.includes("success") || l.event_type === "login_success" ? "border-green-500/30 text-green-400" :
                                "border-neutral-500/30 text-neutral-400"
                              }`}>
                                {l.event_type}
                              </Badge>
                            </td>
                            <td className="p-3 text-neutral-300">{l.username || "—"}</td>
                            <td className="p-3 text-neutral-500 font-mono">{l.ip_address || "—"}</td>
                            <td className="p-3">
                              {l.success ? (
                                <span className="text-green-400">OK</span>
                              ) : (
                                <span className="text-red-400">FAIL</span>
                              )}
                            </td>
                            <td className="p-3 text-neutral-600 max-w-[200px] truncate">
                              {l.details ? JSON.stringify(l.details).substring(0, 60) : "—"}
                            </td>
                          </tr>
                        ))}
                        {(!auditData?.logs || auditData.logs.length === 0) && (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-neutral-600">No audit logs yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {auditData && auditData.total_pages > 1 && (
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Page {auditData.page} of {auditData.total_pages} ({auditData.total} events)</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7" disabled={auditPage <= 1}
                          onClick={() => setAuditPage(p => p - 1)}>
                          <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7" disabled={auditPage >= auditData.total_pages}
                          onClick={() => setAuditPage(p => p + 1)}>
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* ═══ SETTINGS TAB ═══ */}
          <TabsContent value="settings" className="mt-0">
            <SettingsPage />
          </TabsContent>

          {/* ═══ EMAIL CONTROLS TAB ═══ */}
          <TabsContent value="email-controls" className="mt-0">
            <EmailControlsPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
