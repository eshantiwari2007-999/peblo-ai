"use client";

import { useState, useTransition } from "react";
import { Globe, Lock, Copy, Check, Loader2, ExternalLink } from "lucide-react";
import { toggleNoteShareAction } from "@/actions/share-actions";

interface ShareButtonProps {
  noteId: string;
  initialIsPublic: boolean;
  initialShareToken: string | null;
}

export function ShareButton({ noteId, initialIsPublic, initialShareToken }: ShareButtonProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPanel, setShowPanel] = useState(false);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`
    : null;

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleNoteShareAction(noteId);
        setIsPublic(result.isPublic);
        setShareToken(result.shareToken);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border transition-all ${
          isPublic
            ? "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900 dark:text-green-400"
            : "bg-card text-muted-foreground border-border hover:bg-secondary/50"
        }`}
        aria-label="Share options"
      >
        {isPublic ? <Globe size={15} /> : <Lock size={15} />}
        <span>{isPublic ? "Public" : "Private"}</span>
      </button>

      {/* Share panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setShowPanel(false)} />

          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl p-5 z-20 animate-in">
            <h3 className="font-semibold text-foreground mb-1">Share this note</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {isPublic
                ? "Anyone with the link can read this note."
                : "Only you can see this note right now."}
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border mb-4">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Globe size={16} className="text-green-500" />
                ) : (
                  <Lock size={16} className="text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {isPublic ? "Public link enabled" : "Link sharing off"}
                </span>
              </div>
              <button
                onClick={handleToggle}
                disabled={isPending}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isPublic ? "bg-green-500" : "bg-border"
                } disabled:opacity-60`}
                role="switch"
                aria-checked={isPublic}
              >
                {isPending ? (
                  <Loader2 size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-spin" />
                ) : (
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      isPublic ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                )}
              </button>
            </div>

            {/* Share URL */}
            {isPublic && shareUrl && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-background rounded-xl border border-border">
                  <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
                    {shareUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-secondary transition-colors"
                    aria-label="Copy link"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} className="text-muted-foreground" />
                    )}
                  </button>
                </div>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink size={12} />
                  Open public view
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
