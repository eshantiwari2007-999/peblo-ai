import { NotesGridSkeleton } from "@/components/ui/skeleton";

/** Shown by Next.js while the notes Server Component is fetching data */
export default function NotesLoading() {
  return (
    <div className="p-8 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-32 bg-secondary rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-secondary rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-28 bg-secondary rounded-full animate-pulse" />
      </div>
      <div className="h-11 w-full bg-secondary rounded-xl mb-6 animate-pulse" />
      <NotesGridSkeleton />
    </div>
  );
}
