import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center animate-in">
        <p className="text-8xl font-bold text-border mb-6 select-none">404</p>
        <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={24} className="text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          The page you&apos;re looking for doesn&apos;t exist, or this note is no longer publicly shared.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
