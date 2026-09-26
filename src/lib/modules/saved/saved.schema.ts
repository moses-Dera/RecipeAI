import { z } from "zod";

export const CreateSavedRecipeSchema = z.object({
  recipe_id: z.number().int().positive(),
  collection_id: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export type CreateSavedRecipeDTO = z.infer<typeof CreateSavedRecipeSchema>;
