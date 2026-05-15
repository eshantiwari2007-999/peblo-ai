"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * Toggles public sharing for a note.
 * - If enabling: generates a cryptographically secure random shareToken.
 * - If disabling: nullifies the token, invalidating any previously shared links.
 *
 * Security: We verify ownership BEFORE any mutation, preventing IDOR attacks.
 */
export async function toggleNoteShareAction(noteId: string): Promise<{
  isPublic: boolean;
  shareToken: string | null;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Verify the note belongs to this user — never trust client input alone
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true, isPublic: true },
  });

  if (!note || note.userId !== session.user.id) {
    throw new Error("Not found or access denied");
  }

  const enabling = !note.isPublic;

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: {
      isPublic: enabling,
      // Generate a 32-byte random hex token (64 chars). Null it on disable
      // so previously distributed links immediately stop working.
      shareToken: enabling ? crypto.randomBytes(32).toString("hex") : null,
    },
    select: { isPublic: true, shareToken: true },
  });

  revalidatePath(`/notes/${noteId}`);
  return updated;
}
