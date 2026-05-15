"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Archive,
  Plus,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createNoteAction } from "@/actions/note-actions";
import { useTransition } from "react";
import { useDashboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "⌘H" },
  { name: "Notes", href: "/notes", icon: FileText, shortcut: "" },
  { name: "Archive", href: "/notes?archived=true", icon: Archive, shortcut: "" },
];

export function Sidebar({
  user,
}: {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  useDashboardShortcuts();

  const handleNewNote = () => {
    startTransition(async () => {
      await createNoteAction();
    });
  };

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    const isArchivePath = href.includes("archived=true");
    const currentSearch = typeof window !== "undefined" ? window.location.search : "";
    const currentIsArchived = currentSearch.includes("archived=true");

    if (isArchivePath) {
      return pathname === "/notes" && currentIsArchived;
    }

    if (base === "/dashboard") return pathname === "/dashboard";

    // /notes matches /notes and /notes/[id] but NOT the archive view
    if (base === "/notes") {
      return (pathname === "/notes" && !currentIsArchived) || pathname.startsWith("/notes/");
    }

    return pathname.startsWith(base);
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <aside className="w-56 flex-shrink-0 h-full bg-background flex flex-col py-5 px-2.5 border-r border-border">
      {/* ── Brand ── */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2.5 mb-5 group cursor-pointer">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
          <Sparkles size={16} />
        </div>
        <span className="font-semibold tracking-tight">Peblo</span>
        <span className="ml-auto text-[10px] text-muted-foreground/60 font-medium bg-secondary px-1.5 py-0.5 rounded-md">
          AI
        </span>
      </Link>

      {/* ── New Note Button ── */}
      <button
        onClick={handleNewNote}
        disabled={isPending}
        id="new-note-btn"
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all py-2.5 rounded-xl text-sm font-medium mb-4 shadow-sm disabled:opacity-60"
        aria-label="Create new note"
      >
        <Plus size={16} />
        <span>{isPending ? "Creating…" : "New Note"}</span>
        <span className="ml-auto text-[10px] opacity-60 font-mono">⌘N</span>
      </button>

      {/* ── Navigation ── */}
      <nav className="flex-1 space-y-0.5" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors relative group",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              {active && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-secondary rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon
                size={16}
                className={cn(
                  "transition-colors flex-shrink-0",
                  active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.shortcut && (
                <span className="text-[10px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.shortcut}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div className="mt-auto pt-4 border-t border-border space-y-0.5">
        <div className="flex items-center gap-2.5 py-2.5 px-2.5 rounded-xl">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[11px] flex-shrink-0 border border-primary/20">
            {initials}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-[13px] font-medium truncate leading-tight text-foreground">
              {user?.name || "User"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {user?.email || ""}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
