


"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mail,
  Briefcase,
  LogOut,
  ChevronLeft,
  Settings,
  Sparkles,
  Inbox,
  Store,
  TrendingUp,
  UserCircle2,
  FolderOpen,
  Flame,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePlanStore, PRO_SIDEBAR_ITEMS } from "@/store/planStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campaigns", href: "/campaigns", icon: Mail, badge: "NEW" },
  { name: "Pipeline", href: "/pipeline", icon: Briefcase },
  { name: "Outreach", href: "/outreach", icon: UserCircle2, proOnly: true },
  { name: "Email Warmup", href: "/warmup", icon: Flame, proOnly: true },
  { name: "Resources", href: "/resources", icon: FolderOpen },
  { name: "Marketplace", href: "/marketplace-consolidated", icon: Sparkles, proOnly: true },
  { name: "Insights", href: "/insights", icon: TrendingUp, proOnly: true },
  { name: "Admin", href: "/admin", icon: Settings, adminOnly: true },
  { name: "Extraction Engine", href: "/mobiadz-extraction", icon: Store, proOnly: true },
];

// Top bar pages - Quick access features
export const topBarPages = [
  { name: "Inbox", href: "/inbox", icon: Inbox, tooltip: "Email Inbox" },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin";
  const isPro = usePlanStore((s) => s.isPro());

  const filteredNav = navigation.filter(
    (item) => !item.adminOnly || isSuperAdmin
  );

  return (
    <div
      className={cn(
        "bg-[#080808] border-r border-orange-500/10 h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header with Logo and Branding */}
        <div className={cn(
          "border-b border-orange-500/10 bg-gradient-to-br from-[#0a0a0a] via-[#0f0a06] to-[#0a0a0a]",
          collapsed ? "p-2 py-3" : "p-4"
        )}>
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a
                  href="https://metaminds.firm.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex-shrink-0"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden ring-2 ring-orange-500/30">
                    <Image
                      src="/metaminds-logo.jpg"
                      alt="Metaminds"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </a>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-sm font-bold text-orange-400 truncate">
                    Outbrew
                  </h1>
                  <p className="text-[10px] text-neutral-500 font-medium tracking-wider uppercase">
                    by Metaminds
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="text-neutral-400 hover:text-white hover:bg-white/5 flex-shrink-0 h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <a
                href="https://metaminds.firm.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-2 ring-orange-500/30">
                  <Image
                    src="/metaminds-logo.jpg"
                    alt="Metaminds"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </a>
              <button
                onClick={onToggle}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          )}
        </div>

        <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
          {filteredNav.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const isLocked = item.proOnly && !isPro;
            const linkContent = (
              <Link
                href={isLocked ? "#" : item.href}
                onClick={isLocked ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                className={cn(
                  "flex items-center rounded-lg transition-all relative",
                  collapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                  isLocked
                    ? "text-neutral-600 cursor-not-allowed opacity-50"
                    : isActive
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-300 border border-orange-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                    : "text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && !isLocked && "text-orange-400")} />
                {!collapsed && (
                  <>
                    <span className="font-medium flex-1 text-sm">{item.name}</span>
                    {isLocked ? (
                      <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-black rounded uppercase tracking-wider">
                        PRO
                      </span>
                    ) : item.badge ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-black rounded uppercase tracking-wider">
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.name}>{linkContent}</div>
            );
          })}
        </nav>

        <div className={cn("border-t border-orange-500/10", collapsed ? "p-2" : "p-3")}>
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="w-full h-10 text-neutral-300 hover:text-white hover:bg-white/[0.06]"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-neutral-300 hover:text-white hover:bg-white/[0.06]"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
