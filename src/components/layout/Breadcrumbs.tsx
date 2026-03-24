"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  campaigns: "Campaigns",
  pipeline: "Pipeline",
  outreach: "Outreach",
  warmup: "Email Warmup",
  resources: "Resources",
  "marketplace-consolidated": "Marketplace",
  insights: "Insights",
  admin: "Admin",
  inbox: "Inbox",
  "mobiadz-extraction": "Extraction Engine",
  recipients: "Recipients",
  settings: "Settings",
  create: "Create",
  "step1-source": "Data Source",
  "step2-personalize": "Personalize",
  "step3-review": "Review",
  "step4-schedule": "Schedule",
};

function getLabel(segment: string): string {
  return ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname) return null;

  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on top-level dashboard
  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = getLabel(segment);
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <Breadcrumb className="px-6 py-2 border-b border-orange-500/5">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb) => (
          <span key={crumb.href} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
