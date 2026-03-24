"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050505] via-[#080808] to-[#050505]">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Something went wrong!</h1>
          <p className="text-neutral-400">
            An error occurred while loading the page.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
            <p className="text-red-400 text-sm font-mono break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-red-300/70 overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-orange-500/20 hover:bg-orange-500/30"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/login"}
            className="border-orange-500/15 text-neutral-300"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
