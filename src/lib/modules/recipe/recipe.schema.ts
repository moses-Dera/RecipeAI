import { z } from "zod";

export const CreateRecipeSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title too long"),
  ingredients: z.string(), // JSON string
  steps: z.string(), // JSON string
  nutrition: z.string().optional(), // JSON array of benefit strings
  region: z.string().max(100).optional(),
  image_url: z.string().optional(),
  prep_time_min: z.number().int().positive().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  meal_type: z.array(z.string()).min(1, "At least one meal type is required"),
  occasion: z.array(z.string()).min(1, "At least one occasion is required"),
  is_private: z.boolean().default(true),
});

export type CreateRecipeDTO = z.infer<typeof CreateRecipeSchema>;

export const UpdateRecipeSchema = CreateRecipeSchema.partial();

export type UpdateRecipeDTO = z.infer<typeof UpdateRecipeSchema>;

// Pagination params
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});
