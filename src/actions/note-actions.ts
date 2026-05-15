"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateNoteSchema } from "@/lib/validations/notes";
import { Prisma } from "@prisma/client";

// ── Helpers ───────────────────────────────────────────────────────────────────
async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

async function requireOwnership(noteId: string) {
  const userId = await requireAuth();
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true },
  });
  if (!note || note.userId !== userId) throw new Error("Not found or access denied");
  return userId;
}

async function logActivity(
  userId: string,
  action: string,
  noteId?: string,
  metadata?: Prisma.InputJsonValue
) {
  await prisma.activityLog.create({
    data: { userId, noteId, action, metadata },
  });
}


// ── Update note content/title (autosave) ─────────────────────────────────────
export async function updateNoteAction(
  id: string,
  data: { title?: string; content?: string }
) {
  await requireOwnership(id);

  // Validate input
  const validated = updateNoteSchema.safeParse(data);
  if (!validated.success) {
    throw new Error("Invalid note data: " + validated.error.issues[0]?.message);
  }

  await prisma.note.update({
    where: { id },
    data: validated.data,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${id}`);
  revalidatePath("/notes");
}

// ── Create new note, then redirect to it ─────────────────────────────────────
export async function createNoteAction() {
  const userId = await requireAuth();

  const note = await prisma.note.create({
    data: {
      title: "Untitled Note",
      content: "",
      userId,
    },
  });

  await logActivity(userId, "note_created", note.id);

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  redirect(`/notes/${note.id}`);
}

// ── Delete note ───────────────────────────────────────────────────────────────
export async function deleteNoteAction(noteId: string) {
  const userId = await requireOwnership(noteId);

  await prisma.note.delete({ where: { id: noteId } });

  await logActivity(userId, "note_deleted");

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  redirect("/notes");
}

// ── Archive / restore note ───────────────────────────────────────────────────
export async function archiveNoteAction(noteId: string, isArchived: boolean) {
  const userId = await requireOwnership(noteId);

  await prisma.note.update({
    where: { id: noteId },
    data: { isArchived },
  });

  await logActivity(userId, isArchived ? "note_archived" : "note_restored", noteId);

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath(`/notes/${noteId}`);
}
