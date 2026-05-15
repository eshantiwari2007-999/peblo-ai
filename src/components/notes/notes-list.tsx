"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  Clock,
  ChevronRight,
  Archive,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  isArchived: boolean;
  updatedAt: Date | string;
  tags?: { id: string; name: string }[];
  category?: { name: string } | null;
}

interface NotesListProps {
  initialNotes: Note[];
  isArchived?: boolean;
}

const SORT_OPTIONS = [
  { value: "updatedAt_desc", label: "Last updated" },
  { value: "createdAt_desc", label: "Newest first" },
  { value: "title_asc", label: "A → Z" },
];

export function NotesList({ initialNotes, isArchived = false }: NotesListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "updatedAt_desc");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearchTerm) params.set("q", debouncedSearchTerm);
    else params.delete("q");

    if (sortBy !== "updatedAt_desc") params.set("sort", sortBy);
    else params.delete("sort");

    if (isArchived) params.set("archived", "true");
    else params.delete("archived");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearchTerm, sortBy, isArchived, pathname, router, searchParams]);

  useEffect(() => {
    syncToUrl();
  }, [debouncedSearchTerm, sortBy, syncToUrl]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <div className="flex flex-col h-full animate-in">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            size={15}
          />
          <input
            id="notes-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes…"
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">{sortLabel}</span>
          </button>

          <AnimatePresence>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors",
                        sortBy === opt.value
                          ? "bg-secondary text-foreground font-medium"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      {opt.value === sortBy && <span className="mr-1.5">✓</span>}
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Notes grid ── */}
      {initialNotes.length === 0 ? (
        <EmptyState isArchived={isArchived} hasSearch={!!searchTerm} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pb-20 pr-1 content-start">
          <AnimatePresence mode="popLayout">
            {initialNotes.map((note, idx) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18, delay: idx * 0.03 }}
              >
                <NoteCard note={note} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ note }: { note: Note }) {
  const excerpt = note.summary || note.content || "";

  return (
    <Link href={`/notes/${note.id}`} className="block group h-full">
      <div className="h-full bg-card hover:bg-secondary/20 border border-border hover:border-primary/20 rounded-2xl p-5 cursor-pointer transition-all duration-150 hover:shadow-sm flex flex-col relative overflow-hidden">
        {/* AI indicator */}
        {note.summary && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles size={13} className="text-violet-400" />
          </div>
        )}

        <h3 className="font-semibold text-[15px] mb-2 text-foreground line-clamp-1 leading-snug pr-5">
          {note.title || "Untitled Note"}
        </h3>

        <p className="text-muted-foreground text-[13px] line-clamp-3 mb-4 flex-1 leading-relaxed break-words">
          {excerpt || <span className="italic">Empty note</span>}
        </p>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Clock size={11} />
            <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {note.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full font-medium text-[10px]"
              >
                {tag.name}
              </span>
            ))}
            <div className="w-5 h-5 rounded-full bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-border">
              <ChevronRight size={10} className="text-primary" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({
  isArchived,
  hasSearch,
}: {
  isArchived: boolean;
  hasSearch: boolean;
}) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Search size={22} className="text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1.5">No results found</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Try different keywords or clear your search.
        </p>
      </div>
    );
  }

  if (isArchived) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Archive size={22} className="text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1.5">No archived notes</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Notes you archive will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <FileText size={22} className="text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1.5">Your canvas is blank</h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        Hit{" "}
        <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">
          New Note
        </span>{" "}
        in the sidebar to capture your first idea.
      </p>
    </div>
  );
}
