import { DashboardStatsSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-8">
      <div className="mb-10 flex flex-col gap-2">
        <div className="h-9 w-40 bg-secondary rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-secondary rounded-lg animate-pulse" />
      </div>
      <DashboardStatsSkeleton />
      <div className="flex flex-col gap-3">
        <div className="h-5 w-48 bg-secondary rounded-lg animate-pulse mb-2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 w-full bg-secondary rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
