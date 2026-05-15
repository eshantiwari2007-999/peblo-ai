import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ShareButton } from "@/components/notes/share-button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: note?.title ? `Editing: ${note.title}` : "Note Editor" };
}

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      title: true,
      content: true,
      isPublic: true,
      isArchived: true,
      shareToken: true,
      summary: true,
      actionItems: true,
    },
  });

  if (!note) notFound();

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {note.isArchived && (
            <span className="text-xs font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              Archived
            </span>
          )}
        </div>
        <ShareButton
          noteId={note.id}
          initialIsPublic={note.isPublic}
          initialShareToken={note.shareToken}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <RichTextEditor
          noteId={note.id}
          initialTitle={note.title}
          initialContent={note.content ?? ""}
          initialSummary={note.summary ?? null}
          initialActionItems={note.actionItems ?? []}
          isArchived={note.isArchived}
        />
      </div>
    </div>
  );
}
