"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useTransition,
} from "react";
import { useEditorStore } from "@/store/use-editor-store";
import {
  Save,
  CheckCircle2,
  Loader2,
  Sparkles,
  Trash2,
  Archive,
  RotateCcw,
  X,
} from "lucide-react";
import {
  updateNoteAction,
  deleteNoteAction,
  archiveNoteAction,
} from "@/actions/note-actions";
import {
  generateAiSummary,
  generateAiActionItems,
  generateSuggestedTitle,
} from "@/actions/ai-actions";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/toast";

interface RichTextEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  initialSummary?: string | null;
  initialActionItems?: string[];
  isArchived?: boolean;
}

export function RichTextEditor({
  noteId,
  initialTitle,
  initialContent,
  initialSummary = null,
  initialActionItems = [],
  isArchived = false,
}: RichTextEditorProps) {
  const { toast } = useToast();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [aiSummary, setAiSummary] = useState<string | null>(initialSummary);
  const [aiItems, setAiItems] = useState<string[]>(initialActionItems);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiActiveTab, setAiActiveTab] = useState<"summary" | "actions" | null>(
    initialSummary ? "summary" : initialActionItems.length > 0 ? "actions" : null
  );
  const [showAiPanel, setShowAiPanel] = useState(
    !!initialSummary || initialActionItems.length > 0
  );

  const { isSaving, setSaving, setLastSaved, setUnsavedChanges, unsavedChanges, lastSaved } =
    useEditorStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Real autosave ──────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (currentTitle: string, currentContent: string) => {
      setSaving(true);
      try {
        await updateNoteAction(noteId, {
          title: currentTitle,
          content: currentContent,
        });
        setLastSaved(new Date());
        setUnsavedChanges(false);
      } catch {
        toast("Failed to save. Check your connection.", "error");
      } finally {
        setSaving(false);
      }
    },
    [noteId, setSaving, setLastSaved, setUnsavedChanges, toast]
  );

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (title !== initialTitle || content !== initialContent) {
      setUnsavedChanges(true);
      saveTimeoutRef.current = setTimeout(() => handleSave(title, content), 1500);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content, initialTitle, initialContent, handleSave, setUnsavedChanges]);

  // ── AI handlers ────────────────────────────────────────────────────────────
  const runAi = async (type: "summary" | "actions" | "title") => {
    if (!content.trim() || content.length < 30) {
      toast("Write at least a few sentences before using AI.", "info");
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    if (type !== "title") {
      setShowAiPanel(true);
      setAiActiveTab(type);
    }

    try {
      if (type === "summary") {
        const res = await generateAiSummary(noteId, content);
        if (res.success) {
          setAiSummary(res.data);
          toast("Summary generated!", "success");
        } else {
          setAiError(res.error);
          toast(res.error, "error");
        }
      } else if (type === "actions") {
        const res = await generateAiActionItems(noteId, content);
        if (res.success) {
          setAiItems(res.data);
          toast(`${res.data.length} action items extracted!`, "success");
        } else {
          setAiError(res.error);
          toast(res.error, "error");
        }
      } else {
        const res = await generateSuggestedTitle(content);
        if (res.success) {
          setTitle(res.data);
          toast("Title suggested — feel free to edit it.", "success");
        } else {
          toast(res.error, "error");
        }
      }
    } catch {
      const msg = "AI service unavailable. Please try again.";
      setAiError(msg);
      toast(msg, "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  // ── Delete / archive ───────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!confirm("Permanently delete this note? This cannot be undone.")) return;
    startTransition(() => {
      deleteNoteAction(noteId);
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archiveNoteAction(noteId, !isArchived);
      toast(isArchived ? "Note restored." : "Note archived.", "success");
    });
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto py-8 px-6 sm:px-12 w-full animate-in">
      {/* ── Top bar ── */}
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        {/* Save status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-[140px] h-6">
          {isSaving ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Saving…</span>
            </>
          ) : unsavedChanges ? (
            <>
              <Save size={13} />
              <span>Unsaved changes</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
              </span>
            </>
          ) : null}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => runAi("title")}
            disabled={isAiLoading || isPending}
            title="Suggest title with AI (Ctrl+Shift+T)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-xs font-medium transition-colors border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <Sparkles size={12} className="text-violet-400" />
            AI Title
          </button>

          <button
            onClick={() => {
              setShowAiPanel(!showAiPanel);
              if (!showAiPanel && !aiActiveTab) setAiActiveTab("summary");
            }}
            disabled={isAiLoading}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              showAiPanel
                ? "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400"
                : "bg-secondary/60 hover:bg-secondary border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles size={12} />
            AI Assist
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={handleArchive}
            disabled={isPending}
            title={isArchived ? "Restore note" : "Archive note"}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <Archive size={15} />
          </button>

          <button
            onClick={handleDelete}
            disabled={isPending}
            title="Delete note"
            className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ── AI Panel ── */}
      <AnimatePresence>
        {showAiPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border bg-secondary/30">
              {/* Panel header + tabs */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAiActiveTab("summary")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      aiActiveTab === "summary"
                        ? "bg-background shadow-sm text-foreground border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Sparkles size={11} className="text-violet-400" />
                    Summary
                    {aiSummary && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setAiActiveTab("actions")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      aiActiveTab === "actions"
                        ? "bg-background shadow-sm text-foreground border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Action Items
                    {aiItems.length > 0 && (
                      <span className="text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400 px-1.5 rounded-full font-semibold">
                        {aiItems.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => runAi(aiActiveTab ?? "summary")}
                    disabled={isAiLoading}
                    title="Regenerate"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors disabled:opacity-50"
                  >
                    <RotateCcw size={13} className={isAiLoading ? "animate-spin" : ""} />
                  </button>
                  <button
                    onClick={() => setShowAiPanel(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Panel body */}
              <div className="p-5 min-h-[80px]">
                {isAiLoading ? (
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground py-2">
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                    <span>Thinking…</span>
                  </div>
                ) : aiError ? (
                  <p className="text-sm text-red-500">{aiError}</p>
                ) : aiActiveTab === "summary" ? (
                  aiSummary ? (
                    <p className="text-[15px] text-foreground/90 leading-relaxed font-medium">{aiSummary}</p>
                  ) : (
                    <button
                      onClick={() => runAi("summary")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      Generate a summary of this note →
                    </button>
                  )
                ) : aiActiveTab === "actions" ? (
                  aiItems.length > 0 ? (
                    <ul className="space-y-3">
                      {aiItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-[15px] text-foreground/90 font-medium">
                          <div className="w-4 h-4 rounded border-2 border-primary/40 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <button
                      onClick={() => runAi("actions")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      Extract action items from this note →
                    </button>
                  )
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Title ── */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title…"
        aria-label="Note title"
        className="text-[2.5rem] sm:text-[3rem] font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/20 mb-6 text-foreground w-full leading-[1.1] tracking-[-0.02em]"
      />

      {/* Divider */}
      <div className="h-px bg-border mb-6" />

      {/* ── Content ── */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing… your ideas deserve a home."
        aria-label="Note content"
        className="flex-1 w-full min-h-[55vh] bg-transparent border-none outline-none resize-none text-[1.125rem] sm:text-[1.25rem] text-foreground/90 leading-[1.8] placeholder:text-muted-foreground/20 font-medium"
      />
    </div>
  );
}
