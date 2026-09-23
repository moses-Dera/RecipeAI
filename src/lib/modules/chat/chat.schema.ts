import { z } from "zod";

export const ChatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  session_id: z.string(),
  context: z.object({
    currentPath: z.string().optional(),
  }).optional(),
});

export type ChatMessageDTO = z.infer<typeof ChatMessageSchema>;
