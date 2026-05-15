"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Plus,
  LayoutDashboard,
  Archive,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { createNoteAction } from "@/actions/note-actions";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPending, startTransition] = useTransition();

  const commands: Command[] = [
    {
      id: "new-note",
      label: "New Note",
      description: "Create a blank note",
      icon: <Plus size={15} />,
      group: "Actions",
      action: () => {
        setOpen(false);
        startTransition(() => createNoteAction());
      },
    },
    {
      id: "go-dashboard",
      label: "Go to Dashboard",
      icon: <LayoutDashboard size={15} />,
      group: "Navigate",
      action: () => { setOpen(false); router.push("/dashboard"); },
    },
    {
      id: "go-notes",
      label: "Go to Notes",
      icon: <FileText size={15} />,
      group: "Navigate",
      action: () => { setOpen(false); router.push("/notes"); },
    },
    {
      id: "go-archive",
      label: "View Archive",
      icon: <Archive size={15} />,
      group: "Navigate",
      action: () => { setOpen(false); router.push("/notes?archived=true"); },
    },
    {
      id: "sign-out",
      label: "Sign out",
      icon: <LogOut size={15} />,
      group: "Account",
      action: () => { setOpen(false); signOut({ callbackUrl: "/login" }); },
    },
  ];

  const filtered = commands.filter(
    (c) =>
      !query ||
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description?.toLowerCase().includes(query.toLowerCase())
  );

  // Group the filtered commands
  const groups = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  const flatFiltered = Object.values(groups).flat();



  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Open: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIdx(0);
      }
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, flatFiltered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = flatFiltered[selectedIdx];
        cmd?.action();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, flatFiltered, selectedIdx]);

  // Removed effect that caused synchronous setState cascading renders

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <div className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                {isPending ? (
                  <Sparkles size={16} className="text-violet-400 animate-pulse flex-shrink-0" />
                ) : (
                  <Search size={16} className="text-muted-foreground flex-shrink-0" />
                )}
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIdx(0);
                  }}
                  placeholder="Search commands…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <kbd className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                  ESC
                </kbd>
              </div>

              {/* Commands */}
              <div className="py-2 max-h-72 overflow-y-auto">
                {flatFiltered.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No commands found.
                  </p>
                ) : (
                  Object.entries(groups).map(([group, cmds]) => (
                    <div key={group}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2">
                        {group}
                      </p>
                      {cmds.map((cmd) => {
                        const idx = flatFiltered.indexOf(cmd);
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIdx(idx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                              selectedIdx === idx
                                ? "bg-secondary text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                          >
                            <span
                              className={cn(
                                "flex-shrink-0",
                                selectedIdx === idx ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {cmd.icon}
                            </span>
                            <span className="font-medium">{cmd.label}</span>
                            {cmd.description && (
                              <span className="text-[12px] text-muted-foreground ml-auto">
                                {cmd.description}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-2.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span className="ml-auto font-mono">⌘K</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
