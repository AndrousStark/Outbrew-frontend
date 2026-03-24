"use client";

/**
 * CONSOLIDATED MARKETPLACE PAGE
 * Combines tools and intelligence:
 * - Tab 1: Template Marketplace (from /marketplace)
 * - Tab 2: Company Intelligence (from /company-intelligence)
 */

import { useState } from "react";
import { PremiumGate } from "@/components/PremiumGate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Brain,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// ========== LAZY LOAD FULL PAGE COMPONENTS ==========
const MarketplacePage = dynamic(
  () => import("@/app/(dashboard)/marketplace/page"),
  { loading: () => <div className="p-8 text-center text-neutral-400">Loading marketplace...</div> }
);

const CompanyIntelligencePage = dynamic(
  () => import("@/app/(dashboard)/company-intelligence/page"),
  { loading: () => <div className="p-8 text-center text-neutral-400">Loading intelligence...</div> }
);

export default function ConsolidatedMarketplacePage() {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <PremiumGate feature="Marketplace">
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 pb-0"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Marketplace & Tools</h1>
            <p className="text-neutral-400 flex items-center gap-2 mt-1">
              Templates and intelligence tools
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <div className="px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#080808] border border-orange-500/10">
            <TabsTrigger value="templates" className="flex items-center gap-2 text-neutral-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]">
              <Store className="w-4 h-4" />
              Templates
            </TabsTrigger>

            <TabsTrigger value="intelligence" className="flex items-center gap-2 text-neutral-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]">
              <Brain className="w-4 h-4" />
              Intelligence
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Template Marketplace */}
          <TabsContent value="templates" className="mt-0">
            <MarketplacePage />
          </TabsContent>

          {/* Tab 2: Company Intelligence */}
          <TabsContent value="intelligence" className="mt-0">
            <CompanyIntelligencePage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PremiumGate>
  );
}
