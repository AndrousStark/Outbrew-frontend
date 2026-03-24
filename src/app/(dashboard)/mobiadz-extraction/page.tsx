"use client"

import { MobiAdzExtractionContent } from "@/components/mobiadz-extraction"
import { PremiumGate } from "@/components/PremiumGate"

// Default export for Next.js App Router
export default function MobiAdzExtractionPage() {
  return <PremiumGate feature="Extraction Engine"><MobiAdzExtractionContent /></PremiumGate>
}
