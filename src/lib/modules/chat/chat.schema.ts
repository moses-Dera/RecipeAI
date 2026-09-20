import { z } from "zod";

export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(500),
  session_id: z.string(),
  context_recipe_id: z.number().int().positive().optional(),
  ephemeral_history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional()
});

export type ChatMessageDTO = z.infer<typeof ChatMessageSchema>;
