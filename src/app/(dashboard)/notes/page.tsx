import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotesList } from "@/components/notes/notes-list";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;

  // Parse search params safely
  const query = typeof sp?.q === "string" ? sp.q : undefined;
  const tagFilter = typeof sp?.tag === "string" ? sp.tag : undefined;
  const isArchived = sp?.archived === "true";
  const sortBy = typeof sp?.sort === "string" ? sp.sort : "updatedAt_desc";

  // Build Prisma Where Clause dynamically
  const where: Prisma.NoteWhereInput = {
    userId: session.user.id,
    isArchived,
  };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ];
  }

  if (tagFilter) {
    where.tags = { some: { name: tagFilter } };
  }

  // Build Prisma OrderBy dynamically
  let orderBy: Prisma.NoteOrderByWithRelationInput = { updatedAt: "desc" };
  if (sortBy === "updatedAt_asc") orderBy = { updatedAt: "asc" };
  if (sortBy === "createdAt_desc") orderBy = { createdAt: "desc" };
  if (sortBy === "title_asc") orderBy = { title: "asc" };

  const notes = await prisma.note.findMany({
    where,
    orderBy,
    include: { tags: true, category: true },
  });

  return (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {isArchived ? "Archived Notes" : "Your Notes"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isArchived
            ? "Notes you've archived are stored here."
            : "Capture your ideas, organized intelligently."}
        </p>
      </header>

      <div className="flex-1 overflow-hidden">
        <NotesList initialNotes={notes} isArchived={isArchived} />
      </div>
    </div>
  );
}

