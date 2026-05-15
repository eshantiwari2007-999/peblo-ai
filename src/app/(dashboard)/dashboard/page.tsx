import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileText, Sparkles, Tags, Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Parallel data fetching for performance
  const [
    totalNotes,
    archivedNotes,
    notesWithSummary,
    tagsCount,
    aiUsageCount,
    recentActivity,
    recentNotes,
  ] = await Promise.all([
    prisma.note.count({ where: { userId, isArchived: false } }),
    prisma.note.count({ where: { userId, isArchived: true } }),
    prisma.note.count({ where: { userId, summary: { not: null } } }),
    prisma.tag.count(),
    prisma.aiUsageLog.count({ where: { userId } }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { note: { select: { id: true, title: true } } },
    }),
    prisma.note.findMany({
      where: { userId, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: { id: true, title: true, summary: true, updatedAt: true },
    }),
  ]);

  const aiCoveragePercent =
    totalNotes > 0 ? Math.round((notesWithSummary / totalNotes) * 100) : 0;

  const actionLabels: Record<string, string> = {
    note_created: "Created a note",
    note_deleted: "Deleted a note",
    note_archived: "Archived a note",
    note_restored: "Restored a note",
    note_updated: "Updated a note",
  };

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto animate-in">
      {/* ── Header ── */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
            ? "afternoon"
            : "evening"}
          , {session.user.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s a snapshot of your knowledge base.
        </p>
      </header>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FileText size={16} />}
          label="Active Notes"
          value={totalNotes}
          sub={`${archivedNotes} archived`}
          color="blue"
        />
        <StatCard
          icon={<Sparkles size={16} />}
          label="AI Summaries"
          value={notesWithSummary}
          sub={`${aiCoveragePercent}% coverage`}
          color="violet"
        />
        <StatCard
          icon={<Zap size={16} />}
          label="AI Actions"
          value={aiUsageCount}
          sub="total AI requests"
          color="amber"
        />
        <StatCard
          icon={<Tags size={16} />}
          label="Global Tags"
          value={tagsCount}
          sub="across all notes"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Recent Notes ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Notes</h2>
            <Link
              href="/notes"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all →
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="rounded-2xl border border-border border-dashed p-10 text-center">
              <FileText size={28} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No notes yet</p>
              <p className="text-xs text-muted-foreground">
                Click &quot;New Note&quot; in the sidebar to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    {note.summary ? (
                      <Sparkles size={14} className="text-violet-400" />
                    ) : (
                      <FileText size={14} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {note.title || "Untitled"}
                    </p>
                    {note.summary && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {note.summary}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 mt-0.5">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Activity Feed ── */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>

          {recentActivity.length === 0 ? (
            <div className="rounded-2xl border border-border border-dashed p-8 text-center">
              <Clock size={22} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/80">
                      {actionLabels[log.action] ?? log.action}
                      {log.note && (
                        <Link
                          href={`/notes/${log.note.id}`}
                          className="ml-1 font-medium text-foreground hover:underline"
                        >
                          &ldquo;{log.note.title}&rdquo;
                        </Link>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── AI Coverage Bar ── */}
          {totalNotes > 0 && (
            <div className="mt-6 p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">AI Coverage</span>
                <span className="text-xs text-muted-foreground">{aiCoveragePercent}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${aiCoveragePercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {notesWithSummary} of {totalNotes} notes have AI summaries
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card Component ───────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  color: "blue" | "violet" | "amber" | "emerald";
}) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
