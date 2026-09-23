import { z } from "zod";

export const SystemSettingsSchema = z.object({
  provider: z.enum(["gemini", "ollama", "nvidia", "custom"]),
  baseUrl: z.string().optional().or(z.literal("")),
  modelName: z.string().optional(),
  apiKey: z.string().optional(),
});

export type SystemSettingsDTO = z.infer<typeof SystemSettingsSchema>;
