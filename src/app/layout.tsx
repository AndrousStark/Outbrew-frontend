import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SkipLink } from "@/components/ui/skip-link";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Outbrew — AI-Powered Cold Email Platform",
  description: "Brew outreach that actually converts. Email warmup, campaign management, AI extraction, and analytics — all in one platform.",
  icons: {
    icon: "/metaminds-logo.jpg",
    shortcut: "/metaminds-logo.jpg",
    apple: "/metaminds-logo.jpg",
  },
  openGraph: {
    title: "Outbrew — AI-Powered Cold Email Platform",
    description: "Warmup, personalization, and follow-ups on autopilot. Start free.",
    type: "website",
    siteName: "Outbrew",
  },
  twitter: {
    card: "summary_large_image",
    title: "Outbrew — AI-Powered Cold Email Platform",
    description: "Warmup, personalization, and follow-ups on autopilot. Start free.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TooltipProvider>
            <SkipLink href="#main-content" />
            <div id="main-content">{children}</div>
          </TooltipProvider>
          <Toaster
            position="top-right"
            richColors
            expand={false}
            duration={4000}
            closeButton
            toastOptions={{
              classNames: {
                toast: "border shadow-premium-lg backdrop-blur-sm",
                title: "font-semibold",
                description: "text-muted-foreground text-sm",
                actionButton: "bg-primary text-primary-foreground hover:bg-primary/90",
                cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
                closeButton: "bg-background border border-border hover:bg-muted",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
