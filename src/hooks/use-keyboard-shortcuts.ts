"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNoteAction } from "@/actions/note-actions";
import { useTransition } from "react";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

/**
 * useKeyboardShortcuts — wires up global keyboard shortcuts.
 * Handles both Ctrl (Windows/Linux) and Meta/Cmd (macOS) automatically.
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: "k", ctrl: true, action: openSearch, description: "Open search" }
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrl || shortcut.meta;
        const modifierMatch = ctrlOrMeta
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && modifierMatch && shiftMatch) {
          // Don't trigger when typing in inputs/textareas
          const target = e.target as HTMLElement;
          if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
          ) {
            continue;
          }
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}

/** Pre-wired dashboard shortcuts — import in the dashboard layout */
export function useDashboardShortcuts() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useKeyboardShortcuts([
    {
      key: "n",
      ctrl: true,
      action: () => startTransition(async () => { await createNoteAction(); }),
      description: "Create new note",
    },
    {
      key: "h",
      ctrl: true,
      action: () => router.push("/dashboard"),
      description: "Go to dashboard",
    },
    {
      key: "/",
      ctrl: true,
      action: () => {
        // Focus the search input if it's in the DOM
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search"]'
        );
        searchInput?.focus();
      },
      description: "Focus search",
    },
  ]);
}
