"use server";

import { getGeminiModel } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────────────────────────────
type AiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ── Helper: verify ownership before AI ops ────────────────────────────────────
async function requireNoteOwnership(noteId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true },
  });

  if (!note || note.userId !== session.user.id) {
    throw new Error("Note not found or access denied");
  }

  return session.user.id;
}

// ── Helper: log AI usage and return token estimate ───────────────────────────
async function logAiUsage(
  userId: string,
  actionType: "GENERATE_SUMMARY" | "EXTRACT_ACTION_ITEMS" | "SUGGEST_TITLE" | "CHAT_ASSISTANT",
  promptLength: number
) {
  // Rough token estimate: ~4 chars per token
  const tokensUsed = Math.ceil(promptLength / 4);
  await prisma.aiUsageLog.create({
    data: { userId, actionType, tokensUsed, modelUsed: "gemini-1.5-flash" },
  });
  return tokensUsed;
}

// ── Helper: call Gemini with simple retry ────────────────────────────────────
async function callGeminiWithRetry(
  prompt: string,
  maxRetries = 2
): Promise<string> {
  const model = getGeminiModel();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries) {
        // Exponential back-off: 500ms, 1000ms
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError ?? new Error("AI service unavailable");
}

// ── Generate Summary ──────────────────────────────────────────────────────────
export async function generateAiSummary(
  noteId: string,
  content: string
): Promise<AiResult<string>> {
  try {
    const userId = await requireNoteOwnership(noteId);

    if (!content.trim() || content.length < 30) {
      return { success: false, error: "Note is too short to summarize." };
    }

    const prompt = `You are a professional note summarizer. Analyze the following notes and provide a concise, insightful summary in 2-3 clear sentences. Focus on the core ideas, decisions, and outcomes. Do not add preamble like "This note discusses..." — jump straight into the summary.

Notes:
${content.slice(0, 8000)}`;

    const summary = await callGeminiWithRetry(prompt);
    await logAiUsage(userId, "GENERATE_SUMMARY", prompt.length);

    await prisma.note.update({
      where: { id: noteId, userId },
      data: { summary },
    });

    revalidatePath(`/notes/${noteId}`);
    return { success: true, data: summary };
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    return { success: false, error: "Failed to generate summary. Please try again." };
  }
}

// ── Extract Action Items ──────────────────────────────────────────────────────
export async function generateAiActionItems(
  noteId: string,
  content: string
): Promise<AiResult<string[]>> {
  try {
    const userId = await requireNoteOwnership(noteId);

    if (!content.trim() || content.length < 30) {
      return { success: false, error: "Note is too short to extract action items." };
    }

    const prompt = `Analyze the following notes and extract a list of actionable tasks or follow-up items.
Return ONLY a valid JSON array of strings. Each string should be a single, concrete action item starting with a verb.
If there are no action items, return an empty array: [].
Do NOT include markdown code fences, explanations, or any other text outside the JSON array.

Notes:
${content.slice(0, 8000)}`;

    const rawText = await callGeminiWithRetry(prompt);
    await logAiUsage(userId, "EXTRACT_ACTION_ITEMS", prompt.length);

    // Robust parsing: strip any markdown fences if model added them
    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let actionItems: string[] = [];
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        actionItems = parsed.filter((i) => typeof i === "string" && i.trim().length > 0);
      }
    } catch {
      // Graceful fallback: split by newlines / bullet points
      actionItems = cleaned
        .split(/\n/)
        .map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim())
        .filter((l) => l.length > 0)
        .slice(0, 15);
    }

    await prisma.note.update({
      where: { id: noteId, userId },
      data: { actionItems },
    });

    revalidatePath(`/notes/${noteId}`);
    return { success: true, data: actionItems };
  } catch (error) {
    console.error("AI Action Items generation failed:", error);
    return { success: false, error: "Failed to extract action items. Please try again." };
  }
}

// ── Suggest Title ─────────────────────────────────────────────────────────────
export async function generateSuggestedTitle(
  content: string
): Promise<AiResult<string>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (!content.trim() || content.length < 20) {
      return { success: false, error: "Write more content before suggesting a title." };
    }

    const prompt = `Read the following notes and suggest one clear, concise, and professional title.
Requirements:
- Maximum 8 words
- Do NOT use quotes, punctuation at the end, or markdown
- Return ONLY the title, nothing else

Notes:
${content.slice(0, 4000)}`;

    const rawTitle = await callGeminiWithRetry(prompt);
    await logAiUsage(session.user.id, "SUGGEST_TITLE", prompt.length);

    // Strip any leading/trailing quotes the model might have added
    const title = rawTitle.replace(/^["'`]+|["'`]+$/g, "").trim();

    return { success: true, data: title };
  } catch (error) {
    console.error("AI Title generation failed:", error);
    return { success: false, error: "Failed to suggest a title. Please try again." };
  }
}
