"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ── Single Toast Item ─────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle size={15} className="text-red-500 flex-shrink-0" />,
    info: <Info size={15} className="text-blue-500 flex-shrink-0" />,
  };

  const borders = {
    success: "border-emerald-200 dark:border-emerald-900",
    error: "border-red-200 dark:border-red-900",
    info: "border-blue-200 dark:border-blue-900",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 bg-card rounded-xl border shadow-lg px-4 py-3",
        "animate-in",
        borders[toast.type]
      )}
      role="alert"
    >
      {icons[toast.type]}
      <p className="text-sm text-foreground leading-snug flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
