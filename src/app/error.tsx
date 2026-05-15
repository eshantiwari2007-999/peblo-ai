"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production (e.g., Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center animate-in">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          An unexpected error occurred. If this keeps happening, please try refreshing the page.
          {error.digest && (
            <span className="block mt-2 font-mono text-xs text-muted-foreground/60">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <RefreshCw size={15} />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
