import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(255).optional().default("Untitled Note"),
  content: z.string().optional().default(""),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(255).optional(),
  content: z.string().optional(),
});

export const noteIdSchema = z.object({
  id: z.string().cuid(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
