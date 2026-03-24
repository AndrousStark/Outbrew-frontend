
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sidebar, topBarPages } from "@/components/layout/Sidebar";
import Link from "next/link";
import { CommandPaletteProvider } from "@/components/ui/command-palette";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { NotificationBell } from "@/components/notifications";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { KeyboardShortcutsIndicator } from "@/components/ui/KeyboardShortcutsHelp";
import { useAuthStore } from "@/store/authStore";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hydrationTimedOut, setHydrationTimedOut] = useState(false);
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  // Hydration timeout — if it takes >5s, show a fallback message
  useEffect(() => {
    if (hasHydrated) return;
    const timer = setTimeout(() => setHydrationTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [hasHydrated]);

  // Proper client-side auth check - wait for hydration first
  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [token, hasHydrated, router]);

  // Show loading while hydrating OR checking auth or if no token
  if (!hasHydrated || isChecking || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-neutral-500">
            {!hasHydrated ? "Initializing..." : "Loading..."}
          </p>
          {hydrationTimedOut && !hasHydrated && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-neutral-600">
                Taking too long? Try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-orange-400 hover:text-orange-300 underline"
              >
                Refresh now
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <CommandPaletteProvider>
        <div className="flex h-screen bg-[#050505]">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="h-14 border-b border-orange-500/10 bg-[#080808]/80 backdrop-blur-sm flex items-center justify-between px-6 gap-4">
            {/* Left: Logo + Tagline */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.a
                href="https://metaminds.firm.in"
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-8 h-8 rounded-md overflow-hidden ring-1 ring-orange-500/30 hover:ring-orange-400/50 transition-all"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/metaminds-logo.jpg"
                  alt="Metaminds"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.a>

              <div className="pl-2 border-l border-orange-500/10">
                <h2 className="text-sm font-medium text-neutral-400">
                  Outbrew
                </h2>
              </div>
            </motion.div>

            {/* Right: Top Bar Icons & Notifications */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-2 pr-2 border-r border-orange-500/10">
                {topBarPages.map((page) => {
                  const IconComponent = page.icon;
                  return (
                    <motion.div
                      key={page.name}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={page.href}
                        className="relative group p-2 rounded-lg hover:bg-white/[0.04] transition-all duration-200"
                        title={page.tooltip}
                      >
                        <IconComponent className="w-4 h-4 text-neutral-400 group-hover:text-orange-400 transition-colors" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <NotificationBell />
            </div>
          </header>

          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>

        {/* Phase 2 Components */}
        <FloatingActionButton />
        <KeyboardShortcutsIndicator />
        <OnboardingTour />
      </div>
      </CommandPaletteProvider>
    </NotificationProvider>
  );
}
