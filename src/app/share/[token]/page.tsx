import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Sparkles, CheckSquare, Clock, ArrowLeft } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";

// ─── Data layer ───────────────────────────────────────────────────────────────
async function getNoteByToken(token: string) {
  return prisma.note.findUnique({
    where: { shareToken: token },
    include: {
      user: { select: { name: true } },
      tags: { select: { name: true } },
      category: { select: { name: true } },
    },
  });
}

// ─── SEO: Dynamic Open Graph metadata ────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const note = await getNoteByToken(token);
  if (!note) return { title: "Note not found" };
  return {
    title: note.title,
    description: note.summary ?? `A note shared via Peblo by ${note.user.name}.`,
    openGraph: {
      title: note.title,
      description: note.summary ?? undefined,
      type: "article",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const note = await getNoteByToken(token);

  // Guard: note not found OR owner has disabled sharing since the link was sent
  if (!note || !note.isPublic) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal top bar */}
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Peblo
          </Link>
          <span className="text-xs text-muted-foreground font-medium px-2.5 py-1 rounded-full bg-secondary border border-border">
            Read-only
          </span>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto py-16 px-6 sm:px-12 animate-in">
        {/* Header */}
        <header className="mb-12">
          {/* Breadcrumb: Category */}
          {note.category && (
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              {note.category.name}
            </p>
          )}

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
            {note.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
                {note.user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <span className="font-medium text-foreground">{note.user.name ?? "Anonymous"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              <span>Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
            </div>

            <span className="text-muted-foreground/50 hidden sm:inline">
              {format(new Date(note.createdAt), "MMM d, yyyy")}
            </span>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="px-2.5 py-0.5 text-xs font-medium bg-secondary rounded-full border border-border"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* AI Summary card */}
        {note.summary && (
          <div className="mb-10 p-6 rounded-2xl border border-border bg-secondary/20 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-indigo-500" />
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                  AI Summary
                </span>
              </div>
              <p className="text-foreground/90 leading-relaxed">{note.summary}</p>
            </div>
          </div>
        )}

        {/* Note body */}
        <div className="whitespace-pre-wrap text-lg text-foreground/90 leading-[1.8] font-sans break-words mb-16">
          {note.content || (
            <span className="italic text-muted-foreground">This note has no content yet.</span>
          )}
        </div>

        {/* Action items */}
        {note.actionItems && note.actionItems.length > 0 && (
          <div className="mt-8 pt-10 border-t border-border">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-6">
              <CheckSquare size={20} className="text-primary" />
              Action Items
            </h2>
            <ul className="space-y-3">
              {note.actionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <div className="w-5 h-5 rounded border border-border flex-shrink-0 mt-0.5 group-hover:border-primary transition-colors" />
                  <span className="text-foreground/90 text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer attribution */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Shared via{" "}
            <Link href="/" className="text-foreground font-medium hover:underline">
              Peblo
            </Link>{" "}
            — AI-powered notes workspace
          </p>
        </footer>
      </article>
    </div>
  );
}
