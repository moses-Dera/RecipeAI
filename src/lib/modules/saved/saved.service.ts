import { savedRepository } from "./saved.repository";
import { CreateSavedRecipeDTO, CreateSavedRecipeSchema } from "./saved.schema";

export class SavedService {
  async getUserSavedRecipes(userId: number) {
    return savedRepository.getSavedRecipes(userId);
  }

  async saveRecipe(userId: number, data: CreateSavedRecipeDTO) {
    const validated = CreateSavedRecipeSchema.parse(data);
    try {
      return await savedRepository.saveRecipe(userId, validated.recipe_id, validated.notes, validated.collection_id);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error("ALREADY_SAVED");
      }
      throw error;
    }
  }

  async unsaveRecipe(userId: number, saveId: number) {
    const result = await savedRepository.removeSavedRecipe(userId, saveId);
    if (result.count === 0) throw new Error("NOT_FOUND");
    return { success: true };
  }
}

export const savedService = new SavedService();
