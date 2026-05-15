import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Base skeleton block with shimmer animation */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-secondary before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
    />
  );
}

/** Notes grid loading skeleton — matches exact NotesList card layout */
export function NotesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Dashboard stats row skeleton */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Editor skeleton — shown while note content loads */
export function EditorSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-16 flex flex-col gap-6">
      <Skeleton className="h-12 w-3/4" />
      <div className="flex flex-col gap-3 mt-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  );
}
